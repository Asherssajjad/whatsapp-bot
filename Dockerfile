# Root Dockerfile: build and run backend when Railway builds from repo root.
# If your Railway service has Root Directory = "backend", it will use backend/Dockerfile instead.
FROM python:3.11-slim

WORKDIR /app

# Backend deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Backend code
COPY backend/ .

# Migrations + start (PORT set by Railway)
CMD sh run.sh
