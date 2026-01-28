# System Architecture Documentation

## Overview

The Dark Matter Classification System is a full-stack web application that leverages Claude AI to classify and analyze dark matter detection events from liquid xenon time projection chamber (TPC) detectors. The system provides real-time event classification, anomaly detection, and comprehensive data visualization capabilities.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         React + TypeScript + Vite Application            │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │  Event     │  │   Results    │  │    Anomaly      │  │  │
│  │  │ Classifier │  │  Dashboard   │  │   Detection     │  │  │
│  │  └────────────┘  └──────────────┘  └─────────────────┘  │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │   Data     │  │   Settings   │  │     Report      │  │  │
│  │  │ Generator  │  │              │  │   Generator     │  │  │
│  │  └────────────┘  └──────────────┘  └─────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (HTTP/JSON)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Layer                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Flask REST API Server                       │  │
│  │         (webapp_backend.py - Port 5001)                 │  │
│  │                                                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │   Health     │  │ Classification│  │   Anomaly    │  │  │
│  │  │   Check      │  │     API       │  │  Detection   │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │   Dataset    │  │    Batch      │  │    Export    │  │  │
│  │  │   Sampler    │  │  Processing   │  │    Results   │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Classification Layer                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Classification System                         │  │
│  │              (mainClassify.py)                           │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │        Claude AI Integration                     │   │  │
│  │  │    (Anthropic API - Claude 3 Haiku)             │   │  │
│  │  │                                                   │   │  │
│  │  │  • Event prompt generation                       │   │  │
│  │  │  • Structured output schema                      │   │  │
│  │  │  • Physics-based reasoning                       │   │  │
│  │  │  • Multi-factor confidence analysis              │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │      Anomaly Detection System                    │   │  │
│  │  │  (anomaly_detection_system/mainAnomalyDetection) │   │  │
│  │  │                                                   │   │  │
│  │  │  • Advanced anomaly scoring                      │   │  │
│  │  │  • Statistical analysis                          │   │  │
│  │  │  • Claude-powered classification                 │   │  │
│  │  │  • Hypothesis generation                         │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Data Access
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Dataset Storage & Management                     │  │
│  │                                                           │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Dark Matter Synthetic Dataset                     │ │  │
│  │  │  (dataset/dark_matter_synthetic_dataset.csv)      │ │  │
│  │  │  • 50,000 simulated events                        │ │  │
│  │  │  • Realistic detector physics                     │ │  │
│  │  │  • Multiple event types                           │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Classification Results                            │ │  │
│  │  │  (classification_system/results/)                  │ │  │
│  │  │  • JSON formatted outputs                         │ │  │
│  │  │  • Detailed reasoning logs                        │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## System Components

### 1. Frontend Layer

**Technology Stack:**
- React 18 with TypeScript
- Vite for build tooling and hot module replacement
- TailwindCSS for styling
- Shadcn/ui component library
- Recharts for data visualization

**Key Components:**

#### Pages (`webapp/src/pages/`)

1. **Index.tsx** - Landing page with system overview and quick access
2. **EventClassifier.tsx** - Real-time event classification interface
3. **ResultsDashboard.tsx** - Classification results visualization with charts
4. **AnomalyDetection.tsx** - Anomaly detection and analysis interface
5. **DataGenerator.tsx** - Dataset generation and management
6. **ReportGenerator.tsx** - Export and reporting functionality
7. **Settings.tsx** - System configuration and API key management

#### UI Components (`webapp/src/components/`)

- **PageLayout.tsx** - Consistent layout wrapper with navigation
- **Navigation.tsx** - Responsive navigation menu
- **CommandPalette.tsx** - Keyboard shortcuts for power users
- **FeatureCard.tsx** - Reusable card components for features
- **LoadingComponents.tsx** - Loading states and skeletons

#### API Integration (`webapp/src/lib/`)

- **classificationAPI.ts** - Classification endpoint integration
- **anomalyAPI.ts** - Anomaly detection endpoint integration
- **utils.ts** - Utility functions and helpers

### 2. Backend Layer

**Technology Stack:**
- Python 3.11+
- Flask web framework
- Flask-CORS for cross-origin requests
- Pandas for data manipulation
- NumPy for numerical computations

**Main File: webapp_backend.py**

**API Endpoints:**

1. **Health Check**
   - `GET /api/health`
   - Returns service status and timestamp

2. **Event Classification**
   - `POST /api/classify`
   - Classifies single dark matter events
   - Returns classification, confidence, and detailed analysis

3. **Batch Classification**
   - `POST /api/classify-batch`
   - Processes multiple events in parallel
   - Progress tracking and error handling

4. **Anomaly Detection**
   - `POST /api/detect-anomalies`
   - Analyzes dataset for unusual patterns
   - Returns ranked anomalies with scores

5. **Dataset Sampling**
   - `GET /api/sample-events`
   - Returns random sample of events
   - Configurable sample size and filters

