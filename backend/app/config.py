"""
Application configuration loaded from environment variables.
Used for database, JWT, WhatsApp, OpenAI, and email settings.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database (Railway sets DATABASE_URL)
    database_url: str = "postgresql+asyncpg://localhost/whatsapp_saas"
    sync_database_url: str | None = None  # Optional; if unset, derived from database_url

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

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
