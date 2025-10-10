#!/usr/bin/env python3
"""
Quick test script for anomaly detection system
Tests with just 5 events to verify everything works
"""

import subprocess
import sys
from pathlib import Path

def main():
    print("\n" + "="*80)
    print("ANOMALY DETECTION SYSTEM - QUICK TEST")
    print("="*80 + "\n")
    
    print("This will test the anomaly detection system with 5 events")
    print("to verify that everything is working correctly.\n")
    
    # Check if dataset exists
    dataset_path = Path('../dataset/dark_matter_synthetic_dataset.csv')
    if not dataset_path.exists():
        print("❌ Dataset not found!")
        print(f"   Expected: {dataset_path.absolute()}")
        print("\n   Please generate the dataset first:")
        print("   cd ../Python_Files")
        print("   python mainDatasetCreation.py\n")
        sys.exit(1)
    
    print("✓ Dataset found\n")
    
    # Check if .env exists
    env_path = Path('../.env')
    if not env_path.exists():
        print("⚠️  Warning: .env file not found")
        print("   The script will check for API key anyway\n")
    
    print("Running anomaly detection with 5 events...\n")
    print("-" * 80 + "\n")
    
    # Run the anomaly detection
    try:
        result = subprocess.run(
            [sys.executable, 'mainAnomalyDetection.py', '--num-events', '5'],
            check=True
        )
        
        print("\n" + "-" * 80)
        print("\n✅ TEST SUCCESSFUL!")
        print("\nThe anomaly detection system is working correctly.")
        print("\nNext steps:")
        print("  1. Check results: cat results/detected_anomalies_detailed.csv")
        print("  2. Read report:   cat anomaly_reports/anomaly_detection_report.txt")
        print("  3. Run full scan: python mainAnomalyDetection.py\n")
        
    except subprocess.CalledProcessError as e:
        print("\n" + "-" * 80)
        print("\n❌ TEST FAILED")
        print(f"\nError code: {e.returncode}")
        print("\nPlease check:")
        print("  1. Is the Claude API key set in ../.env?")
        print("  2. Is the dataset file present?")
        print("  3. Are all dependencies installed (pip install -r ../requirements.txt)?\n")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(0)

if __name__ == '__main__':
    main()
