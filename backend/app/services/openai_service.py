"""
Optional AI fallback using OpenAI GPT-3.5/4 for unknown queries.
"""
import httpx
from app.config import settings

OPENAI_URL = "https://api.openai.com/v1/chat/completions"


async def get_ai_reply(user_message: str, context: str = "") -> str:
    """Call OpenAI and return a reply. Returns empty string if no key or error."""
    if not settings.openai_api_key:
        return ""
    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": "You are a helpful WhatsApp business assistant. Reply briefly and professionally. " + (context or "")},
            {"role": "user", "content": user_message},
        ],
        "max_tokens": 150,
    }
    headers = {"Authorization": f"Bearer {settings.openai_api_key}", "Content-Type": "application/json"}
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(OPENAI_URL, json=payload, headers=headers, timeout=15.0)
            if r.status_code != 200:
                return ""
            data = r.json()
            choice = data.get("choices", [{}])[0]
            return (choice.get("message", {}) or {}).get("content", "").strip() or ""
    except Exception:
        return ""
