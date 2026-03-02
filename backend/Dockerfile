FROM python:3.11-slim

WORKDIR /srv

# System dependencies for weasyprint and PDF processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpango1.0-dev \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Copy everything and install
COPY . .
RUN pip install --no-cache-dir . && pip install --no-cache-dir "bcrypt==4.1.3"

# Run migrations on startup, then start server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8080"]
