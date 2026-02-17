"""
Handle incoming WhatsApp Cloud API webhook: verify + process messages.
Conversation flow: NEW -> ASK_NAME -> ASK_REQUIREMENT -> ASK_CONTACT -> DONE.
"""
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.whatsapp import WhatsAppAccount, WebhookLog
from app.models.conversation import ConversationConfig, ConversationStage
from app.models.message import Conversation, Message
from app.models.lead import Lead, LeadStatus
from app.services.whatsapp_service import send_whatsapp_text
from app.services.openai_service import get_ai_reply
from app.services.notification_service import notify_new_lead

# Default messages (used when user has not customized)
DEFAULTS = {
    "NEW": "Hi! Thanks for reaching out. What is your name?",
    "ASK_NAME": "Thanks! What do you need help with?",
    "ASK_REQUIREMENT": "Please share your contact (phone or email) so we can get back to you.",
    "ASK_CONTACT": "Thank you! We have noted your details and will contact you soon.",
    "DONE": "Is there anything else we can help with?",
}


def _extract_text_from_wa_payload(entry: dict) -> tuple[str | None, str | None, str | None]:
    """Extract (phone_number_id, from_wa_id, text) from webhook entry."""
    try:
        for change in entry.get("changes", []):
            if change.get("field") != "messages":
                continue
            value = change.get("value", {})
            messages = value.get("messages", [])
            if not messages:
                continue
            msg = messages[0]
            if msg.get("type") != "text":
                return (
                    value.get("phone_number_id"),
                    msg.get("from"),
                    None,
                )
            return (
                value.get("phone_number_id"),
                msg.get("from"),
                (msg.get("text", {}) or {}).get("body", ""),
            )
    except Exception:
        pass
    return None, None, None


def _get_stage_message(config: ConversationConfig | None, stage: str) -> str:
    """Get message for stage from config or default."""
    if not config:
        return DEFAULTS.get(stage, DEFAULTS["NEW"])
    m = {
        "NEW": config.msg_new,
        "ASK_NAME": config.msg_ask_name,
        "ASK_REQUIREMENT": config.msg_ask_requirement,
        "ASK_CONTACT": config.msg_ask_contact,
        "DONE": config.msg_done,
    }
    return m.get(stage) or DEFAULTS.get(stage, DEFAULTS["NEW"])


def _get_ai_fallback(config: ConversationConfig | None, stage: str) -> bool:
    if not config:
        return False
    m = {
        "NEW": config.ai_fallback_new,
        "ASK_NAME": config.ai_fallback_ask_name,
        "ASK_REQUIREMENT": config.ai_fallback_ask_requirement,
        "ASK_CONTACT": config.ai_fallback_ask_contact,
        "DONE": config.ai_fallback_done,
    }
    return m.get(stage, False)


