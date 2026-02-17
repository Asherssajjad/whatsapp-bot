from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class MessageResponse(BaseModel):
    id: str
    direction: str
    body: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: str
    wa_phone: str
    current_stage: str
    is_complete: bool
    created_at: datetime
    messages: Optional[List[MessageResponse]] = None

    class Config:
        from_attributes = True
