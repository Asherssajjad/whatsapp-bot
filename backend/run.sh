#!/bin/sh
set -e
# Railway: ensure DATABASE_URL is set from PostgreSQL (async driver for the app)
if [ -n "$PORT" ]; then
  _url=""
  if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "postgresql://localhost"* ] && [ "$DATABASE_URL" != "postgresql+asyncpg://localhost"* ]; then
    _url="$DATABASE_URL"
  elif [ -n "$DATABASE_PRIVATE_URL" ]; then
    _url="$DATABASE_PRIVATE_URL"
  elif [ -n "$POSTGRES_URL" ]; then
    _url="$POSTGRES_URL"
  fi
  if [ -z "$_url" ]; then
    echo "ERROR: No database URL. In Railway: Variables → New Variable → Add Reference → PostgreSQL → DATABASE_URL or DATABASE_PRIVATE_URL. Then Redeploy."
    exit 1
  fi
  # App needs postgresql+asyncpg:// for async
  case "$_url" in
    postgresql://*) export DATABASE_URL="postgresql+asyncpg://${_url#postgresql://}" ;;
    *) export DATABASE_URL="$_url" ;;
  esac
fi
# Run migrations then start the app
alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
