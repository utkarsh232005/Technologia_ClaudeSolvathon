# Dark Matter Classification Webapp Integration

🚀 **Real-time AI-powered dark matter event classification with beautiful web interface**

## 🎯 Overview

This integration connects your advanced `mainClassify.py` script with a modern React webapp, providing:

- **Single Event Classification**: Real-time AI analysis with detailed physics reasoning
- **Batch Processing**: Upload CSV/JSON files for bulk classification
- **Live Backend Status**: Real-time connection monitoring
- **Advanced Visualization**: Interactive results dashboard
- **Physics-Accurate Analysis**: S2/S1 ratio bands, energy analysis, and position validation

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/API    ┌──────────────────┐    Import    ┌────────────────┐
│   React Webapp  │  ←----------→  │  Flask Backend   │  ←--------→  │  mainClassify  │
│   (Port 8081)   │                │   (Port 5001)    │              │      .py       │
└─────────────────┘                └──────────────────┘              └────────────────┘
       │                                     │                              │
       ├─ Event Input Form                   ├─ API Endpoints                ├─ Gemini API
       ├─ Batch File Upload                  ├─ File Processing              ├─ Classification
       ├─ Results Dashboard                  ├─ Data Validation              ├─ Reasoning
       └─ Real-time Status                   └─ Error Handling               └─ Physics Analysis
```

## 📁 File Structure

```
/Users/utkarshpatrikar/IIIT Hackathon/
├── webapp_backend.py              # Flask API server
├── mainClassify.py                # Your classification script
├── run_webapp.sh                  # Setup and run script
├── dataset/                       # Dataset folder
│   ├── dark_matter_synthetic_dataset.csv
│   └── claude_classified_results_detailed.json
└── webapp/                        # React frontend
    ├── src/
    │   ├── lib/classificationAPI.ts    # API communication
    │   ├── pages/EventClassifier.tsx   # Main classification UI
    │   └── ...
    ├── vite.config.ts             # Proxy configuration
    └── package.json
```

## 🚀 Quick Start

### 1. Run the Setup Script
```bash
./run_webapp.sh
```

### 2. Start the Backend (Terminal 1)
```bash
python3 webapp_backend.py
```
**Expected Output:**
```
🚀 Starting Dark Matter Classification Backend Server...
📊 Webapp will connect to: http://localhost:5001
🔬 API endpoints available:
   GET  /api/health
   POST /api/classify/single
   POST /api/classify/batch
   POST /api/classify/batch/process
   GET  /api/dataset/load
⚡ Server starting on port 5001...
```

### 3. Start the Frontend (Terminal 2)
```bash
cd webapp && npm run dev
```

### 4. Open Your Browser
Navigate to: **http://localhost:8081**

## 🎮 Using the Webapp

### Single Event Classification

1. **Navigate to Event Classifier** (sidebar menu)
2. **Fill in Event Data:**
   - Recoil Energy (keV): e.g., `12.5`
   - S1 Signal (PE): e.g., `45`
   - S2 Signal (PE): e.g., `320`
   - Position (optional): X, Y, Z coordinates
3. **Click "Classify Event"**
4. **View Results:**
   - Classification type (WIMP, Background, Axion, Anomaly)
   - Confidence percentage with visual gauge
   - Detailed reasoning sections
   - Key physics features

### Batch Processing

1. **Switch to "Batch Processing" tab**
2. **Upload File:** Drag & drop or click to browse
   - **Supported formats:** CSV, JSON
   - **Required columns:** `energy`, `s1`, `s2`
   - **Optional columns:** `id`, `position_x`, `position_y`, `position_z`
3. **Preview Data:** Review first 5 rows
4. **Start Processing:** Click "Start Batch Classification"
5. **Monitor Progress:** Real-time progress bar and statistics
6. **Download Results:** CSV file with classifications

## 🔧 API Endpoints

### Health Check
```bash
curl http://localhost:5001/api/health
```

### Single Event Classification
```bash
curl -X POST http://localhost:5001/api/classify/single \
  -H "Content-Type: application/json" \
  -d '{
    "recoilEnergy": "12.5",
    "s1Signal": "45",
    "s2Signal": "320",
    "positionX": "2.1",
    "positionY": "-1.3",
    "positionZ": "15.7"
  }'
