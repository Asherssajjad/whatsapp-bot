"""Create admin user on startup if ADMIN_EMAIL and ADMIN_PASSWORD are set."""
import uuid
from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.conversation import ConversationConfig
from app.core.security import get_password_hash
from app.config import settings


async def ensure_admin_from_env() -> None:
    if not settings.admin_email or not settings.admin_password:
        return
    async with AsyncSessionLocal() as session:
        try:
            result = await session.execute(select(User).where(User.email == settings.admin_email))
            if result.scalar_one_or_none():
                return  # Admin already exists
            user = User(
                id=str(uuid.uuid4()),
                email=settings.admin_email,
                hashed_password=get_password_hash(settings.admin_password),
                full_name=None,
                role=UserRole.ADMIN,
                is_active=True,
            )
            session.add(user)
            await session.flush()
            config = ConversationConfig(id=str(uuid.uuid4()), user_id=user.id)
            session.add(config)
            await session.commit()
        except Exception:
            await session.rollback()
            raise
