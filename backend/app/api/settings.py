"""
User: get/update conversation flow messages and AI fallback per stage.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.conversation import ConversationConfig
from app.schemas.conversation import ConversationConfigResponse, ConversationConfigUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/conversation-flow", response_model=ConversationConfigResponse)
async def get_conversation_flow(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ConversationConfig).where(ConversationConfig.user_id == current_user.id))
    config = result.scalar_one_or_none()
    if not config:
        config = ConversationConfig(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
        )
        db.add(config)
        await db.flush()
    return ConversationConfigResponse.model_validate(config)


@router.patch("/conversation-flow", response_model=ConversationConfigResponse)
async def update_conversation_flow(
    data: ConversationConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ConversationConfig).where(ConversationConfig.user_id == current_user.id))
    config = result.scalar_one_or_none()
    if not config:
        config = ConversationConfig(id=str(uuid.uuid4()), user_id=current_user.id)
        db.add(config)
        await db.flush()
    update = data.model_dump(exclude_unset=True)
    for k, v in update.items():
        setattr(config, k, v)
    await db.flush()
    await db.refresh(config)
    return ConversationConfigResponse.model_validate(config)
