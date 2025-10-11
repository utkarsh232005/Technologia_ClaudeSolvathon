# Anomaly Detection System Integration Guide

## Date: October 11, 2025

## Overview
Successfully integrated the existing anomaly detection system into the Dark Matter webapp. The system uses Claude AI for intelligent anomaly classification and connects to the real dataset.

## 🎯 What Was Created

### 1. Backend API Endpoints (`webapp_backend.py`)

#### New Endpoints Added:

**POST `/api/anomaly/detect`**
- Detects anomalies in event data (single or batch)
- Parameters:
  - `events`: Array of event objects or single event
  - `use_claude`: Enable/disable Claude AI analysis (default: true)
  - `threshold`: Anomaly score threshold (default: 0.3)
- Returns: Anomaly detection results with scores, flags, and classifications

**POST `/api/anomaly/analyze-dataset`**
- Analyzes the entire dark matter dataset for anomalies
- Parameters:
  - `max_events`: Maximum events to analyze (default: 100)
  - `use_claude`: Enable/disable Claude AI analysis (default: true)
  - `threshold`: Anomaly score threshold (default: 0.3)
- Returns: Statistics and top anomalies found

### 2. Frontend API Client (`webapp/src/lib/anomalyAPI.ts`)

Type-safe API client for anomaly detection:
```typescript
// Interfaces
- AnomalyFlag: Type, severity, value, weight
- AnomalyResult: Complete anomaly detection result
- AnomalyDetectionResponse: API response for anomaly detection
- DatasetAnalysisResponse: API response for dataset analysis

// Methods
- detectAnomalies(events, options): Detect anomalies in events
- analyzeDataset(options): Analyze entire dataset
- detectSingleAnomaly(event, options): Analyze single event
```

### 3. Anomaly Detection Page (`webapp/src/pages/AnomalyDetection.tsx`)

Full-featured UI with two main tabs:

#### Tab 1: Dataset Analysis
- Configure detection settings (threshold, max events, AI toggle)
- Analyze dataset with one click
- View statistics:
  - Total events analyzed
  - Anomalies detected
  - Anomaly rate
  - Average anomaly score
- Distribution by anomaly type
- List of top 20 anomalies with details

#### Tab 2: Single Event Analysis
- Input form for event data:
  - Recoil Energy (keV)
  - S1 Signal (PE)
  - S2 Signal (PE)
  - S2/S1 Ratio (auto-calculated)
- Instant anomaly detection
- Detailed results showing:
  - Classification
  - Confidence score
  - Anomaly score
  - Anomaly flags with severity levels
  - AI reasoning

### 4. Navigation Integration
- Added to sidebar menu with AlertTriangle icon
- Route: `/anomaly-detection`
- Positioned between Event Classifier and Results Dashboard

## 🔧 How It Works

### Backend Flow:
```
User Request → Flask Backend → Anomaly Detection System → Claude AI → Response
```

1. Request received at `/api/anomaly/detect` or `/api/anomaly/analyze-dataset`
2. Event data converted to dataset format
3. Anomaly detection system analyzes events:
   - Checks energy levels (< 1.0 or > 40 keV)
   - Validates S2/S1 ratios (< 1.0 or > 25)
   - Examines drift times (< 50 or > 800 μs)
   - Optional Claude AI classification
4. Results formatted and returned to frontend

### Frontend Flow:
```
User Input → API Call → Backend Processing → Results Display
```

1. User configures settings or enters event data
2. Frontend calls anomalyAPI methods
3. Backend processes and returns results
4. UI displays statistics, charts, and detailed anomalies

## 📊 Dataset Integration

**Dataset Used:** `/dataset/dark_matter_synthetic_dataset.csv`

**Columns Required:**
- `recoil_energy_keV`: Event energy
- `s2_over_s1_ratio`: Signal ratio
- `s1_area_PE`: S1 signal area
- `s2_area_PE`: S2 signal area
- `position_x_mm`, `position_y_mm`, `position_z_mm`: Position data
- `drift_time_us`: Drift time
- `s1_width_ns`: S1 pulse width

