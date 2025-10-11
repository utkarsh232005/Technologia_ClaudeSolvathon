#!/bin/bash
# Start Anomaly Detection Integrated Webapp

echo "🚀 Starting Dark Matter Anomaly Detection System"
echo "================================================"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please add your ANTHROPIC_API_KEY"
    echo ""
fi

# Check for API key
if grep -q "API KEY HERE" .env 2>/dev/null; then
    echo "⚠️  Warning: ANTHROPIC_API_KEY not configured in .env"
    echo "Please set your Claude API key in .env file"
    echo ""
fi

echo "📊 Dataset: dataset/dark_matter_synthetic_dataset.csv"
echo "🤖 AI: Claude API (anomaly detection + classification)"
echo "🌐 Backend: http://localhost:5001"
echo "🖥️  Frontend: http://localhost:5173"
echo ""
echo "================================================"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔧 Starting Backend Server..."
python3 webapp_backend.py &
BACKEND_PID=$!
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Failed to start backend server"
    exit 1
fi

echo "✅ Backend running on port 5001"
echo ""

# Start frontend
echo "🎨 Starting Frontend..."
cd webapp
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "================================================"
echo "✅ All systems operational!"
echo "================================================"
echo ""
echo "📍 Access the webapp at: http://localhost:5173"
echo "🔍 Navigate to: Anomaly Detection page"
echo ""
echo "Features available:"
echo "  • Single Event Anomaly Detection"
echo "  • Dataset Analysis"
echo "  • Claude AI Classification"
echo "  • Real-time Results"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "================================================"

# Wait for processes
wait
