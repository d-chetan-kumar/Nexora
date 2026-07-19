import boto3
from abc import ABC, abstractmethod
from typing import BinaryIO
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.config import settings
from app.models import PoolUsage

class StorageProvider(ABC):
    name: str
    FREE_TIER_LIMIT: int

    @abstractmethod
    def save_file(self, key: str, content: BinaryIO) -> str:
        """Saves a binary stream to the bucket and returns the object key."""
        pass

    @abstractmethod
    def get_file_stream(self, key: str) -> BinaryIO:
        """Returns the streaming body of the object from the bucket."""
        pass

    @abstractmethod
    def delete_file(self, key: str) -> bool:
        """Deletes the object from the bucket."""
        pass

    def remaining_capacity_bytes(self, db: Session) -> int:
        """Looks up persistent database record of pool utilization to avoid live S3 list calls."""
        row = db.query(PoolUsage).filter_by(backend=self.name).first()
        if not row:
            row = PoolUsage(backend=self.name, used_bytes=0)
            db.add(row)
            db.flush()
        return max(0, self.FREE_TIER_LIMIT - row.used_bytes)

class B2Provider(StorageProvider):
    name = "b2"
    FREE_TIER_LIMIT = 10 * 1024 ** 3  # 10 GB

    def __init__(self):
        # boto3 client initialization.
        # If credentials are not provided, it falls back to a dummy client for non-blocking local runs
        if settings.B2_KEY_ID and settings.B2_APP_KEY:
            self.client = boto3.client(
                "s3",
                endpoint_url=settings.B2_ENDPOINT,
                aws_access_key_id=settings.B2_KEY_ID,
                aws_secret_access_key=settings.B2_APP_KEY,
            )
        else:
            self.client = None
        self.bucket = settings.B2_BUCKET

    def save_file(self, key: str, content: BinaryIO) -> str:
        if not self.client:
            logger_dummy_upload(self.name, key)
            return key
        self.client.upload_fileobj(content, self.bucket, key)
        return key

    def get_file_stream(self, key: str) -> BinaryIO:
        if not self.client:
            raise HTTPException(status_code=501, detail="B2 storage client is not configured locally.")
        return self.client.get_object(Bucket=self.bucket, Key=key)["Body"]

    def delete_file(self, key: str) -> bool:
        if not self.client:
            return True
        self.client.delete_object(Bucket=self.bucket, Key=key)
        return True

class E2Provider(StorageProvider):
    name = "e2"
    FREE_TIER_LIMIT = 10 * 1024 ** 3  # 10 GB

    def __init__(self):
        if settings.E2_KEY_ID and settings.E2_APP_KEY:
            self.client = boto3.client(
                "s3",
                endpoint_url=settings.E2_ENDPOINT,
                aws_access_key_id=settings.E2_KEY_ID,
                aws_secret_access_key=settings.E2_APP_KEY,
            )
        else:
            self.client = None
        self.bucket = settings.E2_BUCKET

    def save_file(self, key: str, content: BinaryIO) -> str:
        if not self.client:
            logger_dummy_upload(self.name, key)
            return key
        self.client.upload_fileobj(content, self.bucket, key)
        return key

    def get_file_stream(self, key: str) -> BinaryIO:
        if not self.client:
            raise HTTPException(status_code=501, detail="IDrive e2 storage client is not configured locally.")
        return self.client.get_object(Bucket=self.bucket, Key=key)["Body"]

    def delete_file(self, key: str) -> bool:
        if not self.client:
            return True
        self.client.delete_object(Bucket=self.bucket, Key=key)
        return True

class PooledStorageRouter:
    def __init__(self, providers: list[StorageProvider]):
        self.providers = providers

    def pick_provider(self, file_size: int, db: Session) -> StorageProvider:
        """Finds providers with enough storage and returns the one with the most remaining capacity."""
        candidates = [p for p in self.providers if p.remaining_capacity_bytes(db) >= file_size]
        if not candidates:
            raise HTTPException(
                status_code=status.HTTP_507_INSUFFICIENT_STORAGE,
                detail="All pooled free tier storage backends (B2 & e2) are fully exhausted."
            )
        return max(candidates, key=lambda p: p.remaining_capacity_bytes(db))

def logger_dummy_upload(provider: str, key: str):
    import logging
    logger = logging.getLogger("storage")
    logger.warning(f"[MOCK STORAGE] Uploaded file to {provider} pool under key: {key} (real cloud upload skipped due to missing keys)")

# Instantiate router
storage_router = PooledStorageRouter([B2Provider(), E2Provider()])
