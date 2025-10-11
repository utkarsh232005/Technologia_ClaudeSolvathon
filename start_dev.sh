#!/bin/bash

echo "========================================"
echo "Dark Matter Classification System"
echo "Starting Backend and Frontend Together"
echo "========================================"
echo ""

# Start Backend Server
echo "[1/2] Starting Backend Server..."
cd "$(dirname "$0")"
python webapp_backend.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Frontend Development Server
echo "[2/2] Starting Frontend Server..."
cd webapp
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "Both servers are running!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:5001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press CTRL+C to stop both servers..."

# Wait for user to stop
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