**Dataset Stats:**
- Total events: 50,000+
- All physics parameters included
- Realistic dark matter event simulations

## 🤖 Claude AI Integration

**API Key:** Uses `ANTHROPIC_API_KEY` from `.env` file

**Model:** claude-3-haiku-20240307 (fast and cost-effective)

**AI Features:**
- Event classification (Background, WIMP-like, Axion-like, Novel-Anomaly, etc.)
- Confidence scoring (0.0 - 1.0)
- Physics-based reasoning
- Low confidence flagging

**Classification Rules:**
- S2/S1 < 2.0 → Axion-like
- 2.0 ≤ S2/S1 ≤ 4.0 → WIMP-like (NR)
- S2/S1 > 5.0 → Background (ER)
- 4.0 < S2/S1 ≤ 5.0 → Novel-Anomaly

## 🚀 Running the System

### 1. Start the Backend
```bash
cd "/Users/utkarshpatrikar/IIIT Hackathon"
python3 webapp_backend.py
```

Backend will start on: `http://localhost:5001`

### 2. Start the Frontend
```bash
cd "/Users/utkarshpatrikar/IIIT Hackathon/webapp"
npm run dev
```

Frontend will start on: `http://localhost:5173`

### 3. Access Anomaly Detection
Navigate to: `http://localhost:5173/anomaly-detection`

## 🔑 Configuration

### Environment Variables
Ensure `.env` file contains:
```
ANTHROPIC_API_KEY=your-actual-api-key-here
```

### Frontend API URL
Default: `http://localhost:5001`
Override with: `VITE_API_URL` environment variable

### Detection Parameters
**Threshold** (0.0 - 1.0):
- 0.1: Very sensitive (more anomalies)
- 0.3: Balanced (recommended)
- 0.5: Conservative (fewer anomalies)

**Max Events** (10 - 1000):
- Limits dataset analysis for performance
- Higher values = longer analysis time
- Recommended: 100-200 for testing

**Claude AI Toggle**:
- Enabled: Full AI classification and reasoning
- Disabled: Physics rules only (faster)

## 📝 API Usage Examples

### Detect Anomaly in Single Event
```javascript
import anomalyAPI from '@/lib/anomalyAPI';

const result = await anomalyAPI.detectSingleAnomaly({
  energy: 5.5,
  s1: 15.5,
  s2: 89.3,
  s2s1Ratio: 5.76
}, {
  use_claude: true,
  threshold: 0.3
});

console.log(result.results[0].is_anomaly); // true/false
console.log(result.results[0].classification); // "Background (ER)"
console.log(result.results[0].anomaly_score); // 0.45
```

### Analyze Dataset
```javascript
const analysis = await anomalyAPI.analyzeDataset({
  max_events: 100,
  use_claude: true,
  threshold: 0.3
});

console.log(analysis.statistics.anomalies_detected); // 15
console.log(analysis.statistics.anomaly_rate); // 0.15 (15%)
console.log(analysis.top_anomalies); // Array of top anomalies
```

## 🎨 UI Features

### Visual Indicators
- **Red badges**: High severity anomalies
- **Yellow badges**: Medium severity
- **Blue badges**: Low severity
- **Green check**: Normal events
- **Red alert triangle**: Anomalies detected

### Interactive Elements
- Real-time input validation
- Loading states during analysis
- Toast notifications for user feedback
- Expandable anomaly details
- Hover effects on cards

### Responsive Design
- Mobile-friendly layout
- Grid adapts to screen size
- Scrollable lists for long results
- Touch-friendly buttons

## 🔍 Anomaly Detection Logic

### Physics-Based Checks
1. **Extreme Energy**
   - Low: < 1.0 keV (high severity)
   - High: > 40 keV (high severity)

