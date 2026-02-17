"""
Admin: user management, assign WhatsApp tokens, usage, webhook logs, default templates.
"""
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import uuid

from app.database import get_db
from app.models.message import Conversation
from app.core.deps import get_current_admin
from app.models.user import User, UserRole
from app.models.whatsapp import WhatsAppAccount, WebhookLog
from app.models.lead import Lead
from app.models.message import Message
from app.models.conversation import ConversationConfig
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.schemas.whatsapp import WhatsAppAccountResponse, WebhookLogResponse
from app.core.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
):
    result = await db.execute(select(User).where(User.role == UserRole.USER).offset(skip).limit(limit))
    return [UserResponse.model_validate(u) for u in result.scalars().all()]


@router.post("/users", response_model=UserResponse)
async def create_user(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
  admin: User = Depends(get_current_admin),
):
    from fastapi import HTTPException
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(400, "Email already registered")
    user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        role=UserRole.USER,
    )
    db.add(user)
    await db.flush()
    config = ConversationConfig(id=str(uuid.uuid4()), user_id=user.id)
    db.add(config)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    from fastapi import HTTPException
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.is_active is not None:
        user.is_active = data.is_active
    await db.flush()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.get("/usage")
async def usage(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
    user_id: str | None = Query(None),
):
    """Messages sent and leads captured per user."""
    if user_id:
        msg_count = await db.execute(
            select(func.count(Message.id))
            .select_from(Message)
            .join(Conversation, Message.conversation_id == Conversation.id)
            .where(Message.direction == "outbound", Conversation.user_id == user_id)
        )
        lead_count = await db.execute(select(func.count(Lead.id)).where(Lead.user_id == user_id))
        return {"user_id": user_id, "messages_sent": msg_count.scalar() or 0, "leads_captured": lead_count.scalar() or 0}
    # All users summary
    lead_result = await db.execute(select(Lead.user_id, func.count(Lead.id)).group_by(Lead.user_id))
    leads_map = {r[0]: r[1] for r in lead_result.all()}
    msg_result = await db.execute(
        select(Conversation.user_id, func.count(Message.id)).select_from(Message).join(
            Conversation, Message.conversation_id == Conversation.id
        ).where(Message.direction == "outbound").group_by(Conversation.user_id)
    )
    msg_map = {r[0]: r[1] for r in msg_result.all()}
    user_ids = set(leads_map) | set(msg_map)
    return {
        "users": [
            {"user_id": uid, "messages_sent": msg_map.get(uid, 0), "leads_captured": leads_map.get(uid, 0)}
            for uid in user_ids
        ]
    }


class AssignWhatsAppBody(BaseModel):
    user_id: str
    phone_number_id: str
    phone_number: str
    access_token: str
    business_account_id: str | None = None


@router.post("/whatsapp-accounts")
async def assign_whatsapp(
    body: AssignWhatsAppBody,
  db: AsyncSession = Depends(get_db),
  admin: User = Depends(get_current_admin),
):
    from fastapi import HTTPException
    user_id = body.user_id
    phone_number_id = body.phone_number_id
    phone_number = body.phone_number
    access_token = body.access_token
    business_account_id = body.business_account_id
    result = await db.execute(select(User).where(User.id == user_id))
    if not result.scalar_one_or_none():
        raise HTTPException(404, "User not found")
    acc = WhatsAppAccount(
        id=str(uuid.uuid4()),
        user_id=user_id,
        phone_number_id=phone_number_id,
        phone_number=phone_number,
        access_token=access_token,
        business_account_id=business_account_id or None,
    )
    db.add(acc)
    await db.commit()
    return {"id": acc.id, "phone_number": acc.phone_number}


@router.get("/webhook-logs", response_model=list[WebhookLogResponse])
async def webhook_logs(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
    limit: int = Query(100, ge=1, le=500),
):
    result = await db.execute(
        select(WebhookLog).order_by(WebhookLog.created_at.desc()).limit(limit)
    )
    return [WebhookLogResponse.model_validate(l) for l in result.scalars().all()]
