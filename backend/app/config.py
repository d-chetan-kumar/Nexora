import base64
import json
import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="postgresql+asyncpg://localhost/nexora")
    FIREBASE_SERVICE_ACCOUNT_JSON: str = Field(default="")
    ALLOWED_ORIGIN: str = Field(default="http://localhost:5173")

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def force_asyncpg_driver(cls, v: str) -> str:
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+asyncpg://", 1)
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def get_firebase_credentials(self) -> dict:
        """
        Parses the Firebase service account JSON.
        Supports:
        1. Base64 encoded JSON string
        2. Direct JSON string
        3. Local fallback file 'firebase-service-account.json'
        """
        if not self.FIREBASE_SERVICE_ACCOUNT_JSON:
            # Fallback for local development
            local_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "firebase-service-account.json")
            if os.path.exists(local_path):
                with open(local_path, "r") as f:
                    return json.load(f)
            # Try root folder fallback
            root_fallback = "firebase-service-account.json"
            if os.path.exists(root_fallback):
                with open(root_fallback, "r") as f:
                    return json.load(f)
            raise ValueError("FIREBASE_SERVICE_ACCOUNT_JSON env var is not set and firebase-service-account.json was not found")

        # Try base64 decoding
        try:
            decoded_bytes = base64.b64decode(self.FIREBASE_SERVICE_ACCOUNT_JSON)
            return json.loads(decoded_bytes.decode("utf-8"))
        except Exception:
            # If base64 fails, assume it is direct JSON string
            try:
                return json.loads(self.FIREBASE_SERVICE_ACCOUNT_JSON)
            except Exception as e:
                raise ValueError(f"Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: {e}")

settings = Settings()