6. **Export Results**
   - `GET /api/export-results`
   - Exports classification results
   - Supports JSON and CSV formats

**Key Features:**
- Async processing for long-running tasks
- Request validation and error handling
- NaN/Infinity value cleaning for JSON serialization
- CORS configuration for frontend integration
- Comprehensive logging and debugging

### 3. AI Classification Layer

#### Classification System (mainClassify.py)

**Core Functions:**

1. **classify_event_api(event_data)**
   - Main classification entry point
   - Validates event data
   - Calls Claude API with structured prompts
   - Returns classification with confidence

2. **create_api_prompt_and_schema(event_data)**
   - Generates physics-based prompt for Claude
   - Includes S2/S1 ratio classification rules
   - Defines JSON response schema
   - Embeds domain expertise in prompt

3. **select_and_sample_events(dataset, num_events)**
   - Intelligent event sampling
   - Stratified sampling across event types
   - Prioritizes interesting candidates

**Classification Rules:**

The system uses S2/S1 ratio (secondary to primary signal ratio) for classification:

- **S2/S1 > 5.0** → Background (Electronic Recoil - ER)
  - Gamma rays, beta particles
  - High ionization yield
  
- **2.0 ≤ S2/S1 ≤ 4.0** → WIMP-like (Nuclear Recoil - NR)
  - Dark matter candidate signatures
  - Medium ionization yield
  
- **S2/S1 < 2.0** → Axion-like or Sterile Neutrino
  - Exotic particle interactions
  - Low ionization yield
  
- **4.0 < S2/S1 ≤ 5.0** → Novel Anomaly
  - Boundary region events
  - Requires further investigation

#### Anomaly Detection System (anomaly_detection_system/)

**Files:**
- **mainAnomalyDetection.py** - Main anomaly detection logic
- **find_anomalies.py** - Statistical anomaly scoring

**Detection Methods:**

1. **Statistical Analysis**
   - Z-score calculations for outlier detection
   - Multi-dimensional feature analysis
   - Deviation from expected distributions

2. **Physics-Based Scoring**
   - Unusual S2/S1 ratios
   - Energy spectrum anomalies
   - Position-based outliers
   - Temporal patterns

3. **Claude-Enhanced Analysis**
   - AI-powered anomaly classification
   - Hypothesis generation for unusual events
   - Context-aware reasoning

### 4. Data Layer

#### Dataset Generation (main.py)

**Physics Simulation:**

The synthetic dataset simulates realistic dark matter detector events:

1. **Event Types Generated:**
   - Background ER (93%) - Electronic recoils from radiation
   - WIMP NR (4%) - Nuclear recoils from dark matter
   - Axion-like (1.5%) - Exotic low-energy signals
   - Sterile Neutrino (0.5%) - Ultra-low energy events
   - Novel Anomaly (1%) - Boundary region events

2. **Detector Physics:**
   - Liquid xenon TPC parameters
   - Realistic signal responses (S1/S2)
   - Position-dependent effects
   - Energy-dependent noise
   - Drift time calculations

3. **Data Quality Effects:**
   - Missing signals (threshold effects)
   - Position reconstruction failures
   - Pile-up events
   - Detector non-uniformities

**Dataset Structure:**

50,000 events with 25+ features per event:
- Energy features (recoil_energy_keV)
- Light signals (s1_area_PE, s1_light_yield, s1_width_ns)
- Charge signals (s2_area_PE, s2_charge_yield, s2_width_us)
- Position (x, y, z coordinates, drift_time_us)
- Derived features (s2_over_s1_ratio, log10_s2_over_s1)
- Detector conditions (temperature, pressure, electric field)
- Quality metrics (event_quality, pile_up_flag)
- Labels (ground truth for validation)

#### Storage Format

- **CSV**: `dataset/dark_matter_synthetic_dataset.csv`
- **JSON**: `dataset/dark_matter_synthetic_dataset.json`
- **Metadata**: `dataset/dataset_metadata.json`

## Data Flow

### Event Classification Flow

```
1. User Input (Frontend)
   ↓
2. HTTP POST to /api/classify
   ↓
3. Event validation and preprocessing
   ↓
4. Create physics-based prompt
   ↓
5. Call Claude API with structured schema
   ↓
6. Parse and validate Claude response
   ↓
7. Format result for webapp
   ↓
8. Return JSON response to frontend
   ↓
9. Display results with visualizations
```

### Anomaly Detection Flow

```
1. Load dataset or receive events
   ↓
2. Calculate statistical features
   ↓
3. Score events using multiple metrics
   ↓
4. Rank anomalies by combined score
   ↓
5. Select top N anomalies
   ↓
6. Enhance with Claude classification
   ↓
7. Generate hypotheses for unusual events
   ↓
8. Return detailed anomaly report
```

## Technology Integration

### Claude AI Integration

