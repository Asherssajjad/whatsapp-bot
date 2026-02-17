"""
Application configuration loaded from environment variables.
Used for database, JWT, WhatsApp, OpenAI, and email settings.
"""
import os
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


def _get_database_url() -> str:
    """Railway may expose PostgreSQL as DATABASE_URL, DATABASE_PRIVATE_URL, or POSTGRES_URL."""
    for name in ("DATABASE_URL", "DATABASE_PRIVATE_URL", "POSTGRES_URL"):
        val = os.environ.get(name)
        if val and not val.strip().startswith("$"):  # skip unresolved refs like ${{Postgres.DATABASE_URL}}
            return val
    return "postgresql+asyncpg://localhost/whatsapp_saas"


class Settings(BaseSettings):
    # Database (Railway: add reference to PostgreSQL → DATABASE_URL or DATABASE_PRIVATE_URL)
    database_url: str = "postgresql+asyncpg://localhost/whatsapp_saas"
    sync_database_url: str | None = None  # Optional; if unset, derived from database_url

    @field_validator("database_url", mode="before")
    @classmethod
    def resolve_database_url(cls, v: str | None) -> str:
        resolved = _get_database_url()
        if "localhost" not in resolved and "127.0.0.1" not in resolved:
            return resolved
        return v or resolved

    @property
    def sync_database_url_resolved(self) -> str:
        """Sync URL for Alembic (postgresql:// not postgresql+asyncpg://)."""
        if self.sync_database_url:
            return self.sync_database_url
        return self.database_url.replace("postgresql+asyncpg://", "postgresql://", 1)

    # JWT
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    # WhatsApp Cloud API
    whatsapp_verify_token: str = "my-verify-token"

    # OpenAI
    openai_api_key: str = ""

    # App
    app_url: str = "http://localhost:8000"

    # Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@example.com"

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Optional: create admin on startup if set (e.g. ADMIN_EMAIL=ashersajjad98@gmail.com, ADMIN_PASSWORD=yourpass)
    admin_email: str = ""
    admin_password: str = ""

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
