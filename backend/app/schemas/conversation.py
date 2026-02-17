from pydantic import BaseModel
from typing import Optional


class ConversationConfigUpdate(BaseModel):
    msg_new: Optional[str] = None
    msg_ask_name: Optional[str] = None
    msg_ask_requirement: Optional[str] = None
    msg_ask_contact: Optional[str] = None
    msg_done: Optional[str] = None
    ai_fallback_new: Optional[bool] = None
    ai_fallback_ask_name: Optional[bool] = None
    ai_fallback_ask_requirement: Optional[bool] = None
    ai_fallback_ask_contact: Optional[bool] = None
    ai_fallback_done: Optional[bool] = None


class ConversationConfigResponse(BaseModel):
    id: str
    user_id: str
    msg_new: Optional[str] = None
    msg_ask_name: Optional[str] = None
    msg_ask_requirement: Optional[str] = None
    msg_ask_contact: Optional[str] = None
    msg_done: Optional[str] = None
    ai_fallback_new: bool
    ai_fallback_ask_name: bool
    ai_fallback_ask_requirement: bool
    ai_fallback_ask_contact: bool
    ai_fallback_done: bool

    class Config:
        from_attributes = True
