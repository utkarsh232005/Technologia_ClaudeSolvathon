# 🌌 Dark Matter Anomaly Detection Webapp

A full-stack web application for analyzing dark matter events using AI-powered classification and anomaly detection. Built with React (TypeScript), Flask (Python), and Claude AI API.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Python](https://img.shields.io/badge/python-3.9+-blue)
![React](https://img.shields.io/badge/react-18+-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### 🔬 Event Classification
- Multi-class particle classification (WIMP, Background, Axion, Neutrino, Novel Anomaly)
- AI-powered reasoning using Claude API
- Confidence scoring and detailed explanations
- Single event and batch processing

### 🚨 Anomaly Detection
- Advanced statistical and rule-based anomaly detection
- Comprehensive 4-part scientific report for each anomaly:
  1. **What is the anomaly?** - Event identification and type
  2. **How bad is it?** - Severity assessment and scoring
  3. **Why is it an anomaly?** - Root cause analysis
  4. **What should I do?** - Recommended actions
- Color-coded severity levels (Critical/High/Medium)
- AI-enhanced classification with Claude API

### 📊 Data Visualization
- Interactive dashboards with real-time statistics
- 3D scatter plots and distribution charts
- Event classification breakdowns
- Anomaly rate tracking

### 🎨 Modern UI
- Beautiful dark theme with cyan accents
- Responsive design for all screen sizes
- Real-time loading states and progress indicators
- Toast notifications and error handling

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+** with pip
- **Node.js 18+** with npm
- **Claude API Key** from [Anthropic](https://console.anthropic.com/)

### Installation

1. **Clone the repository**
   ```bash
   cd /path/to/IIIT\ Hackathon
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Claude API key:
   ```
   ANTHROPIC_API_KEY="your-api-key-here"
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install frontend dependencies**
   ```bash
   cd webapp
   npm install
   cd ..
   ```

### Running the Application

**Option 1: Using the startup script (recommended)**
```bash
./start_webapp.sh
```

**Option 2: Manual startup**
```bash
# Terminal 1 - Backend
python3 webapp_backend.py

# Terminal 2 - Frontend
cd webapp
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5001

---

## 📁 Project Structure

```
IIIT Hackathon/
├── webapp/                      # React frontend
│   ├── src/
│   │   ├── pages/              # Page components
│   │   │   ├── AnomalyDetection.tsx    # Scientific anomaly report
│   │   │   ├── ResultsDashboard.tsx    # Data visualization
│   │   │   ├── EventClassifier.tsx     # Event classification
│   │   │   └── ...
│   │   ├── lib/                # API clients
│   │   │   ├── anomalyAPI.ts          # Anomaly detection API
│   │   │   └── classificationAPI.ts   # Classification API
│   │   ├── components/         # Reusable UI components
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts          # Vite configuration
│
├── anomaly_detection_system/   # Anomaly detection logic
│   ├── mainAnomalyDetection.py # Core anomaly detection
│   └── find_anomalies.py       # Anomaly finder utilities
│
├── dataset/                    # Dark matter event data (50,000 events)
│   ├── dark_matter_synthetic_dataset.csv
│   ├── dark_matter_synthetic_dataset.json
│   ├── dataset_metadata.json
│   └── ...
│
├── webapp_backend.py           # Flask backend server (main API)
├── mainClassify.py             # Event classification logic
├── requirements.txt            # Python dependencies
├── start_webapp.sh             # One-command startup script
├── .env                        # Environment variables (API keys)
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file (all documentation)
```

---

## 🎯 Usage

### 1. Anomaly Detection Page

Navigate to **Anomaly Detection** to analyze events for anomalies:

**Configuration Options:**
- **Max Events**: Number of events to analyze (10-1000, default: 100)
- **Anomaly Threshold**: Sensitivity (0.0-1.0, default: 0.3)
  - Lower = more sensitive (more anomalies)
  - Higher = less sensitive (only critical anomalies)
- **Claude AI**: Enable/disable AI classification (default: ON)

**Process:**
1. Configure detection settings
2. Click "Start Analysis"
3. Wait 1-2 minutes for AI analysis
4. View comprehensive scientific report

**Expected Results:**
- Executive Summary with total anomaly count
- Severity Breakdown (Critical/High/Medium)
- Detailed 4-part analysis for each anomaly
- Actionable recommendations

### 2. Results Dashboard

View dataset-wide analysis and visualizations:
- Event classification distribution
- Confidence score analysis
- Interactive scatter plots
- Data table with 50,000+ events

### 3. Classification

Classify individual events:
- Input event parameters (energy, S1, S2, position)
- Get AI-powered classification
- View confidence and reasoning

---

## 🔧 API Endpoints

### Backend Server (Port 5001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/dataset/load` | Load dataset information |
| POST | `/api/anomaly/analyze-dataset` | Analyze dataset for anomalies |
| POST | `/api/anomaly/detect` | Detect anomalies in single event |
| POST | `/api/classify/single` | Classify single event |
| POST | `/api/classify/batch` | Batch event classification |

### Example API Call

```bash
curl -X POST http://localhost:5001/api/anomaly/analyze-dataset \
  -H "Content-Type: application/json" \
  -d '{
    "max_events": 100,
    "use_claude": true,
    "threshold": 0.3
  }'
```

---

## 📊 Dataset

**Location**: `dataset/dark_matter_synthetic_dataset.csv`

**Size**: 50,000 synthetic dark matter events

**Features**:
- Recoil energy (keV)
- S1 signal (photoelectrons)
- S2 signal (photoelectrons)
- S2/S1 ratio
- Position (x, y, z)
- Drift time
- Event quality metrics
- Classification labels

**Particle Types**:
- Background events
- WIMP-like signatures
- Axion-like signatures
- Sterile Neutrino candidates
- Novel Anomalies

---

## 🤖 AI Integration

### Claude AI API

The application uses Anthropic's Claude API for:
- Event classification with expert-level reasoning
- Anomaly explanation and interpretation
- Confidence scoring
- Actionable recommendations

**Requirements**:
- Valid Claude API key
- Internet connection for API calls
- Sufficient API credits

**Rate Limits**:
- The system handles API timeouts gracefully
- Approximately 1 API call per event analyzed
- Average processing: 50-100 events/minute

---

## 🎨 UI Components

### Color Coding

- 🔴 **Red**: Critical anomalies (score > 0.7) - Immediate attention
- 🟠 **Orange**: High severity (score > 0.5) - Detailed study
- 🟡 **Yellow**: Medium severity (score > 0.3) - Standard review
- 🔵 **Blue**: Informational / Low priority
- 🟢 **Green**: Normal events / Success messages

### Interactive Features

- Expandable anomaly cards
- Sortable data tables
- Filterable charts
- Export capabilities
- Real-time updates
- Toast notifications

---

## 🧪 Testing

### Quick Test Commands

**Test backend health:**
```bash
curl http://localhost:5001/api/health
```

**Test dataset loading:**
```bash
curl http://localhost:5001/api/dataset/load
```

**Test anomaly detection:**
```bash
curl -X POST http://localhost:5001/api/anomaly/analyze-dataset \
  -H "Content-Type: application/json" \
  -d '{"max_events": 50, "use_claude": true, "threshold": 0.3}'
```

### Expected Results

All endpoints should return JSON responses with `"success": true` and appropriate data.

---

## 🐛 Troubleshooting

### Backend not starting

```bash
# Check if port 5001 is already in use
lsof -ti:5001

# Kill existing process
kill -9 $(lsof -ti:5001)

# Restart backend
python3 webapp_backend.py
```

### Frontend not loading

```bash
# Check if port 8080 is in use
lsof -ti:8080

# Kill existing process
kill -9 $(lsof -ti:8080)

# Restart frontend
cd webapp
npm run dev
```

### API Key Issues

1. Verify `.env` file exists and contains valid API key
2. Check API key format: `sk-ant-api03-...`
3. Ensure environment variables are loaded

### Slow Performance

- Reduce "Max Events" to 50-100
- Temporarily disable Claude AI for faster rule-based detection
- Check internet connection for API calls

---

## 📚 Additional Information

### Anomaly Report Format

Each detected anomaly includes a comprehensive 4-part scientific report:

**1. What is the Anomaly?**
- Event identifier and type
- AI classification (WIMP/Background/Axion/Neutrino/Unknown)

**2. How Bad is It?**
- Severity level (Critical/High/Medium)
- Anomaly score (0.0 - 1.0)
- Number of violation flags
- AI confidence percentage

**3. Why is It an Anomaly?**
- Event characteristics (energy, S2/S1 ratio)
- Detailed violation list with severity and weights

**4. What Should I Do?**
- Recommended action based on severity
- Reasoning for the recommendation
- Specific next steps (1-3 actionable items)

### Typical Processing Times

- **50 events**: ~30-60 seconds with Claude AI
- **100 events**: ~1-2 minutes with Claude AI
- **200+ events**: ~3-5 minutes with Claude AI
- **Without AI**: 10x faster but less detailed

### Anomaly Detection Thresholds

- **0.15-0.25**: Very sensitive (more anomalies, more false positives)
- **0.25-0.35**: Balanced (recommended for most cases)
- **0.35-0.50**: Conservative (only clear anomalies)
- **0.50+**: Very strict (only critical cases)

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify environment configuration (.env file)
3. Test backend and frontend separately
4. Check console/terminal logs for errors

**Common Issues:**
- Missing Claude API key → Add to .env file
- Port already in use → Kill existing processes
- Module not found → Run `pip install -r requirements.txt`
- Frontend won't start → Run `npm install` in webapp folder

---

**Status**: ✅ Production Ready  
**Last Updated**: October 11, 2025  
**Version**: 1.0.0

🌌 **Happy Anomaly Hunting!** 🔬
