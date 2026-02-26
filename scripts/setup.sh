#!/usr/bin/env bash
set -euo pipefail

echo "=== Hirevize Setup ==="

# Start Docker services (PostgreSQL + Redis)
echo "Starting Docker services..."
docker compose up -d

# Backend setup
echo "Setting up backend..."
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
playwright install chromium

# Copy env file if not exists
if [ ! -f .env ]; then
    cp ../.env.example .env
    echo "Created backend/.env from template. Please update with your API keys."
fi

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

cd ..

# Frontend setup
echo "Setting up frontend..."
cd frontend
npm install

cd ..

echo ""
echo "=== Setup complete! ==="
echo "Run './scripts/dev.sh' to start the development servers."
