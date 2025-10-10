"""
Quick test of anomaly detection system without Claude API
Tests basic functionality and rule-based detection
"""

import subprocess
import sys

print("="*80)
print("FAST ANOMALY DETECTION TEST (No AI)")
print("="*80)
print("\nRunning anomaly detection on 100 events without Claude API...")
print("This will use only rule-based detection (very fast)\n")

# Run without Claude API
result = subprocess.run(
    [sys.executable, "mainAnomalyDetection.py", 
     "--num-events", "100",
     "--no-claude",
     "--threshold", "0.2"],
    capture_output=False,
    text=True
)

if result.returncode == 0:
    print("\n" + "="*80)
    print("✅ TEST PASSED - System is working correctly!")
    print("="*80)
    print("\nNext step: Run with Claude AI for intelligent classification")
    print("Command: python mainAnomalyDetection.py --num-events 50")
else:
    print("\n" + "="*80)
    print("❌ TEST FAILED - Check errors above")
    print("="*80)
    sys.exit(1)
