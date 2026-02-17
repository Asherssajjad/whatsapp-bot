#!/bin/sh
set -e
# Run migrations then start the app (for Railway)
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
