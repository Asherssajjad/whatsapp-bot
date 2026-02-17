"""
Auth: register, login (returns JWT).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.core.security import get_password_hash, verify_password, create_access_token
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        role=UserRole.USER,
    )
    db.add(user)
    await db.flush()
    # Create default conversation config for user
    from app.models.conversation import ConversationConfig
    config = ConversationConfig(
        id=str(uuid.uuid4()),
        user_id=user.id,
        msg_new="Hi! Thanks for reaching out. What is your name?",
        msg_ask_name="Thanks! What do you need help with?",
        msg_ask_requirement="Please share your contact (phone or email) so we can get back to you.",
        msg_ask_contact="Thank you! We have noted your details and will contact you soon.",
        msg_done="Is there anything else we can help with?",
    )
    db.add(config)
    await db.commit()
    token = create_access_token(data={"sub": user.id})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    token = create_access_token(data={"sub": user.id})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))
