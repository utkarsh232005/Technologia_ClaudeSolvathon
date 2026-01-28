# User Guide

## Welcome to the Dark Matter Classification System

This guide will help you use the Dark Matter Classification System to classify particle detection events and detect anomalies using AI-powered analysis.

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Interface Overview](#user-interface-overview)
3. [Event Classification](#event-classification)
4. [Results Dashboard](#results-dashboard)
5. [Anomaly Detection](#anomaly-detection)
6. [Data Management](#data-management)
7. [Report Generation](#report-generation)
8. [Settings](#settings)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Tips and Best Practices](#tips-and-best-practices)
11. [FAQ](#faq)
12. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What is This System?

The Dark Matter Classification System helps scientists analyze events from dark matter detection experiments. It uses Claude AI to:

- **Classify Events**: Identify different types of particle interactions
- **Detect Anomalies**: Find unusual or interesting events
- **Provide Insights**: Explain the physics behind each classification
- **Generate Reports**: Export results for further analysis

### Who Should Use This?

- **Particle Physicists**: Analyzing dark matter experiment data
- **Research Scientists**: Studying rare event signatures
- **Students**: Learning about dark matter detection
- **Data Analysts**: Processing large event datasets

### System Requirements

**Browser Requirements**:
- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

**Internet Connection**:
- Required for AI classification
- Minimum: 1 Mbps
- Recommended: 5+ Mbps

### First Time Setup

1. **Open the Application**:
   - Navigate to `http://localhost:5173` (local development)
   - Or visit your deployed URL

2. **Verify Connection**:
   - You should see the landing page
   - Status indicator should show "Connected"

3. **Configure Settings** (if needed):
   - Click Settings icon in navigation
   - Enter API configuration (if required)

---

## User Interface Overview

### Navigation Bar

Located at the top of the screen:

- **Logo**: Return to home page
- **Event Classifier**: Classify single events
- **Results Dashboard**: View classification results
- **Anomaly Detection**: Find unusual events
- **Data Generator**: Manage datasets
- **Report Generator**: Export results
- **Settings**: System configuration
- **Help**: Access documentation

### Page Layouts

All pages follow a consistent layout:
- **Header**: Page title and breadcrumb
- **Main Content**: Primary functionality
- **Sidebar**: Quick actions and info (when applicable)
- **Footer**: Status and version info

### Status Indicators

**Connection Status**:
- 🟢 Green: Connected and ready
- 🟡 Yellow: Connecting or processing
- 🔴 Red: Disconnected or error

**Processing Status**:
- Loading spinner: Operation in progress
- Progress bar: Batch processing status
- Checkmark: Operation complete

---

## Event Classification

### Overview

The Event Classifier analyzes individual particle detection events and determines their type using AI.

### Step-by-Step Guide

#### 1. Access Event Classifier

Click **Event Classifier** in the navigation menu.

#### 2. Input Event Data

**Option A: Manual Entry**
```
1. Enter event parameters in the form:
   - Event ID (optional): Unique identifier
   - Energy (keV): Recoil energy
   - S1 Signal (PE): Primary scintillation
   - S2 Signal (PE): Secondary ionization
   - Position X, Y, Z (mm): Event location
   - Other parameters as needed

2. Click "Classify Event"
```

**Option B: Load from Dataset**
```
1. Click "Load Sample Event"
2. Select event from dropdown
3. Event data auto-fills form
4. Click "Classify Event"
```

**Option C: Upload JSON**
```
1. Click "Upload Event Data"
2. Select JSON file with event data
3. Review auto-filled form
4. Click "Classify Event"
```

#### 3. Review Results

**Classification Type**:
- **WIMP-like (NR)**: Nuclear recoil, potential dark matter signal
- **Background (ER)**: Electronic recoil, radiation background
- **Axion-like (ER)**: Exotic low-energy signal
- **Novel Anomaly**: Unusual event requiring investigation

**Confidence Score**:
- 90-100%: Very high confidence
- 70-89%: High confidence
- 50-69%: Medium confidence
- Below 50%: Low confidence

**Detailed Analysis**:
- **S2/S1 Analysis**: Signal ratio interpretation
- **Energy Analysis**: Energy range assessment
- **Position Analysis**: Spatial location evaluation
- **Physics Interpretation**: Scientific explanation
- **Recommendations**: Suggested follow-up actions

#### 4. Save or Export

- Click "Save Result" to add to dashboard
- Click "Export" for JSON/CSV download
- Click "Share" to generate shareable link

### Understanding Event Types

#### WIMP-like (Nuclear Recoil)

**What it is**:
- Potential dark matter interaction
- WIMP scattering off nucleus
- Most interesting for research

**Characteristics**:
- S2/S1 ratio: 2.0-4.0
- Energy: 1-50 keV (optimal range)
- Single-scatter event
- Fiducial volume position

**Example**:
```
Event: evt_12345
Energy: 12.5 keV
S2/S1: 3.39
Classification: WIMP-like (NR)
Confidence: 82%
```

#### Background (Electronic Recoil)

**What it is**:
- Normal radiation background
- Gamma rays, beta particles
- Most common event type (>90%)

**Characteristics**:
- S2/S1 ratio: >5.0
- Variable energy
- From detector materials

**Example**:
```
Event: evt_67890
Energy: 8.3 keV
S2/S1: 8.0
Classification: Background (ER)
Confidence: 91%
```

#### Axion-like (Exotic Signal)

**What it is**:
- Potential exotic particle
- Axion or sterile neutrino
- Very rare (<2% of events)

**Characteristics**:
- S2/S1 ratio: <2.0
- Low energy (1-10 keV)
- May show energy peaks

**Example**:
```
Event: evt_11111
Energy: 3.5 keV
S2/S1: 1.2
Classification: Axion-like
Confidence: 75%
```

#### Novel Anomaly

**What it is**:
- Unusual, hard-to-classify event
- Falls in boundary regions
- Requires investigation

**Characteristics**:
- S2/S1 ratio: 4.0-5.0 (boundary)
- Unexpected features
- Low confidence typical

**Example**:
```
Event: evt_99999
Energy: 45.2 keV
S2/S1: 4.23
Classification: Novel Anomaly
Confidence: 65%
```

---

## Results Dashboard

### Overview

The Results Dashboard visualizes all your classification results with interactive charts and statistics.

### Dashboard Sections

#### 1. Summary Statistics

**At a glance**:
- Total events classified
- Event type breakdown
- Average confidence
- Processing time

**Filters**:
- Date range
- Event type
- Confidence threshold
- Energy range

#### 2. Classification Distribution

**Pie Chart**:
- Visual breakdown by type
- Hover for percentages
- Click to filter

**What to look for**:
- Typical: 93% Background, 4% WIMP, 2% Axion, 1% Anomaly
- Unusual: Deviations from expected ratios

#### 3. Energy Spectrum

**Histogram**:
- Energy distribution by type
- Multiple overlaid spectra
- Zoom and pan enabled

**What to look for**:
- WIMP peak: 5-15 keV
- Background: Exponential decay
- Axion peak: ~3-4 keV

#### 4. S2/S1 Ratio Plot

**Scatter Plot**:
- S2/S1 vs Energy
- Color-coded by type
- Classification bands shown

**What to look for**:
- Clear separation of event types
- Events in boundary regions
- Outliers and anomalies

#### 5. Confidence Distribution

**Box Plot**:
- Confidence ranges by type
- Median, quartiles shown
- Outlier identification

**What to look for**:
- High median confidence (>70%)
- Low variance (consistent classification)
- Outliers needing review

#### 6. Recent Events Table

**Sortable List**:
- Latest classified events
- Click for detailed view
- Export to CSV

**Columns**:
- Event ID
- Type
- Confidence
- Energy
- Timestamp

### Using the Dashboard

#### Filter Results

```
1. Click "Filters" button
2. Select criteria:
   - Date range
   - Event types
   - Confidence range
   - Energy range
3. Click "Apply Filters"
4. Charts update automatically
```

#### Export Data

```
1. Click "Export" button
2. Choose format:
   - CSV: For spreadsheets
   - JSON: For programming
   - PDF: For reports (includes charts)
3. Select data to include
4. Click "Download"
```

#### Compare Sessions

```
1. Click "Compare" button
2. Select 2+ classification sessions
3. View side-by-side comparison
4. Identify trends and changes
```

---

## Anomaly Detection

### Overview

The Anomaly Detection system finds unusual events in your dataset using statistical analysis and AI.

### How It Works

1. **Statistical Scoring**: Mathematical analysis finds outliers
2. **AI Classification**: Claude analyzes top anomalies
3. **Hypothesis Generation**: AI suggests explanations
4. **Ranking**: Events sorted by anomaly score

### Running Anomaly Detection

#### Step 1: Select Dataset

```
1. Go to Anomaly Detection page
2. Choose data source:
   - Use current session events
   - Upload dataset file
   - Load from saved datasets
```

#### Step 2: Configure Parameters

**Basic Settings**:
- **Top N**: How many anomalies to find (default: 10)
- **Threshold**: Minimum anomaly score (default: 0.7)

**Advanced Settings**:
- **Generate Hypotheses**: Create physics explanations
- **Include Background**: Check background events too
- **Energy Range**: Focus on specific energies

#### Step 3: Run Detection

```
1. Review settings
2. Click "Detect Anomalies"
3. Wait for processing (may take 1-5 minutes)
4. View results
```

### Understanding Results

#### Anomaly List

**Each anomaly shows**:
- **Rank**: 1 = most anomalous
- **Anomaly Score**: 0.0-1.0 (higher = more unusual)
- **Event ID**: Unique identifier
- **Classification**: AI-determined type
- **Reasons**: Why it's anomalous

**Example**:
```
Rank: 1
Score: 0.95
Event: evt_523
Type: Novel Anomaly
Reasons:
  - Unusual S2/S1 ratio: 4.23 (boundary region)
  - High energy: 45.2 keV
  - Near detector edge
Hypothesis: Potential primordial black hole signature
```

#### Anomaly Categories

**Spatial Anomalies**:
- Events near detector boundaries
- Unusual position patterns
- Position reconstruction issues

**Energy Anomalies**:
- Unexpected energy values
- Energy peaks at unusual locations
- Energy outliers

**Ratio Anomalies**:
- S2/S1 in boundary regions
- Inconsistent with event type
- Statistical outliers

**Temporal Anomalies**:
- Clustered in time
- Periodic patterns
- Drift time inconsistencies

### Acting on Anomalies

#### High Priority (Score >0.9)

```
1. Review detailed analysis
2. Check for detector issues
3. Consider for publication
4. Flag for expert review
```

#### Medium Priority (Score 0.7-0.9)

```
1. Monitor for patterns
2. Compare with similar events
3. Include in statistical analysis
```

#### Low Priority (Score <0.7)

```
1. Document for reference
2. May be normal variation
3. Review if patterns emerge
```

---

## Data Management

### Overview

The Data Generator page lets you manage datasets, load samples, and generate synthetic data for testing.

### Loading Datasets

#### Option 1: Use Built-in Dataset

```
1. Go to Data Generator page
2. Click "Load Default Dataset"
3. View dataset summary:
   - Total events
   - Event type distribution
   - Energy range
4. Click "Use Dataset"
```

#### Option 2: Upload Your Data

**File Format Requirements**:
- CSV or JSON format
- Required columns: `recoil_energy_keV`, `s1_area_PE`, `s2_area_PE`, `s2_over_s1_ratio`
- Optional columns: Position, timing, quality metrics

**Upload Steps**:
```
1. Click "Upload Dataset"
2. Select file (max 100 MB)
3. Preview data (first 10 rows)
4. Validate format
5. Click "Import"
```

#### Option 3: Generate Synthetic Data

**Use Cases**:
- Testing system functionality
- Learning how the system works
- Demonstrating to others

**Generation Steps**:
```
1. Click "Generate Synthetic Data"
2. Configure parameters:
   - Number of events (100-50,000)
   - Event type ratios
   - Energy ranges
3. Click "Generate"
4. Review generated data
5. Save or use immediately
```

### Dataset Information

**Summary Statistics**:
- Total event count
- Event type breakdown
- Energy statistics (min, max, mean, median)
- S2/S1 ratio statistics
- Missing data percentage

**Data Quality**:
- Completeness score
- Consistency checks
- Outlier detection
- Recommended filters

### Sampling Events

**Random Sample**:
```
1. Click "Sample Events"
2. Enter sample size (1-100)
3. Click "Generate Sample"
4. Events loaded to classifier
```

**Filtered Sample**:
```
1. Click "Advanced Sample"
2. Set filters:
   - Event type
   - Energy range
   - S2/S1 range
   - Date range
3. Enter sample size
4. Click "Generate Sample"
```

**Stratified Sample**:
```
1. Click "Stratified Sample"
2. System automatically samples:
   - Proportional to event type distribution
   - Representative of dataset
3. Enter total sample size
4. Click "Generate"
```

---

## Report Generation

### Overview

Generate professional reports of your classification results for presentations, publications, or documentation.

### Creating a Report

#### Step 1: Select Data

```
1. Go to Report Generator page
2. Choose data source:
   - Current session
   - Date range
   - Specific event IDs
   - Saved results
```

#### Step 2: Configure Report

**Report Type**:
- **Summary Report**: Overview and statistics
- **Detailed Report**: Full analysis for each event
- **Anomaly Report**: Focus on unusual events
- **Comparison Report**: Compare multiple sessions

**Include Sections**:
- [ ] Executive Summary
- [ ] Classification Statistics
- [ ] Energy Spectra
- [ ] S2/S1 Analysis
- [ ] Anomaly Detection Results
- [ ] Individual Event Details
- [ ] Recommendations
- [ ] Technical Details

**Customization**:
- Title and author
- Logo and branding
- Color scheme
- Font and styling

#### Step 3: Generate Report

```
1. Review configuration
2. Click "Generate Report"
3. Wait for processing (10-60 seconds)
4. Preview report
5. Download or share
```

### Report Formats

**PDF**:
- Professional appearance
- Includes charts and graphs
- Ready for printing
- Best for: Publications, presentations

**HTML**:
- Interactive charts
- Clickable links
- Responsive design
- Best for: Web sharing, documentation

**CSV**:
- Data only (no formatting)
- Import to Excel/Sheets
- Programmatic access
- Best for: Further analysis, databases

**JSON**:
- Structured data
- Machine readable
- API compatible
- Best for: Automated workflows, integration

### Report Sections Explained

#### Executive Summary
- High-level overview
- Key findings
- Event statistics
- Recommendations

#### Classification Statistics
- Total events classified
- Type distribution
- Confidence analysis
- Processing metrics

#### Energy Spectra
- Histograms by event type
- Peak identification
- Range analysis
- Anomaly highlighting

#### S2/S1 Analysis
- Scatter plots
- Band separation
- Boundary events
- Quality assessment

#### Anomaly Detection Results
- Top anomalies
- Scoring methodology
- Physics hypotheses
- Follow-up suggestions

#### Individual Event Details
- Full event data
- Classification reasoning
- Confidence factors
- Physics interpretation

---

## Settings

### Overview

Configure system behavior, API connections, and user preferences.

### Settings Categories

#### API Configuration

**Claude API Settings**:
```
API Key: [Enter your key]
Model: claude-3-haiku-20240307
Max Tokens: 1500
Temperature: 0.3 (low for consistent classification)
```

**Test Connection**:
- Click "Test API Connection"
- Verifies key is valid
- Checks model availability

#### Classification Settings

**Confidence Thresholds**:
- Minimum confidence for auto-save: 70%
- Flag for review below: 50%
- Reject below: 30%

**Classification Bands** (S2/S1 ratios):
- Background (ER): > 5.0
- WIMP (NR): 2.0 - 4.0
- Axion-like: < 2.0
- Novel Anomaly: 4.0 - 5.0

#### Display Preferences

**Theme**:
- Light mode
- Dark mode
- Auto (match system)

**Chart Settings**:
- Default chart type
- Color scheme
- Point size
- Grid lines

**Table Settings**:
- Rows per page
- Default sort
- Column visibility

#### Data Management

**Auto-save**:
- Enable auto-save: Yes/No
- Save interval: 5 minutes
- Max saved sessions: 10

**Data Retention**:
- Keep results for: 30 days
- Auto-cleanup: Enabled
- Export before cleanup: Yes

#### Advanced Settings

**Performance**:
- Batch size: 10 events
- Parallel workers: 5
- Request timeout: 60 seconds
- Retry attempts: 3

**Developer Mode**:
- Enable API logging
- Show debug info
- Raw response view
- Performance metrics

---

## Keyboard Shortcuts

### Global Shortcuts

- `Ctrl/Cmd + K`: Open command palette
- `Ctrl/Cmd + /`: Show shortcut help
- `Ctrl/Cmd + S`: Save current work
- `Ctrl/Cmd + E`: Export results
- `Escape`: Close modal/dialog

### Navigation

- `G + H`: Go to home
- `G + C`: Go to classifier
- `G + D`: Go to dashboard
- `G + A`: Go to anomaly detection
- `G + R`: Go to reports
- `G + S`: Go to settings

### Classifier Page

- `Alt + C`: Classify event
- `Alt + L`: Load sample
- `Alt + N`: New event (clear form)
- `Alt + S`: Save result

### Dashboard Page

- `Alt + F`: Open filters
- `Alt + E`: Export data
- `Alt + R`: Refresh data

### Table Navigation

- `↑/↓`: Navigate rows
- `Enter`: View details
- `Space`: Select/deselect
- `Shift + Click`: Multi-select

---

## Tips and Best Practices

### For Accurate Classification

1. **Provide Complete Data**: More features = better classification
2. **Check Data Quality**: Validate before classifying
3. **Use Appropriate Energy Range**: 1-50 keV optimal for WIMPs
4. **Consider Context**: Detector conditions matter
5. **Review Low Confidence**: Manually check <70% confidence

### For Anomaly Detection

1. **Run on Large Datasets**: >1000 events recommended
2. **Adjust Thresholds**: Start high, lower if needed
3. **Generate Hypotheses**: Use AI for unusual events
4. **Cross-Check**: Verify with multiple methods
5. **Track Patterns**: Monitor anomalies over time

### For Performance

1. **Use Batch Classification**: Faster for multiple events
2. **Filter Data First**: Reduce processing time
3. **Cache Results**: Save classifications
4. **Monitor API Usage**: Stay within rate limits
5. **Use Appropriate Model**: Haiku for speed, Sonnet for accuracy

### For Reporting

1. **Include Context**: Explain experimental setup
2. **Add Uncertainty**: Report confidence scores
3. **Visualize Results**: Charts are clearer than tables
4. **Document Methods**: Describe classification approach
5. **Archive Reports**: Keep for reproducibility

---

## FAQ

### General Questions

**Q: What is dark matter?**
A: Invisible matter that makes up ~85% of universe's mass. We detect it indirectly through gravitational effects and particle interactions.

**Q: How does the classification work?**
A: We use Claude AI with physics-based prompts to analyze event features (energy, signal ratios, position) and classify event types.

**Q: Is this real data?**
A: The system uses synthetic data that mimics real dark matter detector responses for demonstration and testing.

**Q: How accurate is the AI?**
A: Classification accuracy >90% for clear events, lower for boundary cases. Always review low-confidence results.

### Technical Questions

**Q: Why does classification take so long?**
A: Claude API calls require internet round-trip. Typical: 1-3 seconds per event. Batch processing is faster.

**Q: What is S2/S1 ratio?**
A: Ratio of secondary (ionization) to primary (scintillation) signals. Key discriminator for event types.

**Q: Can I use my own data?**
A: Yes! Upload CSV or JSON files with required columns: energy, S1, S2, S2/S1 ratio.

**Q: Is an internet connection required?**
A: Yes, for AI classification. Offline mode (rule-based) planned for future.

### Troubleshooting Questions

**Q: "API key not found" error?**
A: Check Settings > API Configuration. Ensure key is entered correctly.

**Q: Classification returns "Error"?**
A: Check internet connection, API key validity, and Claude API status.

**Q: Charts not displaying?**
A: Try refreshing page, clearing browser cache, or using different browser.

**Q: Export not working?**
A: Check browser pop-up blocker, ensure events are selected, try different format.

---

## Troubleshooting

### Connection Issues

**Symptom**: Cannot connect to backend
**Solutions**:
1. Check backend is running (http://localhost:5001/api/health)
2. Verify URL in Settings
3. Check firewall/antivirus
4. Try different browser

### Classification Issues

**Symptom**: Classification fails or returns error
**Solutions**:
1. Verify API key in Settings
2. Check internet connection
3. Validate event data (required fields)
4. Review error message details
5. Try with sample event

### Display Issues

**Symptom**: UI not displaying correctly
**Solutions**:
1. Hard refresh (Ctrl+F5)
2. Clear browser cache
3. Try different browser
4. Check browser console for errors
5. Update browser to latest version

### Performance Issues

**Symptom**: Slow response times
**Solutions**:
1. Check internet speed
2. Reduce batch size
3. Close other applications
4. Clear old results
5. Check Claude API status

### Data Issues

**Symptom**: Cannot load or upload data
**Solutions**:
1. Verify file format (CSV/JSON)
2. Check required columns present
3. Validate data types (numbers where expected)
4. Reduce file size (<100 MB)
5. Check for special characters

### Getting Help

If you encounter issues not covered here:

1. **Check Documentation**: Review relevant sections
2. **Browser Console**: Look for error messages
3. **Server Logs**: Check backend terminal output
4. **GitHub Issues**: Search existing issues
5. **Create Issue**: Report with details:
   - Steps to reproduce
   - Error messages
   - Screenshots
   - Browser and OS version

---

## Glossary

**Terms Used in the System**:

- **S1 Signal**: Primary scintillation light from particle interaction
- **S2 Signal**: Secondary ionization signal from electron drift
- **S2/S1 Ratio**: Key discriminator for event types
- **Nuclear Recoil (NR)**: Nucleus knocked by particle (WIMP signature)
- **Electronic Recoil (ER)**: Electron knocked by particle (background)
- **WIMP**: Weakly Interacting Massive Particle (dark matter candidate)
- **Axion**: Hypothetical exotic particle
- **Fiducial Volume**: Central detector region with good response
- **Pile-up**: Multiple interactions detected as single event
- **Anomaly Score**: Measure of how unusual an event is (0-1)
- **Confidence**: AI certainty in classification (0-100%)

---

## Support and Feedback

### Getting Support

**Documentation**:
- User Guide (this document)
- Developer Guide (for technical users)
- API Documentation (for programmers)

**Community**:
- GitHub Discussions
- Issue Tracker

### Providing Feedback

We welcome your feedback!

**Bug Reports**:
- Use GitHub Issues
- Include reproduction steps
- Attach screenshots

**Feature Requests**:
- Describe use case
- Explain expected behavior
- Suggest implementation

**General Feedback**:
- Email: [contact email]
- Survey: [link to survey]

---

## About This System

### Credits

**Developed by**: Technologia Team
**AI Provider**: Anthropic (Claude)
**License**: MIT License

### Version

Current Version: 1.0.0
Last Updated: January 2024

### Acknowledgments

- Anthropic for Claude AI
- Dark matter physics community
- Open source contributors

---

Thank you for using the Dark Matter Classification System! We hope it helps advance your research and understanding of the universe's most mysterious matter.
