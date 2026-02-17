# Use Docker build so Railway doesn't rely on Railpack/Nixpacks detection
FROM python:3.11-slim

WORKDIR /app

# Install deps (no psycopg2 build deps needed - we use asyncpg for runtime; alembic needs sync URL)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY . .

# Run migrations then start (PORT set by Railway)
CMD sh run.sh