**Purpose:**
- Provide expert-level physics reasoning
- Handle complex multi-factor analysis
- Generate human-readable explanations
- Support hypothesis generation

**Implementation:**
- Uses Anthropic's Messages API
- Model: Claude 3 Haiku (claude-3-haiku-20240307)
- Structured output via JSON schema
- System prompts encode domain expertise

**Prompt Engineering:**
- Physics-based classification rules
- Numerical thresholds and ranges
- Multi-step analysis framework
- Request structured JSON output
- Include confidence factors

### API Communication

**Frontend → Backend:**
- REST API over HTTP
- JSON request/response format
- CORS enabled for localhost development
- Error handling and retries

**Backend → Claude API:**
- HTTPS POST requests
- API key authentication
- Rate limiting awareness
- Timeout handling
- Response validation

## Deployment Architecture

### Development Environment

```
Terminal 1: Flask Backend (Port 5001)
  python webapp_backend.py

Terminal 2: React Frontend (Port 5173)
  cd webapp
  npm run dev
```

### Production Deployment

**Backend (Render.com):**
- Python 3.11 environment
- Flask with gunicorn
- Environment variables for API keys
- Auto-deploy from GitHub

**Frontend (Vercel.com):**
- Node.js build environment
- Static site generation
- Environment variables for API URLs
- Auto-deploy from GitHub
- CDN distribution

## Security Considerations

1. **API Key Management:**
   - API keys stored in .env files
   - Never committed to version control
   - Environment variables in production

2. **Input Validation:**
   - Event data validation
   - Type checking and range validation
   - SQL injection prevention (though no DB)
   - XSS prevention via React

3. **CORS Configuration:**
   - Restricted origins in production
   - Specific allowed methods
   - Credential handling

4. **Error Handling:**
   - No sensitive data in error messages
   - Logging without exposing secrets
   - Graceful degradation

## Scalability Considerations

**Current Limitations:**
- Single Flask process (suitable for demo)
- Synchronous Claude API calls
- In-memory data processing

**Future Improvements:**
- Multi-process Flask with gunicorn workers
- Async/await for Claude API calls
- Database for persistent storage
- Caching layer for repeated classifications
- Queue system for batch processing
- Load balancing for multiple backends

## Performance Optimization

1. **Frontend:**
   - Code splitting with React.lazy
   - Memoization of expensive computations
   - Debounced API calls
   - Optimized chart rendering

2. **Backend:**
   - Pandas vectorization for data operations
   - Efficient JSON serialization
   - Response compression
   - Minimal data transfer

3. **AI Layer:**
   - Batch classification support
   - Prompt optimization for token efficiency
   - Model selection (Haiku for speed)
   - Result caching potential

## Monitoring and Logging

**Backend Logging:**
- Request/response logging
- Error tracking with stack traces
- Performance metrics (processing time)
- API call monitoring

**Frontend Logging:**
- Browser console for development
- Error boundary for React errors
- User action tracking potential

## Configuration Management

**Environment Variables:**
```
ANTHROPIC_API_KEY - Claude API authentication
CLAUDE_API_KEY - Alternative key name
FLASK_ENV - Development/production mode
PORT - Backend server port (default: 5001)
```

**Configuration Files:**
- `.env` - Local environment variables
- `.env.example` - Template for setup
- `webapp/vite.config.ts` - Frontend build config
- `webapp/tailwind.config.ts` - Styling config

## Development Workflow

1. **Local Development:**
   - Use start_dev.bat (Windows) or start_dev.sh (Mac/Linux)
   - Hot reload enabled for both frontend and backend
   - Real-time code changes without restart

2. **Testing:**
   - Manual testing via web interface
   - API testing with curl/Postman
   - Console logging for debugging

3. **Deployment:**
   - Push to GitHub repository
   - Auto-deploy triggers on main branch
   - Environment variables configured in hosting platforms

## Version Control

**Git Structure:**
- `main` branch for production
- Feature branches for development
- `.gitignore` for sensitive files
- Commit history for traceability

## Dependencies Management

**Python (requirements.txt):**
- Core: pandas, numpy, flask
- AI: anthropic
- Utilities: python-dotenv, flask-cors

**JavaScript (package.json):**
- Framework: react, react-dom
- Build: vite, typescript
- UI: tailwindcss, shadcn/ui
- Charts: recharts

## Future Architecture Enhancements

1. **Database Integration:**
   - PostgreSQL for event storage
   - Historical classification tracking
   - User management and authentication

2. **Real-time Updates:**
   - WebSocket for live event streaming
   - Server-sent events for progress updates
   - Real-time dashboard updates

3. **Advanced Analytics:**
   - Time-series analysis
   - Batch statistical processing
   - Machine learning model integration

4. **Microservices:**
   - Separate classification service
   - Dedicated anomaly detection service
   - Data processing pipeline

5. **Enhanced Security:**
   - User authentication (JWT)
   - Role-based access control
   - API rate limiting
   - Audit logging
