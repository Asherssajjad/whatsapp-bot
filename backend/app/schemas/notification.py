from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationResponse(BaseModel):
    id: str
    lead_id: Optional[str] = None
    title: str
    body: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
