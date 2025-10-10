# Enhanced Reasoning System for Dark Matter Event Classification

## Overview
The `mainClassify.py` script has been enhanced with comprehensive, physics-based reasoning that provides detailed scientific analysis for each classified event.

## Key Enhancements

### 1. **Multi-Dimensional Analysis Framework**
Instead of a single "reasoning" field, the system now provides **10 distinct analysis sections**:

1. **S2/S1 Analysis**
   - Quantitative ratio evaluation
   - Comparison to expected bands (Background: >200, WIMP: 10-50, Axion: <10)
   - Physics interpretation of ionization vs. scintillation

2. **Energy Analysis**
   - WIMP search window assessment (1-50 keV optimal)
   - Background energy line identification
   - Unusual energy signature detection

3. **Position Analysis**
   - Fiducial volume verification
   - Distance from detector walls
   - Position-dependent background checks
   - Drift time consistency validation

4. **Pulse Characteristics**
   - S1 and S2 pulse width analysis
   - Timing profile comparison
   - Anomaly detection in pulse shapes

5. **Physics Interpretation**
   - Interaction type identification (elastic scattering, Compton, photoelectric)
   - Recombination probability calculation
   - Quenching factor considerations
   - Detector calibration data comparison

6. **Comparison with Literature**
   - References to XENONnT published results
   - LUX-ZEPLIN experiment comparisons
   - Known background model validation

7. **Alternative Interpretations**
   - Other possible particle types considered
   - Reasons for ruling out alternatives
   - Probability assessment for each interpretation

8. **Confidence Factors**
   - Specific features increasing confidence
   - Remaining uncertainties
   - Systematic error considerations

9. **Follow-up Recommendations**
   - Specific verification checks
   - Cross-correlation suggestions
   - Additional cut recommendations
   - Further investigation priorities

### 2. **Enhanced Classification Criteria**

#### Updated S2/S1 Ratio Bands:
- **Background (ER):** S2/S1 > 200
  - Electronic recoils from gamma rays, beta decays
  - Sources: Kr-85, Rn-222, detector materials

- **WIMP-like (NR):** S2/S1 = 10-50
  - Nuclear recoils from WIMP-nucleus scattering
  - Energy: 1-50 keV (search window)
  - Must be single-scatter in fiducial volume

- **Axion-like:** S2/S1 < 10
  - Exotic signals, potentially axion-electron coupling
  - May show specific energy peaks (e.g., 14.4 keV)

### 3. **Comprehensive Feature Analysis**

The system now analyzes **15 event features**:
```python
- recoil_energy_keV
- s1_area_PE
- s2_area_PE
- s2_over_s1_ratio
- log10_s2_over_s1
- position_x_mm, position_y_mm, position_z_mm
- drift_time_us
- s1_width_ns, s2_width_us
- event_quality
- pile_up_flag
- interaction_type
```

### 4. **Physics-Based Reasoning Requirements**

Each classification now includes:
1. ✅ Quantitative S2/S1 ratio analysis
2. ✅ Energy assessment against WIMP search window
3. ✅ Spatial fiducialization check
4. ✅ Pulse shape and timing analysis
5. ✅ Comparison with published experimental results
6. ✅ Discussion of uncertainties
7. ✅ Reference to physics principles (recombination, quenching, etc.)

## Example Output

```
======================================================================
CLASSIFICATION: WIMP-like (NR)
CONFIDENCE: 0.85
======================================================================

S2/S1 ANALYSIS:
The S2/S1 ratio of 23.4 falls squarely within the nuclear recoil band
(10-50), strongly indicating a WIMP-nucleus elastic scattering event.
This ratio is significantly lower than the electronic recoil band
(>200), ruling out gamma/beta backgrounds. The log10(S2/S1) = 1.37
matches calibration data from neutron sources...

ENERGY ANALYSIS:
At 8.5 keV, this event is in the optimal WIMP search window (1-50 keV).
This energy is consistent with a ~100 GeV WIMP scattering off xenon
nuclei. No known background lines exist at this energy...

POSITION ANALYSIS:
Event located at (x=120mm, y=-85mm, z=650mm), well within the fiducial
volume (>100mm from all walls). Drift time of 325μs is consistent with
z-position, ruling out electronic noise...

[... additional sections ...]
```

## Usage

### Basic Command:
```bash
python mainClassify.py --num-events 10
```

### With Environment Variables:
```bash
# Set Gemini API key in .env file
GEMINI_API_KEY=your_key_here

python mainClassify.py --num-events 20
```

## Output Files

1. **claude_classified_results_detailed.json**
   - Full JSON output with all analysis sections
   - Machine-readable format for further processing
   - Includes raw event data + enhanced reasoning

2. **Console Output**
   - Formatted, human-readable analysis
   - Color-coded sections (if terminal supports)
   - Real-time progress tracking

## Benefits

### For Physicists:
- **Comprehensive Analysis:** All relevant physics factors considered
- **Traceable Reasoning:** Clear justification for each classification
- **Literature Integration:** Comparisons with published results
- **Actionable Insights:** Specific follow-up recommendations

### For Machine Learning:
- **Structured Output:** JSON format for easy parsing
- **Feature Importance:** Identifies which features drive classification
- **Training Data:** Can be used to train simpler, faster classifiers
- **Confidence Calibration:** Provides uncertainty quantification

### For Collaboration:
- **Reproducible:** Same input → same detailed output
- **Explainable AI:** Full transparency in decision-making
- **Educational:** Teaches dark matter detection principles
- **Auditable:** Every classification fully documented

## Technical Details

### API Configuration:
- **Model:** gemini-2.5-flash-preview-05-20
- **Temperature:** 0.0 (deterministic output)
- **Output Format:** Structured JSON with schema validation
- **Rate Limiting:** 2-second delay between requests

### Token Usage:
- **Input per event:** ~800-1000 tokens
- **Output per event:** ~1500-2000 tokens
- **Total per event:** ~2500-3000 tokens
- **Cost estimate:** ~$0.01 per event (Gemini pricing)

## Future Enhancements

1. **Batch Processing:** Parallel API calls for efficiency
2. **Caching:** Store results to avoid re-analyzing identical events
3. **Visualization:** Generate plots for each classified event
4. **Statistical Summary:** Aggregate statistics across many events
5. **Model Comparison:** Compare Gemini vs. Claude reasoning
6. **Active Learning:** Use uncertain events to improve classification

## References

1. XENON Collaboration, "Dark Matter Search Results from a One Ton-Year Exposure of XENON1T" (2018)
2. LUX-ZEPLIN Collaboration, "First Dark Matter Search Results from the LUX-ZEPLIN Experiment" (2023)
3. PandaX Collaboration, "Dark Matter Results from 54-Ton-Day Exposure of PandaX-II" (2017)
4. Sorensen, "Nuclear recoil energy scale in liquid xenon with application to the direct detection of dark matter" (2011)

## Support

For issues or questions:
- Check `ENV_SETUP.md` for API configuration
- Review `SECURITY_CHECKLIST.md` for best practices
- See dataset documentation in `dataset_metadata.json`

---

**Last Updated:** October 10, 2025
**Version:** 2.0 (Enhanced Reasoning System)
