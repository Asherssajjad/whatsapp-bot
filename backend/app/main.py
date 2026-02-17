"""
WhatsApp Auto-Reply SaaS - FastAPI application.
Run: uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import auth, webhook, conversations, leads, settings as settings_api, notifications, admin, accounts

app = FastAPI(
    title="WhatsApp Auto-Reply SaaS",
    description="Multi-user WhatsApp bot with conversation flow and lead capture",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public
app.include_router(auth.router, prefix="/api")
app.include_router(webhook.router, prefix="")  # /webhook for Meta

# User (authenticated)
app.include_router(conversations.router, prefix="/api")
app.include_router(leads.router, prefix="/api")
app.include_router(settings_api.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(accounts.router, prefix="/api")

# Admin
app.include_router(admin.router, prefix="/api")


@app.get("/")
def root():
    return {"service": "WhatsApp Auto-Reply SaaS", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
