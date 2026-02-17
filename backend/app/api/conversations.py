"""
User: list conversations, get one with messages, search & filter.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.message import Conversation, Message
from app.schemas.message import ConversationResponse, MessageResponse

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationResponse])
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: str | None = Query(None),
    stage: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    q = select(Conversation).where(Conversation.user_id == current_user.id)
    if search:
        q = q.where(Conversation.wa_phone.contains(search))
    if stage:
        q = q.where(Conversation.current_stage == stage)
    q = q.order_by(Conversation.updated_at.desc()).offset(skip).limit(limit)
    result = await db.execute(q)
    convs = result.scalars().all()
    return [ConversationResponse.model_validate(c) for c in convs]


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        from fastapi import HTTPException
        raise HTTPException(404, "Conversation not found")
    # Load messages
    msg_result = await db.execute(
        select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at)
    )
    conv.messages = msg_result.scalars().all()
    return ConversationResponse.model_validate(conv)
