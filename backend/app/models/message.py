"""
Conversations (one per WhatsApp contact) and messages for history.
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Conversation(Base):
    """
    One conversation = one WhatsApp contact (wa_phone) per user.
    Tracks current stage and message history.
    """
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    wa_phone = Column(String(32), nullable=False, index=True)
    current_stage = Column(String(32), default="NEW", nullable=False)
    is_complete = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Unique per user + wa_phone
    __table_args__ = ({"schema": None})  # Use unique constraint per (user_id, wa_phone) in app logic

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, index=True)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False, index=True)
    direction = Column(String(16), nullable=False)  # inbound | outbound
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
