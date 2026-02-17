# WhatsApp Auto-Reply SaaS – Backend

FastAPI backend for the multi-user WhatsApp auto-reply bot. Handles webhooks from WhatsApp Cloud API, conversation flow (NEW → ASK_NAME → ASK_REQUIREMENT → ASK_CONTACT → DONE), lead capture, and admin APIs.

## Requirements

- Python 3.10+
- PostgreSQL
- WhatsApp Cloud API app (Meta Business)
- Optional: OpenAI API key for AI fallback

## Setup

### 1. Clone and virtualenv

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Unix: source venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL`: PostgreSQL URL with async driver, e.g.  
  `postgresql+asyncpg://user:password@host:5432/dbname`
- `SYNC_DATABASE_URL`: Same DB with sync driver for Alembic:  
  `postgresql://user:password@host:5432/dbname`
- `SECRET_KEY`: Strong random key for JWT
- `WHATSAPP_VERIFY_TOKEN`: Token you will set in Meta webhook verification
- `OPENAI_API_KEY`: Optional, for AI fallback
- `CORS_ORIGINS`: Frontend URL(s), e.g. `http://localhost:3000`
- SMTP vars if you want email notifications for new leads

### 3. Database

```bash
# Create DB in PostgreSQL, then:
export SYNC_DATABASE_URL="postgresql://user:pass@localhost:5432/whatsapp_saas"
alembic upgrade head
```

### 4. Create first admin user

After registering a user via the API or frontend, set role to admin in DB:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin@example.com';
```

Or use a script (see `scripts/create_admin.py` if added).

### 5. Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

## Webhook (WhatsApp Cloud API)

1. In Meta Developer Console, set your webhook URL to:  
   `https://your-backend-domain.com/webhook`
2. Set “Verify token” to the same value as `WHATSAPP_VERIFY_TOKEN` in `.env`.
3. Subscribe to `messages` for the app.
4. Assign a WhatsApp number to a user via Admin → Assign WhatsApp (phone number ID + access token).

Incoming messages hit `POST /webhook`. The handler finds the user by `phone_number_id`, loads or creates the conversation, advances the stage, sends the configured reply (or AI fallback if enabled), and creates a lead when the flow reaches DONE.

## Project layout

- `app/main.py` – FastAPI app, CORS, routes
- `app/config.py` – Settings from env
- `app/database.py` – Async SQLAlchemy engine and session
- `app/models/` – User, WhatsAppAccount, WebhookLog, ConversationConfig, Lead, Conversation, Message, Notification
- `app/schemas/` – Pydantic request/response models
- `app/api/` – auth, webhook, conversations, leads, settings, notifications, accounts, admin
- `app/services/` – openai_service, whatsapp_service, notification_service, webhook_handler
- `app/core/` – security (JWT, password hashing), deps (get_current_user, get_current_admin)
- `alembic/` – Migrations

## Deployment (Railway)

1. Create a new project on Railway; add PostgreSQL and a web service.
2. Connect the repo; set root to `backend` (or run from repo root and set start command to `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`).
3. Add env vars (same as `.env`). Railway provides `DATABASE_URL`; duplicate it as `SYNC_DATABASE_URL` but change the scheme to `postgresql://` (no `+asyncpg`).
4. Run migrations in Railway shell or via release command:  
   `alembic upgrade head`
5. Set the public URL of the service as `APP_URL` and add it (and your frontend URL) to `CORS_ORIGINS`.
6. Point WhatsApp webhook to `https://your-railway-url.up.railway.app/webhook`.

## Optional

- **Conversation templates by niche**: Add a “template” or “niche” field to `ConversationConfig` and default messages per template.
- **Custom keywords**: Store keyword → stage or reply in a new table and check in `webhook_handler` before standard flow.
- **Multi-language**: Add language to user or conversation and choose message set (e.g. English / Roman Urdu) in `_get_stage_message`.
