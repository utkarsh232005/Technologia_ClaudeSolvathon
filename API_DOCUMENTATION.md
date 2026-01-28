# API Documentation

## Overview

The Dark Matter Classification System provides a RESTful API for event classification, anomaly detection, and data management. The API is built with Flask and served on port 5001 (default).

**Base URL**: `http://localhost:5001/api`

**Content-Type**: `application/json`

**CORS**: Enabled for frontend integration

---

## Table of Contents

1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [Event Classification](#event-classification)
   - [Batch Classification](#batch-classification)
   - [Anomaly Detection](#anomaly-detection)
   - [Sample Events](#sample-events)
   - [Export Results](#export-results)
3. [Request/Response Formats](#requestresponse-formats)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Examples](#examples)

---

## Authentication

**Current Version**: No authentication required (development/demo mode)

**Future Versions**: Will support API key authentication
```
Authorization: Bearer <api-key>
```

---

## Endpoints

### Health Check

Check if the API server is running and responsive.

**Endpoint**: `GET /api/health`

**Request**: No parameters required

**Response**:
```json
{
  "status": "healthy",
  "service": "Dark Matter Classification API",
  "timestamp": "2024-01-28T12:34:56.789Z"
}
```

**Status Codes**:
- `200 OK`: Service is healthy

**Example**:
```bash
curl http://localhost:5001/api/health
```

---

### Event Classification

Classify a single dark matter detection event using Claude AI.

**Endpoint**: `POST /api/classify`

**Request Body**:
```json
{
  "event": {
    "event_id": "evt_12345",
    "recoil_energy_keV": 12.5,
    "s1_area_PE": 25.3,
    "s2_area_PE": 85.7,
    "s2_over_s1_ratio": 3.39,
    "log10_s2_over_s1": 0.53,
    "position_x_mm": 125.4,
    "position_y_mm": -87.2,
    "position_z_mm": 450.1,
    "drift_time_us": 338.3,
    "s1_width_ns": 48.5,
    "s2_width_us": 2.35,
    "event_quality": 0.92,
    "pile_up_flag": 0,
    "detector_temp_K": 175.2,
    "gas_pressure_bar": 2.05,
    "electric_field_V_cm": 195.3
  }
}
```

**Response**:
```json
{
  "success": true,
  "classification": {
    "type": "WIMP",
    "label": "WIMP-like (NR)",
    "confidence": 82.5,
    "severity": "high",
    "processingTime": 1.23
  },
  "analysis": {
    "keyFeatures": [
      "Medium S2/S1 ratio",
      "WIMP energy range",
      "Fiducial volume position"
    ],
    "reasoning": {
      "s2s1Analysis": "The S2/S1 ratio of 3.39 falls within the nuclear recoil band (2.0-4.0), characteristic of WIMP-nucleus elastic scattering...",
      "energyAnalysis": "Recoil energy of 12.5 keV is within the optimal WIMP search window (1-50 keV)...",
      "positionAnalysis": "Event position is well within the fiducial volume, minimizing edge effects...",
      "pulseCharacteristics": "S1 width of 48.5ns and S2 width of 2.35μs are consistent with single-site nuclear recoils...",
      "physicsInterpretation": "Event signature consistent with elastic scattering of a ~50 GeV WIMP off a xenon nucleus...",
      "comparisonWithLiterature": "Similar events reported in XENONnT 2023 results...",
      "alternativeInterpretations": "Could be neutron scatter from cosmic ray muon, though position argues against...",
      "confidenceFactors": "High confidence due to clean single-scatter signature and proper energy range...",
      "followUpRecommendations": "Include in WIMP candidate list. Check for coincident muon veto signals..."
    }
  },
  "processingTime": 1.23
}
```

**Status Codes**:
- `200 OK`: Classification successful
- `400 Bad Request`: Invalid event data
- `500 Internal Server Error`: Classification failed

**Required Fields**:
- `recoil_energy_keV`
- `s1_area_PE`
- `s2_area_PE`
- `s2_over_s1_ratio`

**Optional Fields**: All other fields are optional but recommended for better analysis

---

### Batch Classification

Classify multiple events in a single request with parallel processing.

**Endpoint**: `POST /api/classify-batch`

**Request Body**:
```json
{
  "events": [
    {
      "event_id": "evt_001",
      "recoil_energy_keV": 12.5,
      "s1_area_PE": 25.3,
      "s2_area_PE": 85.7,
      "s2_over_s1_ratio": 3.39
    },
    {
      "event_id": "evt_002",
      "recoil_energy_keV": 8.3,
      "s1_area_PE": 18.2,
      "s2_area_PE": 145.6,
      "s2_over_s1_ratio": 8.0
    }
  ],
  "options": {
    "parallel": true,
    "max_workers": 5
  }
}
```

**Response**:
```json
{
  "success": true,
  "totalEvents": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "event_id": "evt_001",
      "success": true,
      "classification": {
        "type": "WIMP",
        "label": "WIMP-like (NR)",
        "confidence": 82.5
      }
    },
    {
      "event_id": "evt_002",
      "success": true,
      "classification": {
        "type": "Background",
        "label": "Background (ER)",
        "confidence": 91.3
      }
    }
  ],
  "summary": {
    "WIMP": 1,
    "Background": 1,
    "Axion": 0,
    "Anomaly": 0
  },
  "processingTime": 2.45
}
```

**Status Codes**:
- `200 OK`: Batch processed (check individual results for errors)
- `400 Bad Request`: Invalid request format
- `413 Payload Too Large`: Too many events (limit: 100)

**Limits**:
- Maximum events per batch: 100
- Maximum parallel workers: 10

---

### Anomaly Detection

Detect and analyze anomalous events in a dataset.

**Endpoint**: `POST /api/detect-anomalies`

**Request Body**:
```json
{
  "events": [
    {
      "event_id": "evt_001",
      "recoil_energy_keV": 12.5,
      "s2_over_s1_ratio": 3.39,
      "position_x_mm": 125.4,
      "position_y_mm": -87.2
    }
  ],
  "options": {
    "top_n": 10,
    "threshold": 0.8,
    "generate_hypotheses": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "totalEvents": 1000,
  "anomaliesFound": 10,
  "anomalies": [
    {
      "event_id": "evt_523",
      "anomalyScore": 0.95,
      "rank": 1,
      "classification": "Novel Anomaly",
      "confidence": 0.87,
      "reasons": [
        "Unusual S2/S1 ratio: 4.23 (boundary region)",
        "Energy spike at 45.2 keV",
        "Position near detector edge"
      ],
      "hypothesis": "Potential primordial black hole evaporation signature or rare double-scatter event..."
    }
  ],
  "summary": {
    "averageAnomalyScore": 0.82,
    "highSeverity": 3,
    "mediumSeverity": 5,
    "lowSeverity": 2
  },
  "processingTime": 5.67
}
```

**Status Codes**:
- `200 OK`: Anomaly detection successful
- `400 Bad Request`: Invalid parameters
- `500 Internal Server Error`: Detection failed

**Parameters**:
- `top_n` (optional): Number of top anomalies to return (default: 10, max: 100)
- `threshold` (optional): Minimum anomaly score (default: 0.7, range: 0.0-1.0)
- `generate_hypotheses` (optional): Generate physics hypotheses (default: false)

---

### Sample Events

Retrieve a random sample of events from the dataset.

**Endpoint**: `GET /api/sample-events`

**Query Parameters**:
- `count` (optional): Number of events (default: 10, max: 100)
- `type` (optional): Event type filter (`WIMP`, `Background`, `Axion`, `Anomaly`)
- `energy_min` (optional): Minimum energy in keV
- `energy_max` (optional): Maximum energy in keV

**Example Request**:
```
GET /api/sample-events?count=5&type=WIMP&energy_min=5&energy_max=50
```

**Response**:
```json
{
  "success": true,
  "count": 5,
  "filters": {
    "type": "WIMP",
    "energy_min": 5,
    "energy_max": 50
  },
  "events": [
    {
      "event_id": 12345,
      "recoil_energy_keV": 12.5,
      "s1_area_PE": 25.3,
      "s2_area_PE": 85.7,
      "s2_over_s1_ratio": 3.39,
      "label": "WIMP-like"
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Sample retrieved successfully
- `400 Bad Request`: Invalid parameters
- `404 Not Found`: No events match criteria

---

### Export Results

Export classification results in various formats.

**Endpoint**: `GET /api/export-results`

**Query Parameters**:
- `format` (required): Export format (`json`, `csv`)
- `session_id` (optional): Specific session results
- `type` (optional): Filter by event type

**Example Request**:
```
GET /api/export-results?format=csv&type=WIMP
```

**Response (JSON)**:
```json
{
  "success": true,
  "format": "json",
  "eventCount": 50,
  "results": [
    {
      "event_id": "evt_001",
      "classification": "WIMP-like (NR)",
      "confidence": 82.5,
      "timestamp": "2024-01-28T12:34:56Z"
    }
  ]
}
```

**Response (CSV)**:
```csv
event_id,classification,confidence,timestamp
evt_001,WIMP-like (NR),82.5,2024-01-28T12:34:56Z
evt_002,Background (ER),91.3,2024-01-28T12:34:57Z
```

**Status Codes**:
- `200 OK`: Export successful
- `400 Bad Request`: Invalid format
- `404 Not Found`: No results found

---

## Request/Response Formats

### Event Object Schema

**Complete Event Object**:
```typescript
interface Event {
  // Identification
  event_id?: string | number;
  
  // Energy
  recoil_energy_keV: number;
  
  // Light Signal (S1)
  s1_light_yield?: number;
  s1_area_PE: number;
  s1_width_ns?: number;
  
  // Charge Signal (S2)
  s2_charge_yield?: number;
  s2_area_PE: number;
  s2_width_us?: number;
  
  // Derived Features
  s2_over_s1_ratio: number;
  log10_s2_over_s1?: number;
  
  // Position
  position_x_mm?: number;
  position_y_mm?: number;
  position_z_mm?: number;
  drift_time_us?: number;
  
  // Detector Conditions
  detector_temp_K?: number;
  gas_pressure_bar?: number;
  electric_field_V_cm?: number;
  
  // Quality
  event_quality?: number;
  pile_up_flag?: 0 | 1;
  
  // Metadata
  timestamp?: string;
  interaction_type?: string;
  particle_source?: string;
  label?: string;
}
```

### Classification Response Schema

```typescript
interface ClassificationResponse {
  success: boolean;
  classification: {
    type: 'WIMP' | 'Background' | 'Axion' | 'Anomaly' | 'Unknown';
    label: string;
    confidence: number;  // 0-100
    severity: 'critical' | 'high' | 'medium' | 'low';
    processingTime: number;  // seconds
  };
  analysis: {
    keyFeatures: string[];
    reasoning: {
      s2s1Analysis: string;
      energyAnalysis: string;
      positionAnalysis: string;
      pulseCharacteristics: string;
      physicsInterpretation: string;
      comparisonWithLiterature: string;
      alternativeInterpretations: string;
      confidenceFactors: string;
      followUpRecommendations: string;
    };
  };
  processingTime: number;
  error?: string;
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_EVENT_DATA",
    "message": "Missing required field: s2_over_s1_ratio",
    "details": {
      "field": "s2_over_s1_ratio",
      "expected": "number",
      "received": "undefined"
    }
  },
  "timestamp": "2024-01-28T12:34:56Z"
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_EVENT_DATA` | Event data validation failed | 400 |
| `MISSING_REQUIRED_FIELD` | Required field missing | 400 |
| `INVALID_FIELD_TYPE` | Field has wrong type | 400 |
| `CLASSIFICATION_FAILED` | Claude API error | 500 |
| `TIMEOUT` | Request timeout | 504 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

### Validation Rules

**Energy Validation**:
```python
if not 0.1 <= recoil_energy_keV <= 1000:
    raise ValueError("Energy must be between 0.1 and 1000 keV")
```

**S2/S1 Ratio Validation**:
```python
if not 0.1 <= s2_over_s1_ratio <= 100:
    raise ValueError("S2/S1 ratio must be between 0.1 and 100")
```

**Position Validation**:
```python
if position_x_mm and abs(position_x_mm) > 500:
    raise ValueError("Position X must be within ±500 mm")
```

---

## Rate Limiting

**Current Implementation**: No rate limiting (development mode)

**Future Implementation**:
- 60 requests per minute per IP
- 1000 requests per hour per API key
- Batch classification counts as N requests (N = number of events)

**Rate Limit Headers** (future):
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1706444096
```

---

## Examples

### Example 1: Classify Single Event (Python)

```python
import requests
import json

url = "http://localhost:5001/api/classify"

event_data = {
    "event": {
        "event_id": "test_001",
        "recoil_energy_keV": 12.5,
        "s1_area_PE": 25.3,
        "s2_area_PE": 85.7,
        "s2_over_s1_ratio": 3.39,
        "position_x_mm": 125.4,
        "position_y_mm": -87.2,
        "position_z_mm": 450.1
    }
}

response = requests.post(url, json=event_data)

if response.status_code == 200:
    result = response.json()
    print(f"Classification: {result['classification']['label']}")
    print(f"Confidence: {result['classification']['confidence']}%")
else:
    print(f"Error: {response.status_code}")
    print(response.json())
```

### Example 2: Batch Classification (JavaScript)

```javascript
const classifyBatch = async (events) => {
  const response = await fetch('http://localhost:5001/api/classify-batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      events: events,
      options: {
        parallel: true,
        max_workers: 5
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`Classified ${data.successful}/${data.totalEvents} events`);
  return data;
};

// Usage
const events = [
  {
    event_id: "evt_001",
    recoil_energy_keV: 12.5,
    s1_area_PE: 25.3,
    s2_area_PE: 85.7,
    s2_over_s1_ratio: 3.39
  },
  {
    event_id: "evt_002",
    recoil_energy_keV: 8.3,
    s1_area_PE: 18.2,
    s2_area_PE: 145.6,
    s2_over_s1_ratio: 8.0
  }
];

classifyBatch(events).then(results => {
  console.log(results);
});
```

### Example 3: Anomaly Detection (cURL)

```bash
curl -X POST http://localhost:5001/api/detect-anomalies \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "event_id": "evt_001",
        "recoil_energy_keV": 45.2,
        "s2_over_s1_ratio": 4.23,
        "position_x_mm": 485.5
      }
    ],
    "options": {
      "top_n": 10,
      "threshold": 0.8,
      "generate_hypotheses": true
    }
  }'
```

### Example 4: Sample Events (TypeScript)

```typescript
interface SampleOptions {
  count?: number;
  type?: 'WIMP' | 'Background' | 'Axion' | 'Anomaly';
  energy_min?: number;
  energy_max?: number;
}

const sampleEvents = async (options: SampleOptions) => {
  const params = new URLSearchParams();
  if (options.count) params.append('count', options.count.toString());
  if (options.type) params.append('type', options.type);
  if (options.energy_min) params.append('energy_min', options.energy_min.toString());
  if (options.energy_max) params.append('energy_max', options.energy_max.toString());
  
  const url = `http://localhost:5001/api/sample-events?${params}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
};

// Usage
sampleEvents({
  count: 5,
  type: 'WIMP',
  energy_min: 5,
  energy_max: 50
}).then(data => {
  console.log(`Retrieved ${data.count} WIMP events`);
  data.events.forEach(event => {
    console.log(`Event ${event.event_id}: ${event.recoil_energy_keV} keV`);
  });
});
```

### Example 5: Export Results (Python)

```python
import requests
import pandas as pd
from io import StringIO

# Export as CSV
url = "http://localhost:5001/api/export-results"
params = {
    "format": "csv",
    "type": "WIMP"
}

response = requests.get(url, params=params)

if response.status_code == 200:
    # Parse CSV data
    df = pd.read_csv(StringIO(response.text))
    print(f"Exported {len(df)} WIMP events")
    print(df.head())
    
    # Save to file
    df.to_csv("wimp_results.csv", index=False)
else:
    print(f"Export failed: {response.status_code}")
```

---

## Testing

### Health Check Test

```bash
# Test if server is running
curl http://localhost:5001/api/health

# Expected output:
# {"status":"healthy","service":"Dark Matter Classification API","timestamp":"..."}
```

### Full Integration Test

```python
import requests
import time

BASE_URL = "http://localhost:5001/api"

def test_api():
    # 1. Health check
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    print("✓ Health check passed")
    
    # 2. Sample events
    print("\nTesting sample events...")
    response = requests.get(f"{BASE_URL}/sample-events?count=1")
    assert response.status_code == 200
    event = response.json()['events'][0]
    print(f"✓ Sampled event: {event['event_id']}")
    
    # 3. Classify event
    print("\nTesting classification...")
    start = time.time()
    response = requests.post(f"{BASE_URL}/classify", json={"event": event})
    elapsed = time.time() - start
    assert response.status_code == 200
    result = response.json()
    print(f"✓ Classification: {result['classification']['label']}")
    print(f"✓ Confidence: {result['classification']['confidence']}%")
    print(f"✓ Time: {elapsed:.2f}s")
    
    # 4. Batch classification
    print("\nTesting batch classification...")
    response = requests.get(f"{BASE_URL}/sample-events?count=3")
    events = response.json()['events']
    response = requests.post(f"{BASE_URL}/classify-batch", 
                            json={"events": events})
    assert response.status_code == 200
    batch_result = response.json()
    print(f"✓ Batch: {batch_result['successful']}/{batch_result['totalEvents']} successful")
    
    print("\n✅ All tests passed!")

if __name__ == "__main__":
    test_api()
```

---

## Troubleshooting

### Common Issues

**1. Connection Refused**
```
Error: Connection refused to localhost:5001
```
**Solution**: Make sure Flask backend is running:
```bash
python webapp_backend.py
```

**2. CORS Error**
```
Error: CORS policy blocked request
```
**Solution**: Ensure Flask-CORS is enabled in backend

**3. Invalid Response**
```
Error: Cannot parse response as JSON
```
**Solution**: Check Claude API key is configured correctly

**4. Timeout**
```
Error: Request timeout after 60s
```
**Solution**: Claude API may be slow. Increase timeout or check API status

**5. Missing Required Field**
```
Error: Missing required field: s2_over_s1_ratio
```
**Solution**: Ensure all required fields are included in request

---

## API Versioning

**Current Version**: v1 (implicit)

**Future Versions**: Will use explicit versioning in URL
```
/api/v1/classify
/api/v2/classify
```

**Version Policy**:
- v1: Stable, no breaking changes
- v2: May introduce breaking changes with migration guide
- Deprecated versions supported for 6 months

---

## Performance Benchmarks

**Single Classification**:
- Average: 1.2s
- Min: 0.8s
- Max: 3.0s

**Batch Classification (10 events)**:
- Sequential: ~12s
- Parallel (5 workers): ~2.5s

**Anomaly Detection (1000 events)**:
- Statistical scoring: 0.5s
- With Claude enhancement: 5-10s

---

## Support

For API issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [Examples](#examples)
3. Enable debug logging: `FLASK_ENV=development`
4. Check server logs for detailed error messages

For feature requests or bugs:
- Open an issue on GitHub
- Include request/response examples
- Provide server logs if applicable
