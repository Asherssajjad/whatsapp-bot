from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class WhatsAppAccountResponse(BaseModel):
    id: str
    phone_number_id: str
    phone_number: str
    business_account_id: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class WebhookLogResponse(BaseModel):
    id: int
    direction: Optional[str] = None
    phone_number_id: Optional[str] = None
    status: Optional[str] = None
    error_message: Optional[str] = None
    payload: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
