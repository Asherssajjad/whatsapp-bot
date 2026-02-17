"""
Leads captured from WhatsApp conversations. Isolated per user (user_id).
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class LeadStatus(str, enum.Enum):
    NEW = "New"
    CONTACTED = "Contacted"
    INTERESTED = "Interested"
    CLOSED = "Closed"


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=True, index=True)

    # From conversation flow
    wa_phone = Column(String(32), nullable=False, index=True)  # WhatsApp number
    name = Column(String(255), nullable=True)
    requirement = Column(Text, nullable=True)
    contact_info = Column(String(255), nullable=True)  # email or phone shared

    status = Column(SQLEnum(LeadStatus), default=LeadStatus.NEW, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="leads")
