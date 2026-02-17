"""
Send email and create in-app notifications for new leads.
"""
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.models.notification import Notification
from app.models.user import User

# Optional: aiosmtplib for async email
# For simplicity we use sync in background; can switch to aiosmtplib


async def create_in_app_notification(
    db: AsyncSession, user_id: str, lead_id: str, lead_name: str, wa_phone: str
) -> None:
    n = Notification(
        id=str(uuid.uuid4()),
        user_id=user_id,
        lead_id=lead_id,
        title="New lead",
        body=f"Lead from {wa_phone}" + (f" ({lead_name})" if lead_name else ""),
        is_read=False,
    )
    db.add(n)


def _send_email_sync(to_email: str, subject: str, body: str) -> bool:
    """Sync SMTP send. Returns True if sent successfully."""
    if not settings.smtp_user or not settings.smtp_password:
        return False
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        msg = MIMEMultipart()
        msg["From"] = settings.smtp_from
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        return True
    except Exception:
        return False


async def notify_new_lead(db: AsyncSession, user_id: str, lead_id: str, lead_name: str, wa_phone: str) -> None:
    """Create in-app notification and optionally send email to user."""
    await create_in_app_notification(db, user_id, lead_id, lead_name, wa_phone)
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user and user.email:
        import asyncio
        await asyncio.to_thread(
            _send_email_sync,
            user.email,
            "New lead on WhatsApp",
            f"A new lead came in from {wa_phone}" + (f" ({lead_name})" if lead_name else "") + ".",
        )
