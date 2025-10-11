#!/bin/bash

##############################################################################
# Dark Matter Anomaly Detection Webapp - Startup Script
##############################################################################

set -e

echo "🚀 Starting Dark Matter Anomaly Detection Webapp..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create a .env file from .env.example and add your Claude API key"
    echo ""
    echo "Run: cp .env.example .env"
    echo "Then edit .env and add your ANTHROPIC_API_KEY"
    exit 1
fi

# Check if Claude API key is set
if ! grep -q "ANTHROPIC_API_KEY=\"sk-ant-" .env; then
    echo -e "${RED}❌ Error: Claude API key not configured${NC}"
    echo "Please edit .env and add your ANTHROPIC_API_KEY"
    exit 1
fi

echo -e "${GREEN}✅ Configuration verified${NC}"
echo ""

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "webapp_backend.py" 2>/dev/null || true
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

# Start Backend
echo ""
echo -e "${BLUE}🔧 Starting Backend Server...${NC}"
python3 webapp_backend.py &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 3

# Check if backend is running
if ! curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi
echo -e "${GREEN}✅ Backend running on http://localhost:5001${NC}"

# Start Frontend
echo ""
echo -e "${BLUE}🎨 Starting Frontend Server...${NC}"
cd webapp
npm run dev &
FRONTEND_PID=$!
cd ..
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to be ready
echo "Waiting for frontend to start..."
sleep 5

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 Webapp Started Successfully!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo -e "📱 Frontend: ${BLUE}http://localhost:8080${NC}"
echo -e "🔧 Backend:  ${BLUE}http://localhost:5001${NC}"
echo ""
echo "🔬 Available Pages:"
echo "   • Home"
echo "   • Classification"
echo "   • Results Dashboard"
echo "   • Anomaly Detection (with scientific report)"
echo ""
echo "📚 Documentation: docs/"
echo ""
echo "⚠️  Press Ctrl+C to stop both servers"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Wait for user interrupt
wait
