# WhatsApp Auto-Reply SaaS Bot

Multi-user WhatsApp auto-reply SaaS with a **Python FastAPI backend** and **React (Vite + Tailwind) frontend**. Supports conversation flow, lead capture, optional AI fallback, and an admin dashboard for user and WhatsApp management.

## Features

### Backend (FastAPI)

- **Webhook** for WhatsApp Cloud API (verify + receive messages)
- **Conversation stages**: NEW → ASK_NAME → ASK_REQUIREMENT → ASK_CONTACT → DONE
- **Custom messages** per stage, per user (stored in DB)
- **Optional AI fallback** (OpenAI GPT-3.5) per stage, enable/disable per user
- **Leads** stored per user (PostgreSQL); status: New → Contacted → Interested → Closed
- **Notifications**: in-app + optional email when a new lead is captured
- **Admin**: list users, create/edit users, assign WhatsApp API tokens and phone numbers, view usage (messages sent, leads), webhook logs for debugging
- **Multi number**: support for multiple WhatsApp numbers per user (DB and APIs ready)
- **Webhook logs**: raw payload and status for debugging

### Frontend (React)

- **User**: Login/Signup, dashboard, conversations (search/filter), leads (table + CSV export), settings (flow messages + AI toggles), notifications panel
- **Admin**: Login, user management, assign WhatsApp, usage monitoring, webhook logs
- **UI**: TailwindCSS, mobile responsive, dark/light mode toggle

## Quick start

### Backend

```bash
cd backend
python -m venv venv
# Activate venv (see backend/README.md)
pip install -r requirements.txt
cp .env.example .env   # Edit DATABASE_URL, SECRET_KEY, WHATSAPP_VERIFY_TOKEN, etc.
# Create PostgreSQL DB, then:
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Create an admin user: register via API/frontend, then in DB:  
`UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. Use the proxy to backend (default port 8000).

### WhatsApp Cloud API

1. Create an app in [Meta for Developers](https://developers.facebook.com/), add WhatsApp product, get phone number ID and token.
2. Set webhook URL to `https://your-backend-url/webhook`, verify token = `WHATSAPP_VERIFY_TOKEN` from `.env`.
3. In the app dashboard (admin), assign the phone number ID and token to a user.

## Project structure

```
├── backend/
│   ├── app/
│   │   ├── api/          # auth, webhook, conversations, leads, settings, notifications, accounts, admin
│   │   ├── core/          # security, deps
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic
│   │   ├── services/      # webhook handler, OpenAI, WhatsApp send, notifications
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── alembic/
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── api/           # axios client + API calls
│   │   ├── components/     # Layout (Dashboard, Admin)
│   │   ├── context/       # AuthContext
│   │   ├── pages/         # Login, Signup, Dashboard, Conversations, Leads, Settings, Notifications
│   │   └── pages/admin/   # AdminDashboard, AdminUsers, AdminUsage, AdminWhatsApp, AdminLogs
│   ├── package.json
│   └── README.md
└── README.md
```

## Deployment (Git + Railway)

1. **Push to GitHub**: `git init`, `git add .`, `git commit -m "Initial commit"`, then `git remote add origin <your-repo-url>` and `git push -u origin main`.
2. **Railway**: New Project → Deploy from GitHub → add PostgreSQL, add backend service (root: `backend`), set variables (`DATABASE_URL` from DB, `SECRET_KEY`, `WHATSAPP_VERIFY_TOKEN`, `APP_URL`, `CORS_ORIGINS`), start command: `sh run.sh`, generate domain.
3. **Frontend**: Same repo, new Railway service (root: `frontend`) or Vercel; set `VITE_API_URL` to backend URL; add that frontend URL to backend `CORS_ORIGINS`.

**Full step-by-step**: see **[DEPLOY.md](DEPLOY.md)** for Git push, Railway backend + PostgreSQL, migrations, frontend (Railway or Vercel), and WhatsApp webhook.

## Optional / future

- Conversation templates by niche (Real Estate, Clinic, E-commerce)
- Custom keywords/triggers per user
- Auto follow-ups for inactive leads
- Analytics: reply rate, leads over time
- Multi-language (e.g. English + Roman Urdu)
- Export to Google Sheets
- Team roles per business

## License

MIT (or your choice).
