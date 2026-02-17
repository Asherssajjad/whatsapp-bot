"""
WhatsApp Cloud API webhook: GET for verification, POST for incoming messages.
"""
from fastapi import APIRouter, Request, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
import json
import uuid

from app.database import get_db
from app.config import settings
from app.models.whatsapp import WebhookLog
from app.services.webhook_handler import process_incoming_message

router = APIRouter(prefix="/webhook", tags=["webhook"])


@router.get("")
async def verify_webhook(
    request: Request,
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):
    """WhatsApp Cloud API sends GET to verify the webhook URL."""
    if hub_mode == "subscribe" and hub_verify_token == settings.whatsapp_verify_token:
        return int(hub_challenge) if hub_challenge else 200
    raise ValueError("Verification failed")


@router.post("")
async def handle_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Receive incoming messages and status updates from WhatsApp."""
    try:
        body = await request.body()
        payload = json.loads(body) if body else {}
    except Exception:
        payload = {}
    # Log raw payload for debugging
    log = WebhookLog(
        payload=json.dumps(payload)[:10000],
        direction="inbound",
        phone_number_id=None,
        status="received",
    )
    db.add(log)
    await db.flush()
    # Ignore if not a message (e.g. status updates)
    if "entry" not in payload:
        await db.commit()
        return {"status": "ok"}
    try:
        await process_incoming_message(db, payload)
        log.status = "processed"
    except Exception as e:
        log.status = "error"
        log.error_message = str(e)[:2000]
    await db.commit()
    return {"status": "ok"}
