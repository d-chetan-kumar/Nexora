from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator
from app.config import settings

# Create async engine. For asyncpg, DATABASE_URL must start with postgresql+asyncpg://
from urllib.parse import urlparse, urlunparse

db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)

parsed = urlparse(db_url)
connect_args = {}
if parsed.query and ("ssl" in parsed.query or "sslmode" in parsed.query):
    connect_args["ssl"] = True

cleaned_db_url = urlunparse((
    parsed.scheme,
    parsed.netloc,
    parsed.path,
    parsed.params,
    '',
    parsed.fragment
))

engine = create_async_engine(
    cleaned_db_url,
    pool_pre_ping=True,
    future=True,
    connect_args=connect_args
)

SessionLocal = async_sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
