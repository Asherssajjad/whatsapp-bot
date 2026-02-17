"""
Conversation flow: stages and default/custom messages per user.
"""
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class ConversationStage(str, enum.Enum):
    NEW = "NEW"
    ASK_NAME = "ASK_NAME"
    ASK_REQUIREMENT = "ASK_REQUIREMENT"
    ASK_CONTACT = "ASK_CONTACT"
    DONE = "DONE"


class ConversationConfig(Base):
    """
    Per-user customization of messages per stage.
    One row per user; each stage has a message and optional AI fallback flag.
    """
    __tablename__ = "conversation_configs"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True, index=True)

    # Stage messages (customizable)
    msg_new = Column(Text, nullable=True)           # Welcome / first message
    msg_ask_name = Column(Text, nullable=True)
    msg_ask_requirement = Column(Text, nullable=True)
    msg_ask_contact = Column(Text, nullable=True)
    msg_done = Column(Text, nullable=True)

    # AI fallback per stage (optional)
    ai_fallback_new = Column(Boolean, default=False, nullable=False)
    ai_fallback_ask_name = Column(Boolean, default=False, nullable=False)
    ai_fallback_ask_requirement = Column(Boolean, default=False, nullable=False)
    ai_fallback_ask_contact = Column(Boolean, default=False, nullable=False)
    ai_fallback_done = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="conversation_configs")
