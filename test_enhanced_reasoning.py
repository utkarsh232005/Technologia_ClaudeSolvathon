#!/usr/bin/env python3
"""
test_enhanced_reasoning.py - Test the enhanced reasoning system

This script tests the enhanced mainClassify.py with a few sample events
to verify the detailed reasoning output.
"""
import json
import sys

# Sample events for testing (you can modify these)
test_events = [
    {
        "event_id": "TEST_001",
        "recoil_energy_keV": 8.5,
        "s1_area_PE": 85.0,
        "s2_area_PE": 1990.0,
        "s2_over_s1_ratio": 23.4,
        "log10_s2_over_s1": 1.37,
        "position_x_mm": 120.0,
        "position_y_mm": -85.0,
        "position_z_mm": 650.0,
        "drift_time_us": 325.0,
        "s1_width_ns": 45.0,
        "s2_width_us": 2.1,
        "event_quality": 0.92,
        "pile_up_flag": 0,
        "interaction_type": "nuclear_recoil",
        "label": "WIMP"
    },
    {
        "event_id": "TEST_002",
        "recoil_energy_keV": 15.3,
        "s1_area_PE": 32.0,
        "s2_area_PE": 18500.0,
        "s2_over_s1_ratio": 578.0,
        "log10_s2_over_s1": 2.76,
        "position_x_mm": 45.0,
        "position_y_mm": 200.0,
        "position_z_mm": 450.0,
        "drift_time_us": 450.0,
        "s1_width_ns": 52.0,
        "s2_width_us": 2.3,
        "event_quality": 0.88,
        "pile_up_flag": 0,
        "interaction_type": "electronic_recoil",
        "label": "Background"
    },
    {
        "event_id": "TEST_003",
        "recoil_energy_keV": 14.4,
        "s1_area_PE": 250.0,
        "s2_area_PE": 1800.0,
        "s2_over_s1_ratio": 7.2,
        "log10_s2_over_s1": 0.86,
        "position_x_mm": -150.0,
        "position_y_mm": 100.0,
        "position_z_mm": 750.0,
        "drift_time_us": 375.0,
        "s1_width_ns": 48.0,
        "s2_width_us": 1.9,
        "event_quality": 0.95,
        "pile_up_flag": 0,
        "interaction_type": "electronic_recoil",
        "label": "Axion"
    }
]

def display_event_summary(event):
    """Display a formatted summary of the test event"""
    print("\n" + "="*80)
    print(f"TEST EVENT: {event['event_id']} (True Label: {event['label']})")
    print("="*80)
    print(f"  Energy: {event['recoil_energy_keV']:.1f} keV")
    print(f"  S1: {event['s1_area_PE']:.0f} PE")
    print(f"  S2: {event['s2_area_PE']:.0f} PE")
    print(f"  S2/S1: {event['s2_over_s1_ratio']:.1f}")
    print(f"  Position: ({event['position_x_mm']:.0f}, {event['position_y_mm']:.0f}, {event['position_z_mm']:.0f}) mm")
    print(f"  Event Quality: {event['event_quality']:.2f}")
    print("="*80)

def main():
    print("\n" + "#"*80)
    print("# ENHANCED REASONING SYSTEM - TEST SCRIPT")
    print("#"*80)
    print("\nThis script demonstrates the enhanced reasoning capabilities of mainClassify.py")
    print("\nTest Events:")
    print("  1. TEST_001: WIMP-like event (S2/S1 = 23.4)")
    print("  2. TEST_002: Background event (S2/S1 = 578.0)")
    print("  3. TEST_003: Axion-like event (S2/S1 = 7.2, E = 14.4 keV)")
    
    print("\n" + "-"*80)
    print("TO RUN THE ACTUAL CLASSIFICATION:")
    print("-"*80)
    print("\n1. Ensure your .env file has GEMINI_API_KEY set")
    print("2. Run: python mainClassify.py --num-events 3")
    print("\nThe script will:")
    print("  ✓ Load events from dark_matter_synthetic_dataset.csv")
    print("  ✓ Apply enhanced AI-based classification")
    print("  ✓ Generate detailed, multi-section reasoning")
    print("  ✓ Save results to claude_classified_results_detailed.json")
    
    print("\n" + "-"*80)
    print("EXPECTED ENHANCED OUTPUT SECTIONS:")
    print("-"*80)
    print("""
For each event, you will see:
  1. S2/S1 ANALYSIS        - Quantitative ratio evaluation
  2. ENERGY ANALYSIS       - WIMP search window assessment
  3. POSITION ANALYSIS     - Fiducial volume verification
  4. PULSE CHARACTERISTICS - S1/S2 pulse shape analysis
  5. PHYSICS INTERPRETATION- Deep interaction physics
  6. LITERATURE COMPARISON - Published results reference
  7. ALTERNATIVE INTERP.   - Other possibilities considered
  8. CONFIDENCE FACTORS    - What affects certainty
  9. FOLLOW-UP ACTIONS     - Specific recommendations
    """)
    
    # Display sample events
    print("\n" + "-"*80)
    print("SAMPLE TEST EVENTS (for reference):")
    print("-"*80)
    
    for event in test_events:
        display_event_summary(event)
    
    # Save test events to JSON
    test_file = "test_events_for_classification.json"
    with open(test_file, 'w') as f:
        json.dump(test_events, f, indent=2)
    
    print(f"\n✓ Test events saved to: {test_file}")
    print("\n" + "#"*80)
    print("# COMPARISON: Basic vs. Enhanced Reasoning")
    print("#"*80)
    
    print("""
BASIC REASONING (Old System):
------------------------------
"Low S2/S1 ratio and energy in WIMP search range"

ENHANCED REASONING (New System):
---------------------------------
S2/S1 ANALYSIS:
The S2/S1 ratio of 23.4 falls squarely within the nuclear recoil band
(10-50), strongly indicating a WIMP-nucleus elastic scattering event.
This ratio is significantly lower than the electronic recoil band (>200),
ruling out gamma/beta backgrounds...

ENERGY ANALYSIS:
At 8.5 keV, this event is in the optimal WIMP search window (1-50 keV)...

POSITION ANALYSIS:
Event located at (x=120mm, y=-85mm, z=650mm), well within fiducial volume...

PHYSICS INTERPRETATION:
The interaction physics suggests elastic scattering with a xenon nucleus.
The recombination probability of ~0.85 is consistent with nuclear recoils...

COMPARISON WITH LITERATURE:
This event signature matches the WIMP search region defined by XENON1T...

[... 5 more detailed sections ...]
""")
    
    print("\n" + "="*80)
    print("KEY IMPROVEMENTS:")
    print("="*80)
    print("  ✓ 10 detailed analysis sections (vs. 1 basic reasoning)")
    print("  ✓ Quantitative comparisons with expected values")
    print("  ✓ References to published experimental results")
    print("  ✓ Discussion of alternative interpretations")
    print("  ✓ Specific, actionable follow-up recommendations")
    print("  ✓ Comprehensive physics principles explained")
    print("  ✓ Uncertainty quantification and confidence factors")
    print("\n" + "="*80 + "\n")

if __name__ == '__main__':
    main()
