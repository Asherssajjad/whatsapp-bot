"""
User and Admin models. Admin users can manage all users and assign WhatsApp tokens.
"""
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships (data isolated by user_id in related tables)
    whatsapp_accounts = relationship("WhatsAppAccount", back_populates="user")
    conversation_configs = relationship("ConversationConfig", back_populates="user")
    leads = relationship("Lead", back_populates="user")
    conversations = relationship("Conversation", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
