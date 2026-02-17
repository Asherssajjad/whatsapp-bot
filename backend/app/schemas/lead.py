from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LeadStatusEnum(str):
    New = "New"
    Contacted = "Contacted"
    Interested = "Interested"
    Closed = "Closed"


class LeadResponse(BaseModel):
    id: str
    user_id: str
    wa_phone: str
    name: Optional[str] = None
    requirement: Optional[str] = None
    contact_info: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
