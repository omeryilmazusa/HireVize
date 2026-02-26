#!/usr/bin/env bash
set -euo pipefail

echo "=== Starting Hirevize Development Servers ==="

# Ensure Docker services are running
docker compose up -d

# Start backend API server
echo "Starting FastAPI backend on :8000..."
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start ARQ worker
echo "Starting ARQ worker..."
arq app.workers.worker.WorkerSettings &
WORKER_PID=$!

cd ..

# Start frontend
echo "Starting Next.js frontend on :3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!

cd ..

# Trap Ctrl+C to kill all processes
trap "echo 'Shutting down...'; kill $BACKEND_PID $WORKER_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

echo ""
echo "=== All servers running ==="
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers."

wait
