# Multi-stage Dockerfile for Sentinel Portal
# Combines React (Vite) frontend build with FastAPI backend into a single container.

# ── Stage 1: Build Frontend ──
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ── Stage 2: Production Python Runner ──
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PORT=8000

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ /app/backend/

# Copy built frontend assets from stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

WORKDIR /app/backend

EXPOSE 8000

# Run uvicorn on the container PORT environment variable
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
