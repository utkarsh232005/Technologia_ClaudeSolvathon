"""
Monitor the progress of the anomaly detection analysis
Checks how many events have been processed
"""

import os
import json
from pathlib import Path
import time

print("="*80)
print("ANOMALY DETECTION - PROGRESS MONITOR")
print("="*80)

results_file = Path('results/detected_anomalies_detailed.json')
report_file = Path('anomaly_reports/anomaly_detection_report.txt')

print("\nMonitoring files:")
print(f"  📊 Results: {results_file}")
print(f"  📄 Report:  {report_file}")
print("\nPress Ctrl+C to stop monitoring...\n")

try:
    last_count = 0
    while True:
        if results_file.exists():
            try:
                with open(results_file, 'r') as f:
                    data = json.load(f)
                    count = len(data) if isinstance(data, list) else 0
                    
                if count != last_count:
                    print(f"[{time.strftime('%H:%M:%S')}] Anomalies detected so far: {count}")
                    last_count = count
            except:
                pass
        
        if report_file.exists():
            print(f"[{time.strftime('%H:%M:%S')}] ✅ Analysis complete! Report generated.")
            print(f"\nView report: Get-Content {report_file}")
            break
        
        time.sleep(5)  # Check every 5 seconds

except KeyboardInterrupt:
    print("\n\nMonitoring stopped.")
    if results_file.exists():
        try:
            with open(results_file, 'r') as f:
                data = json.load(f)
                print(f"Final count: {len(data)} anomalies detected")
        except:
            pass

print("\n" + "="*80)
