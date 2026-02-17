"""
WhatsApp Cloud API: accounts (phone numbers + tokens) and webhook logs.
Supports multiple numbers per user for future upgrade.
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class WhatsAppAccount(Base):
    __tablename__ = "whatsapp_accounts"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    phone_number_id = Column(String(64), nullable=False)  # WhatsApp Cloud API phone number ID
    phone_number = Column(String(32), nullable=False)    # Display number e.g. +1234567890
    access_token = Column(Text, nullable=False)          # Encrypted in production recommended
    business_account_id = Column(String(64), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="whatsapp_accounts")


class WebhookLog(Base):
    __tablename__ = "webhook_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    payload = Column(Text, nullable=True)       # Raw JSON payload
    direction = Column(String(16), nullable=True)  # inbound / outbound
    phone_number_id = Column(String(64), nullable=True, index=True)
    status = Column(String(32), nullable=True)  # processed, error, etc.
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
