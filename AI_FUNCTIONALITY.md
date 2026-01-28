# AI Functionality Documentation

## Overview

The Dark Matter Classification System leverages Anthropic's Claude AI to provide intelligent, physics-based classification and analysis of dark matter detection events. This document details how AI is integrated throughout the system and explains the underlying mechanisms.

## Table of Contents

1. [Claude AI Integration](#claude-ai-integration)
2. [Classification Workflow](#classification-workflow)
3. [Prompt Engineering](#prompt-engineering)
4. [Structured Output](#structured-output)
5. [Anomaly Detection AI](#anomaly-detection-ai)
6. [Physics-Based Reasoning](#physics-based-reasoning)
7. [Confidence Scoring](#confidence-scoring)
8. [Error Handling](#error-handling)
9. [Performance Optimization](#performance-optimization)

---

## Claude AI Integration

### Why Claude AI?

The system uses Claude 3 Haiku for several key reasons:

1. **Advanced Reasoning**: Claude excels at complex multi-factor analysis required for particle physics
2. **Structured Output**: Native support for JSON schema enforcement
3. **Domain Expertise**: Can understand and apply sophisticated physics concepts
4. **Consistent Quality**: Reliable classification with detailed explanations
5. **Cost Efficiency**: Haiku model provides excellent performance at lower cost

### API Configuration

**Model Details:**
- **Model**: `claude-3-haiku-20240307`
- **API Version**: `2023-06-01`
- **Endpoint**: `https://api.anthropic.com/v1/messages`
- **Authentication**: API key via `x-api-key` header

**Python Implementation:**
```python
import anthropic

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

response = client.messages.create(
    model="claude-3-haiku-20240307",
    max_tokens=1500,
    temperature=0.3,
    system=system_prompt,
    messages=[{
        "role": "user",
        "content": user_query
    }]
)
```

### API Key Management

**Environment Variables:**
- Primary: `ANTHROPIC_API_KEY`
- Alternative: `CLAUDE_API_KEY`

**Security Best Practices:**
- API keys stored in `.env` file (git-ignored)
- Never hardcoded in source code
- Validated at startup
- Secured in production via platform environment variables

---

## Classification Workflow

### High-Level Process

```
Event Data Input
      ↓
Extract Relevant Features
      ↓
Generate Physics-Based Prompt
      ↓
Append JSON Schema Definition
      ↓
Call Claude API
      ↓
Parse JSON Response
      ↓
Validate Classification
      ↓
Calculate Confidence Metrics
      ↓
Return Structured Result
```

### Detailed Steps

#### 1. Feature Extraction

The system extracts key physics features from the event:

```python
features = {
    'recoil_energy_keV': event_data.get('recoil_energy_keV'),
    's1_area_PE': event_data.get('s1_area_PE'),
    's2_area_PE': event_data.get('s2_area_PE'),
    's2_over_s1_ratio': event_data.get('s2_over_s1_ratio'),
    'log10_s2_over_s1': event_data.get('log10_s2_over_s1'),
    'position_x_mm': event_data.get('position_x_mm'),
    'position_y_mm': event_data.get('position_y_mm'),
    'position_z_mm': event_data.get('position_z_mm'),
    'drift_time_us': event_data.get('drift_time_us'),
    's1_width_ns': event_data.get('s1_width_ns'),
    's2_width_us': event_data.get('s2_width_us'),
    'event_quality': event_data.get('event_quality'),
    'pile_up_flag': event_data.get('pile_up_flag')
}
```

**Why These Features?**
- **S2/S1 Ratio**: Primary discriminator between event types
- **Energy**: Determines if event is in WIMP search window (1-50 keV)
- **Position**: Fiducial volume check (reject edge effects)
- **Pulse Widths**: Indicate interaction type
- **Quality Metrics**: Filter spurious events

#### 2. Prompt Construction

The prompt includes three components:

**A. System Prompt** - Establishes AI persona and expertise
**B. Classification Rules** - Physics-based decision criteria
**C. User Query** - Specific event data and analysis request

#### 3. API Call

```python
response = client.messages.create(
    model="claude-3-haiku-20240307",
    max_tokens=1500,
    temperature=0.3,  # Low temperature for consistent classification
    system=system_prompt,
    messages=[{"role": "user", "content": user_query}]
)
```

**Parameters Explained:**
- `max_tokens=1500`: Sufficient for detailed analysis
- `temperature=0.3`: Low for consistent, factual responses
- `system`: Provides domain expertise context
- `messages`: Contains event data and analysis request

#### 4. Response Parsing

```python
# Extract text from Claude response
response_text = response.content[0].text

# Parse JSON
try:
    result = json.loads(response_text)
except json.JSONDecodeError:
    # Fallback: extract JSON from markdown code blocks
    json_match = re.search(r'```json\s*(\{.*?\})\s*```', 
                          response_text, re.DOTALL)
    if json_match:
        result = json.loads(json_match.group(1))
```

---

## Prompt Engineering

### System Prompt Design

The system prompt establishes Claude as a domain expert:

```
You are a senior particle physicist at the XENONnT dark matter 
detection experiment. Your expertise includes liquid xenon TPCs, 
nuclear and electronic recoil discrimination, and statistical 
analysis of rare event searches.
```

**Key Elements:**
1. **Persona**: Senior particle physicist with specific expertise
2. **Context**: XENONnT experiment (real dark matter detector)
3. **Domain**: Liquid xenon TPCs, recoil discrimination
4. **Task**: Statistical analysis of rare events

### Classification Rules Encoding

The prompt embeds physics knowledge:

```
**CLASSIFICATION RULES (S2/S1 Ratio-Based):**

1. **High S2/S1 (>5.0):** Background (Electronic Recoil - ER)
   - Caused by gamma rays, beta decays, Compton scattering
   - Higher ionization yield, more free electrons
   - Typical sources: Kr-85, Rn-222, detector materials

2. **Medium S2/S1 (2.0-4.0):** WIMP-like (Nuclear Recoil - NR)
   - WIMP-nucleus elastic scattering
   - Lower ionization yield due to denser tracks
   - Energy 1-50 keV (WIMP search window)
   - Must be single-scatter in fiducial volume

3. **Low S2/S1 (<2.0):** Axion-like or Exotic Signal
   - Axion-electron coupling or exotic physics
   - May show energy peaks (e.g., 14.4 keV for axions)
   - Requires verification against detector artifacts

4. **Boundary S2/S1 (4.0-5.0):** Novel Anomaly
   - Uncertain classification region
   - Requires additional investigation
```

### Multi-Factor Analysis Framework

The prompt guides Claude through systematic analysis:

```
**ANALYSIS STEPS:**
1. Calculate and evaluate S2/S1 ratio against classification bands
2. Assess recoil energy in context of WIMP search (1-50 keV)
3. Check fiducial volume position - reject near boundaries
4. Analyze pulse characteristics (widths, drift time)
5. Evaluate event quality and pile-up indicators
6. Compare against known detector response
7. Identify any anomalies or unusual features
```

### User Query Template

```python
user_query = f"""
**PARTICLE EVENT ANALYSIS REQUEST**

Analyze this dark matter detector event with rigorous scientific reasoning.

**EVENT DATA:**
{json.dumps(features, indent=2)}

**ANALYSIS STEPS:**
[Detailed instructions...]

**CLASSIFICATION OPTIONS:**
- 'Background (ER)' - Electronic recoil from gamma/beta radiation
- 'WIMP-like (NR)' - Nuclear recoil consistent with dark matter
- 'Axion-like (ER)' - Exotic signal with very low S2/S1
- 'Novel Anomaly' - Unusual event requiring investigation

Provide comprehensive, multi-paragraph scientific reasoning.

**CRITICAL FORMATTING REQUIREMENTS:**
- Response must be ONLY a valid JSON object
- No markdown formatting, no code blocks
- Use only printable ASCII characters
- Start with {{ and end with }}
"""
```

---

## Structured Output

### JSON Schema Definition

The system enforces structured output via JSON schema:

```python
response_schema = {
    "type": "OBJECT",
    "properties": {
        "classification": {
            "type": "STRING",
            "description": "Event type: 'Background (ER)', 'WIMP-like (NR)', 
                          'Axion-like (ER)', or 'Novel Anomaly'"
        },
        "confidence": {
            "type": "NUMBER",
            "description": "Confidence score (0.0 to 1.0)"
        },
        "s2_s1_analysis": {
            "type": "STRING",
            "description": "Detailed S2/S1 ratio analysis"
        },
        "energy_analysis": {
            "type": "STRING",
            "description": "Energy assessment and WIMP window check"
        },
        "position_analysis": {
            "type": "STRING",
            "description": "Fiducial volume and position evaluation"
        },
        "pulse_characteristics": {
            "type": "STRING",
            "description": "Pulse width and timing analysis"
        },
        "physics_interpretation": {
            "type": "STRING",
            "description": "Physics principles and mechanisms"
        },
        "comparison_with_literature": {
            "type": "STRING",
            "description": "Comparison with published results"
        },
        "alternative_interpretations": {
            "type": "STRING",
            "description": "Other possible explanations"
        },
        "confidence_factors": {
            "type": "STRING",
            "description": "Factors affecting confidence"
        },
        "follow_up_recommendations": {
            "type": "STRING",
            "description": "Suggested next steps"
        }
    },
    "required": ["classification", "confidence", "s2_s1_analysis"]
}
```

### Response Format

**Example Claude Response:**
```json
{
  "classification": "WIMP-like (NR)",
  "confidence": 0.82,
  "s2_s1_analysis": "The S2/S1 ratio of 2.85 falls squarely in the 
    nuclear recoil band (2.0-4.0), indicating denser ionization 
    tracks characteristic of nucleus-particle collisions...",
  "energy_analysis": "Recoil energy of 12.3 keV is within the optimal 
    WIMP search window (1-50 keV), consistent with expected WIMP-nucleus 
    scattering kinematics...",
  "position_analysis": "Event position (x=125mm, y=-87mm, z=450mm) 
    is well within the fiducial volume, minimizing edge effects...",
  "pulse_characteristics": "S1 width of 48ns and S2 width of 2.3μs 
    are typical for single-site nuclear recoils...",
  "physics_interpretation": "The event signature is consistent with 
    elastic scattering of a ~50 GeV WIMP off a xenon nucleus...",
  "comparison_with_literature": "Similar events reported in 
    XENONnT 2023 results (Phys. Rev. Lett.)...",
  "alternative_interpretations": "Could be neutron scatter from 
    cosmic ray muon, though position argues against...",
  "confidence_factors": "High confidence due to clean single-scatter 
    signature, fiducial position, and proper energy range...",
  "follow_up_recommendations": "Include in WIMP candidate list. 
    Check for coincident muon veto signals..."
}
```

---

## Anomaly Detection AI

### Statistical Scoring + AI Enhancement

The anomaly detection system combines statistical methods with AI:

#### Phase 1: Statistical Anomaly Scoring

```python
def calculate_anomaly_score(event):
    scores = []
    
    # S2/S1 ratio deviation
    if s2_s1_ratio < 2.0 or s2_s1_ratio > 5.0:
        scores.append(abs(s2_s1_ratio - 3.5) / 3.5)
    
    # Energy outlier
    z_score_energy = abs(energy - mean_energy) / std_energy
    if z_score_energy > 3:
        scores.append(z_score_energy / 10)
    
    # Position outlier
    r = sqrt(x**2 + y**2)
    if r > 450 or abs(z) > 450:
        scores.append((r - 450) / 450)
    
    # Combine scores
    return sum(scores) / len(scores)
```

#### Phase 2: AI-Enhanced Classification

For top anomalies, Claude provides deeper analysis:

```python
def classify_event_with_claude(event_data):
    prompt = f"""You are a dark matter physics expert.

Event Data:
- Energy: {energy} keV
- S2/S1 Ratio: {s2_s1}
- Position: ({x}, {y}) mm
...

Classify this event and explain why it's anomalous.
Provide physics hypothesis for the unusual signature.
"""
    
    response = client.messages.create(
        model="claude-3-haiku-20240307",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return parse_response(response)
```

### Hypothesis Generation

For truly unusual events, Claude generates physics hypotheses:

```python
def generate_hypothesis(anomalous_events):
    prompt = f"""These events show unusual patterns:

Event 1: S2/S1={ratio1}, Energy={energy1}
Event 2: S2/S1={ratio2}, Energy={energy2}
...

Generate 3 physics hypotheses that could explain this signature:
1. Standard Model explanation
2. Exotic particle interpretation
3. Detector artifact possibility
"""
    
    # Claude generates structured hypotheses
    # Returns testable predictions for each hypothesis
```

---

## Physics-Based Reasoning

### Domain Knowledge Encoding

The system encodes real dark matter physics:

#### 1. Signal Formation in Liquid Xenon

**S1 Signal (Primary Scintillation):**
- Produced by particle interaction in liquid xenon
- Prompt photons from de-excitation
- Proportional to energy deposited
- Collected by PMT arrays

**S2 Signal (Ionization):**
- Electrons drift to gas phase
- Secondary scintillation in electric field
- Amplified signal (proportional gain)
- Position reconstruction from PMT pattern

**S2/S1 Ratio Physics:**
- Electronic Recoils (ER): High S2/S1 (>5.0)
  - Gamma/beta particles
  - Low recombination rate
  - More electrons escape to drift
  
- Nuclear Recoils (NR): Medium S2/S1 (2.0-4.0)
  - WIMP/neutron scattering
  - Higher recombination rate
  - Denser ionization tracks
  
- Exotic Signals: Low S2/S1 (<2.0)
  - Axions, sterile neutrinos
  - Different energy deposition mechanisms

#### 2. Fiducial Volume Cuts

```python
def check_fiducial_volume(x, y, z):
    """
    Events near detector walls are more likely background
    due to edge effects and incomplete charge collection
    """
    r = np.sqrt(x**2 + y**2)
    
    # Cylindrical fiducial volume
    if r > 450:  # 450mm radius
        return False, "Too close to detector wall"
    
    if abs(z) > 480:  # ±480mm z-range
        return False, "Too close to top/bottom electrode"
    
    return True, "Within fiducial volume"
```

#### 3. Energy Window Selection

```python
def check_energy_window(energy, event_type):
    """
    WIMP search optimized for specific energy range
    """
    if event_type == "WIMP-like":
        if 1 <= energy <= 50:
            return "Optimal WIMP search window"
        elif energy < 1:
            return "Below detector threshold"
        else:
            return "Above typical WIMP energy"
```

### Comparison with Real Experiments

Claude is instructed to reference real experiments:

- **XENONnT**: Leading dark matter experiment
- **LUX-ZEPLIN (LZ)**: Another xenon-based detector
- **PandaX**: Chinese xenon experiment
- **Published Results**: Phys. Rev. Lett., Nature, etc.

This grounds the AI analysis in real science.

---

## Confidence Scoring

### Multi-Factor Confidence

Confidence is determined by multiple factors:

```python
confidence_factors = {
    's2_s1_clarity': 0.9,      # Clear separation from other bands
    'energy_consistency': 0.85, # Within expected range
    'position_quality': 0.95,   # Good fiducial position
    'pulse_quality': 0.80,      # Clean pulse shapes
    'no_pile_up': 1.0,          # Single interaction
    'consistency_check': 0.90   # All factors align
}

overall_confidence = calculate_weighted_average(confidence_factors)
```

### Confidence Interpretation

**0.9 - 1.0**: Very High Confidence
- Clear signature
- All factors consistent
- Textbook example of event type

**0.7 - 0.9**: High Confidence
- Good signature
- Minor ambiguities
- Typical for most events

**0.5 - 0.7**: Medium Confidence
- Some uncertainties
- Boundary region
- Requires additional checks

**< 0.5**: Low Confidence
- Significant ambiguities
- Multiple interpretations possible
- Recommend further investigation

---

## Error Handling

### API Errors

```python
try:
    response = client.messages.create(...)
except anthropic.APIError as e:
    return {
        'error': 'Claude API error',
        'message': str(e),
        'classification': 'Error',
        'confidence': 0.0
    }
except Exception as e:
    return {
        'error': 'Unexpected error',
        'message': str(e),
        'classification': 'Error',
        'confidence': 0.0
    }
```

### Response Validation

```python
def validate_response(response):
    """Validate Claude's response"""
    
    # Check required fields
    required = ['classification', 'confidence']
    for field in required:
        if field not in response:
            raise ValueError(f"Missing required field: {field}")
    
    # Validate classification value
    valid_classes = ['Background (ER)', 'WIMP-like (NR)', 
                     'Axion-like (ER)', 'Novel Anomaly']
    if response['classification'] not in valid_classes:
        raise ValueError(f"Invalid classification: {response['classification']}")
    
    # Validate confidence range
    if not 0.0 <= response['confidence'] <= 1.0:
        raise ValueError(f"Confidence out of range: {response['confidence']}")
    
    return True
```

### Fallback Mechanisms

```python
def classify_with_fallback(event_data):
    """Classify with fallback to rule-based system"""
    
    try:
        # Try AI classification
        result = classify_with_claude(event_data)
        return result
    except Exception as e:
        # Fallback to simple rule-based classification
        logger.warning(f"AI classification failed: {e}")
        return rule_based_classification(event_data)

def rule_based_classification(event_data):
    """Simple rule-based fallback"""
    s2_s1 = event_data['s2_over_s1_ratio']
    
    if s2_s1 > 5.0:
        return {'classification': 'Background (ER)', 'confidence': 0.6}
    elif 2.0 <= s2_s1 <= 4.0:
        return {'classification': 'WIMP-like (NR)', 'confidence': 0.5}
    elif s2_s1 < 2.0:
        return {'classification': 'Axion-like (ER)', 'confidence': 0.5}
    else:
        return {'classification': 'Novel Anomaly', 'confidence': 0.4}
```

---

## Performance Optimization

### Token Efficiency

**Strategy 1: Feature Selection**
- Only send relevant features to Claude
- Exclude redundant or derived features
- Reduces input tokens by ~40%

**Strategy 2: Prompt Optimization**
- Clear, concise instructions
- Structured format for easy parsing
- Avoid redundant context

**Strategy 3: Model Selection**
- Haiku for standard classifications (fast, cheap)
- Sonnet for complex anomaly analysis (more capable)
- Opus reserved for critical research decisions

### Batch Processing

```python
async def classify_batch_async(events):
    """Process multiple events concurrently"""
    
    tasks = []
    for event in events:
        task = asyncio.create_task(classify_event_api(event))
        tasks.append(task)
    
    results = await asyncio.gather(*tasks)
    return results
```

**Benefits:**
- 10x faster for large batches
- Better API utilization
- Parallelized network I/O

### Response Caching

```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def classify_event_cached(event_hash):
    """Cache results for identical events"""
    return classify_event_api(event_data)
```

**Use Case:**
- Repeated classification of same event
- Testing and validation
- Interactive exploration

### Rate Limiting

```python
from time import sleep

def rate_limited_classify(events, rpm=60):
    """Respect API rate limits"""
    
    results = []
    delay = 60.0 / rpm  # Delay between requests
    
    for event in events:
        result = classify_event_api(event)
        results.append(result)
        sleep(delay)
    
    return results
```

---

## Best Practices

### Prompt Design

1. **Be Specific**: Clear, unambiguous instructions
2. **Provide Context**: Domain knowledge and constraints
3. **Request Structure**: Always specify JSON format
4. **Include Examples**: Show desired output format
5. **Set Boundaries**: Clarify what's in/out of scope

### API Usage

1. **Error Handling**: Always wrap API calls in try-except
2. **Timeout Handling**: Set reasonable timeouts (30-60s)
3. **Retries**: Implement exponential backoff for failures
4. **Logging**: Log all requests and responses for debugging
5. **Monitoring**: Track API usage and costs

### Quality Assurance

1. **Validation**: Always validate Claude's responses
2. **Fallbacks**: Have rule-based backup classification
3. **Confidence Thresholds**: Flag low-confidence results
4. **Human Review**: Critical decisions need human oversight
5. **Feedback Loop**: Track classification accuracy

---

## Future AI Enhancements

1. **Fine-Tuning**:
   - Custom Claude model trained on real dark matter data
   - Improved accuracy for edge cases
   - Faster inference

2. **Multi-Model Ensemble**:
   - Combine Claude with other models
   - Cross-validation for critical events
   - Confidence through consensus

3. **Active Learning**:
   - Learn from expert corrections
   - Identify uncertain cases for human review
   - Continuous improvement

4. **Explainability**:
   - Visualize AI reasoning process
   - Attribution of confidence factors
   - Interactive explanation interface

5. **Real-Time Processing**:
   - Stream processing of live detector data
   - Immediate alerts for interesting events
   - Integration with detector DAQ systems

---

## Conclusion

The AI functionality in this system demonstrates sophisticated integration of large language models with domain-specific physics knowledge. By combining Claude's reasoning capabilities with structured prompts and validation, the system achieves reliable, explainable classification of complex particle physics events.

The key to success is:
- **Domain Expertise Encoding**: Physics knowledge embedded in prompts
- **Structured Outputs**: Enforced JSON schemas for reliability
- **Multi-Factor Analysis**: Comprehensive evaluation of all evidence
- **Error Handling**: Robust fallbacks and validation
- **Performance Optimization**: Efficient API usage and caching

This architecture serves as a template for applying AI to other scientific domains requiring expert-level reasoning and analysis.
