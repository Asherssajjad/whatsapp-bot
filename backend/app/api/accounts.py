"""
User: list own WhatsApp accounts (assigned by admin).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.whatsapp import WhatsAppAccount
from app.schemas.whatsapp import WhatsAppAccountResponse

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("/whatsapp", response_model=list[WhatsAppAccountResponse])
async def list_my_whatsapp_accounts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(WhatsAppAccount).where(
            WhatsAppAccount.user_id == current_user.id,
            WhatsAppAccount.is_active == True,
        )
    )
    accounts = result.scalars().all()
    return [WhatsAppAccountResponse.model_validate(a) for a in accounts]