async def process_incoming_message(db: AsyncSession, payload: dict) -> None:
    """
    Process one incoming message: find account, conversation, update stage, send reply, save lead if DONE.
    """
    # Find which entry has the message
    for entry in payload.get("entry", []):
        phone_number_id, from_wa, text = _extract_text_from_wa_payload(entry)
        if not phone_number_id or not from_wa:
            continue
        to_send = phone_number_id
        wa_phone = str(from_wa)
        if not text:
            text = ""

        # Resolve user from WhatsApp account
        result = await db.execute(
            select(WhatsAppAccount).where(
                WhatsAppAccount.phone_number_id == to_send,
                WhatsAppAccount.is_active == True,
            )
        )
        account = result.scalar_one_or_none()
        if not account:
            continue
        user_id = account.user_id

        # Load or create conversation and config
        result = await db.execute(
            select(Conversation).where(
                Conversation.user_id == user_id,
                Conversation.wa_phone == wa_phone,
            )
        )
        conv = result.scalar_one_or_none()
        if not conv:
            conv = Conversation(
                id=str(uuid.uuid4()),
                user_id=user_id,
                wa_phone=wa_phone,
                current_stage="NEW",
                is_complete=False,
            )
            db.add(conv)
            await db.flush()

        result = await db.execute(select(ConversationConfig).where(ConversationConfig.user_id == user_id))
        config = result.scalar_one_or_none()

        # Save inbound message
        msg_in = Message(
            id=str(uuid.uuid4()),
            conversation_id=conv.id,
            direction="inbound",
            body=text,
        )
        db.add(msg_in)
        await db.flush()

        stage = conv.current_stage
        reply_text = ""

        # Stage transitions and reply
        if stage == "NEW":
            # User sent something -> move to ASK_NAME and send ASK_NAME message
            conv.current_stage = "ASK_NAME"
            reply_text = _get_stage_message(config, "ASK_NAME")
            if not reply_text.strip() and _get_ai_fallback(config, "NEW"):
                reply_text = await get_ai_reply(text, "Business first reply.") or reply_text or DEFAULTS["ASK_NAME"]
        elif stage == "ASK_NAME":
            # We treat as name
            conv.current_stage = "ASK_REQUIREMENT"
            reply_text = _get_stage_message(config, "ASK_REQUIREMENT")
            if not reply_text.strip() and _get_ai_fallback(config, "ASK_NAME"):
                reply_text = await get_ai_reply(text, "Customer just gave name.") or reply_text or DEFAULTS["ASK_REQUIREMENT"]
        elif stage == "ASK_REQUIREMENT":
            conv.current_stage = "ASK_CONTACT"
            reply_text = _get_stage_message(config, "ASK_CONTACT")
            if not reply_text.strip() and _get_ai_fallback(config, "ASK_REQUIREMENT"):
                reply_text = await get_ai_reply(text, "Customer stated requirement.") or reply_text or DEFAULTS["ASK_CONTACT"]
        elif stage == "ASK_CONTACT":
            # Save lead and move to DONE
            conv.current_stage = "DONE"
            conv.is_complete = True
            # Get name/requirement from previous messages (simplified: we could store in conversation metadata)
            # For now we only have current text as contact_info; name/requirement from history would need parsing
            msgs_result = await db.execute(
                select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at)
            )
            msgs = list(msgs_result.scalars().all())
            name_val = ""
            req_val = ""
            # First inbound after NEW is name, second is requirement
            inbound_texts = [m.body for m in msgs if m.direction == "inbound"]
            if len(inbound_texts) >= 1:
                name_val = inbound_texts[0]
            if len(inbound_texts) >= 2:
                req_val = inbound_texts[1]
            contact_info = text

            lead = Lead(
                id=str(uuid.uuid4()),
                user_id=user_id,
                conversation_id=conv.id,
                wa_phone=wa_phone,
                name=name_val or None,
                requirement=req_val or None,
                contact_info=contact_info or None,
                status=LeadStatus.NEW,
            )
            db.add(lead)
            await db.flush()
            await notify_new_lead(db, user_id, lead.id, name_val, wa_phone)

            reply_text = _get_stage_message(config, "DONE")
            if not reply_text.strip() and _get_ai_fallback(config, "ASK_CONTACT"):
                reply_text = await get_ai_reply(text, "Customer gave contact.") or reply_text or DEFAULTS["DONE"]
        else:
            # DONE or unknown: optional AI fallback
            if _get_ai_fallback(config, "DONE"):
                reply_text = await get_ai_reply(text, "Follow-up in completed conversation.")
            if not reply_text:
                reply_text = _get_stage_message(config, "DONE") or DEFAULTS["DONE"]

        if reply_text:
            ok = await send_whatsapp_text(account.phone_number_id, account.access_token, wa_phone, reply_text)
            if ok:
                out_msg = Message(
                    id=str(uuid.uuid4()),
                    conversation_id=conv.id,
                    direction="outbound",
                    body=reply_text,
                )
                db.add(out_msg)
        return  # Process one message per entry
    return None
