import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator

class Settings(BaseSettings):
    DATABASE_URL: str = Field(default="postgresql+asyncpg://localhost/nexora")
    ALLOWED_ORIGIN: str = Field(default="http://localhost:5173")

    # JWT Config
    JWT_SECRET: str = Field(default="super_secret_dev_key_change_in_production_12345")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=15)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    # Backblaze B2 Config
    B2_ENDPOINT: str = Field(default="https://s3.us-east-005.backblazeb2.com")
    B2_KEY_ID: str = Field(default="")
    B2_APP_KEY: str = Field(default="")
    B2_BUCKET: str = Field(default="nexorav1")

    # IDrive e2 Config
    E2_ENDPOINT: str = Field(default="https://s3.ap-northeast-1.idrivee2.com")
    E2_KEY_ID: str = Field(default="")
    E2_APP_KEY: str = Field(default="")
    E2_BUCKET: str = Field(default="nexorav1")

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

settings = Settings()
