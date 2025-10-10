#!/bin/bash

# Dark Matter Classification Webapp - Complete Setup Script

echo "🚀 Dark Matter Classification Webapp Setup"
echo "=========================================="

# Check if Python backend dependencies are installed
echo "📦 Checking Python dependencies..."
python3 -c "import flask, pandas, numpy, requests" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Missing Python dependencies. Installing..."
    pip install flask flask-cors pandas numpy requests python-dotenv
else
    echo "✅ Python dependencies installed"
fi

# Check if Node.js dependencies are installed
echo "📦 Checking Node.js dependencies..."
cd webapp
if [ ! -d "node_modules" ]; then
    echo "❌ Missing Node.js dependencies. Installing..."
    npm install
else
    echo "✅ Node.js dependencies installed"
fi

cd ..

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOL
# Gemini API Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=1
EOL
    echo "⚠️  Please add your Gemini API key to the .env file"
fi

echo ""
echo "🎯 Setup Complete! To run the application:"
echo ""
echo "1. Start the Python backend (in Terminal 1):"
echo "   python3 webapp_backend.py"
echo ""
echo "2. Start the React frontend (in Terminal 2):"
echo "   cd webapp && npm run dev"
echo ""
echo "3. Open your browser to: http://localhost:8080"
echo ""
echo "📊 Backend API will be available at: http://localhost:5001"
echo "🌐 Frontend will be available at: http://localhost:8080"
echo ""
echo "🔬 Make sure your dataset exists by running:"
echo "   python3 main.py"
echo ""
echo "💡 Features available:"
echo "   • Single event classification with detailed AI reasoning"
echo "   • Batch processing of CSV/JSON files"
echo "   • Real-time backend connectivity status"
echo "   • Physics-accurate S2/S1 ratio analysis"
echo "   • Integration with your mainClassify.py script"