2. **Unusual S2/S1 Ratio**
   - Low: < 1.0 (medium severity)
   - High: > 25 (medium severity)

3. **Abnormal Drift Time**
   - Short: < 50 μs (medium severity)
   - Long: > 800 μs (medium severity)

4. **AI Confidence**
   - Low confidence: < 0.6 (high severity)
   - Indicates uncertainty in classification

### Scoring System
Each flag contributes to total anomaly score:
- High severity: 0.25-0.3 weight
- Medium severity: 0.15-0.2 weight
- Low severity: 0.05-0.1 weight

**Threshold**: Events with score ≥ threshold are flagged as anomalies

## ✅ Integration Checklist

- [x] Backend API endpoints created
- [x] Frontend API client implemented
- [x] Anomaly Detection page created
- [x] Navigation routes added
- [x] Sidebar menu updated
- [x] TypeScript types defined
- [x] Error handling implemented
- [x] Loading states added
- [x] Toast notifications integrated
- [x] Responsive design applied
- [x] Dataset integration verified
- [x] Claude AI connection working
- [x] No TypeScript errors
- [x] No ESLint errors

## 🎯 Testing

### Test Single Event
1. Navigate to Anomaly Detection page
2. Click "Single Event" tab
3. Enter test values:
   - Energy: 45 (high)
   - S1: 10
   - S2: 100
   - Ratio: 10 (auto-calculated)
4. Click "Detect Anomaly"
5. Should flag as anomaly (extreme energy)

### Test Dataset Analysis
1. Navigate to Anomaly Detection page
2. Click "Dataset Analysis" tab
3. Set max events: 50
4. Click "Start Analysis"
5. Wait 30-60 seconds for results
6. Should show anomalies with statistics

## 🚨 Troubleshooting

### Backend Not Responding
- Check if `webapp_backend.py` is running
- Verify port 5001 is not in use
- Check `.env` file for API key

### Claude AI Errors
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API key is valid and active
- Try disabling Claude AI toggle (use physics rules only)

### No Anomalies Detected
- Lower the threshold (try 0.1)
- Enable Claude AI analysis
- Check if dataset file exists
- Verify event data is valid

### TypeScript Errors
- Run: `npm install` in webapp folder
- Check all imports are correct
- Verify API types match backend response

## 📈 Performance

**Dataset Analysis:**
- 100 events with AI: ~30-60 seconds
- 100 events without AI: ~5-10 seconds
- 500 events with AI: ~2-5 minutes

**Single Event:**
- With AI: ~2-3 seconds
- Without AI: < 1 second

**Recommendations:**
- Use AI for detailed analysis
- Disable AI for quick scanning
- Limit max events for faster results

## 🎓 Next Steps

1. **Add Batch File Upload**
   - Allow users to upload CSV files
   - Process entire files for anomalies

2. **Export Results**
   - Download anomaly reports as CSV/JSON
   - Generate PDF reports

3. **Visualization**
   - Add charts for anomaly distribution
   - Plot anomaly scores over time

4. **Filtering**
   - Filter by anomaly type
   - Sort by score/severity

5. **Comparison**
   - Compare multiple datasets
   - Benchmark anomaly rates

## 📚 Documentation

- Backend API: See `/api/anomaly/` endpoints
- Frontend Types: `webapp/src/lib/anomalyAPI.ts`
- Component: `webapp/src/pages/AnomalyDetection.tsx`
- Anomaly System: `anomaly_detection_system/mainAnomalyDetection.py`

## 🎉 Summary

The anomaly detection system is now fully integrated into the webapp with:
- ✅ Real-time anomaly detection
- ✅ Claude AI-powered classification
- ✅ Full dataset analysis capability
- ✅ Intuitive, modern UI
- ✅ Error-free TypeScript implementation
- ✅ Responsive design
- ✅ Production-ready code

Users can now detect and analyze anomalies in dark matter events directly from the web interface!