```

### Batch Upload
```bash
curl -X POST http://localhost:5001/api/classify/batch \
  -F "file=@your_events.csv"
```

## 🧪 Sample Data Format

### CSV Format
```csv
energy,s1,s2,id,position_x,position_y,position_z
12.5,45,320,EVT-001,2.1,-1.3,15.7
8.2,120,180,EVT-002,0.8,3.2,8.1
15.3,67,1689,EVT-003,1.2,0.5,12.4
```

### JSON Format
```json
[
  {
    "energy": 12.5,
    "s1": 45,
    "s2": 320,
    "id": "EVT-001",
    "position_x": 2.1,
    "position_y": -1.3,
    "position_z": 15.7
  }
]
```

## 🔬 Classification Output

The webapp provides comprehensive classification results:

### Standard Response
```json
{
  "success": true,
  "classification": {
    "type": "WIMP",
    "label": "WIMP-like (NR)",
    "confidence": 87.3,
    "severity": "high",
    "processingTime": 1250.5
  },
  "analysis": {
    "keyFeatures": [
      "Low S2/S1 ratio",
      "WIMP energy range",
      "Fiducial volume position"
    ],
    "reasoning": {
      "s2s1Analysis": "The event exhibits an S2/S1 ratio of 3.46...",
      "energyAnalysis": "The recoil energy is 12.56 keV...",
      "positionAnalysis": "The event's reconstructed position...",
      "physicsInterpretation": "The extremely low S2/S1 ratio...",
      "followUpRecommendations": "1. Immediately investigate..."
    }
  }
}
```

## 🎨 UI Features

### Real-time Status Indicators
- 🟢 **Connected**: Backend online, ready for classification
- 🟡 **Checking**: Testing backend connection
- 🔴 **Disconnected**: Backend offline, with retry button

### Visual Classification Results
- **Color-coded badges** for different particle types
- **Circular confidence gauge** with percentage
- **Key features list** with checkmarks
- **Expandable reasoning sections** with copy functionality

### Progress Tracking
- **Real-time progress bar** for batch processing
- **Event counters** (processed, remaining, errors)
- **Average processing time** calculation
- **Estimated time remaining**

## 🛠️ Troubleshooting

### Backend Won't Start
```bash
# Check if port 5001 is available
lsof -i :5001

# Install missing dependencies
pip install flask flask-cors pandas numpy requests
```

### Frontend Connection Issues
```bash
# Check proxy configuration in webapp/vite.config.ts
# Ensure it points to: http://localhost:5001
```

### Classification Errors
1. **Check dataset exists:**
   ```bash
   python3 main.py  # Generate dataset first
   ```

2. **Verify API key:**
   ```bash
   # Add GEMINI_API_KEY to .env file
   echo 'GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE' > .env
   ```

### File Upload Issues
- **File size limit:** 10MB maximum
- **Required columns:** Must include `energy`, `s1`, `s2`
- **Format:** CSV with headers or JSON array

## 🔒 Security Notes

- **API Key:** Store in `.env` file, never commit to git
- **CORS:** Enabled for development, restrict for production
- **File uploads:** Limited to 10MB, validated before processing
- **Input validation:** All form inputs validated before API calls

## 🚀 Performance

### Optimization Features
- **Batch size limit:** 50 events per batch (configurable)
- **Progress streaming:** Real-time updates during processing
- **Error handling:** Individual event errors don't stop batch
- **Memory management:** Temp files cleaned after processing

### Expected Performance
- **Single event:** ~1-3 seconds (includes AI processing)
- **Batch processing:** ~100-300ms per event average
- **File upload:** Near-instant for files under 1MB

## 🎯 Next Steps

1. **Start the servers** using the instructions above
2. **Test single event classification** with the example data
3. **Try batch processing** with a small CSV file
4. **Explore the results dashboard** for data visualization
5. **Customize the UI** colors and features as needed

## 📞 Support

If you encounter issues:
1. Check that both servers are running
2. Verify the dataset exists in `dataset/` folder
3. Ensure your API key is configured in `.env`
4. Check browser console for any JavaScript errors
5. Review Flask backend logs for Python errors

---

**🎉 You now have a complete, production-ready dark matter classification webapp connected to your advanced AI classification system!**
