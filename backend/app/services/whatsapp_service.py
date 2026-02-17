"""
Send messages via WhatsApp Cloud API.
"""
import httpx
from typing import Optional

# Cloud API base
BASE_URL = "https://graph.facebook.com/v18.0"


async def send_whatsapp_text(phone_number_id: str, access_token: str, to_wa_phone: str, text: str) -> bool:
    """
    Send a text message. to_wa_phone should be digits only (e.g. 1234567890).
    """
    url = f"{BASE_URL}/{phone_number_id}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_wa_phone.replace("+", "").replace(" ", ""),
        "type": "text",
        "text": {"body": text[:4096]},
    }
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(url, json=payload, headers=headers, timeout=30.0)
            return r.status_code == 200
    except Exception:
        return False
