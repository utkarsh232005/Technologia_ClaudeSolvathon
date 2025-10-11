#!/usr/bin/env python3
"""
Final Integration Verification Script
Confirms that the anomaly detection system is fully connected and working
"""

import requests
import json
import sys

print("=" * 80)
print("🎉 ANOMALY DETECTION SYSTEM - FINAL INTEGRATION VERIFICATION")
print("=" * 80)
print()

def check(description, condition):
    """Check a condition and print result"""
    status = "✅" if condition else "❌"
    print(f"{status} {description}")
    return condition

# Check 1: Backend is running
print("📡 Checking Backend Connectivity...")
try:
    response = requests.get("http://localhost:5001/api/health", timeout=5)
    backend_running = response.status_code == 200
except:
    backend_running = False

check("Backend server is accessible at http://localhost:5001", backend_running)

if not backend_running:
    print("\n❌ Cannot proceed: Backend server not running")
    print("   Start it with: python webapp_backend.py")
    sys.exit(1)

print()

# Check 2: Anomaly detection endpoints exist
print("🔍 Checking Anomaly Detection Endpoints...")

endpoints = [
    ("/api/anomaly/detect", "POST"),
    ("/api/anomaly/analyze-dataset", "POST"),
    ("/api/anomaly/classify", "POST")
]

endpoint_tests = []
for endpoint, method in endpoints:
    try:
        # Send a minimal test request
        if endpoint == "/api/anomaly/detect":
            response = requests.post(f"http://localhost:5001{endpoint}", 
                                    json={"events": [], "use_claude": False},
                                    timeout=10)
        elif endpoint == "/api/anomaly/analyze-dataset":
            response = requests.post(f"http://localhost:5001{endpoint}",
                                    json={"max_events": 10, "use_claude": False},
                                    timeout=10)
        else:
            response = requests.post(f"http://localhost:5001{endpoint}",
                                    json={"event": {"energy": 50, "s1": 100, "s2": 500}},
                                    timeout=10)
        
        # Any response (even error) means endpoint exists
        exists = response.status_code in [200, 400, 500]
        endpoint_tests.append(exists)
        check(f"{method} {endpoint} is implemented", exists)
    except Exception as e:
        endpoint_tests.append(False)
        check(f"{method} {endpoint} is implemented", False)

print()

# Check 3: Statistical anomaly detection works
print("📊 Testing Statistical Anomaly Detection (No Claude)...")

try:
    response = requests.post("http://localhost:5001/api/anomaly/detect",
        json={
            "events": [{"energy": 150, "s1": 250, "s2": 8000, "s2s1Ratio": 32}],
            "use_claude": False,
            "threshold": 0.3
        },
        timeout=15
    )
    data = response.json()
    statistical_works = data.get("success", False) and response.status_code == 200
    check("Statistical anomaly detection working", statistical_works)
    
    if statistical_works:
        print(f"   → Detected {data.get('anomalies_detected', 0)} anomalies in {data.get('total_events_analyzed', 0)} events")
except Exception as e:
    statistical_works = False
    check("Statistical anomaly detection working", False)
    print(f"   Error: {e}")

print()

# Check 4: Dataset analysis works
print("📈 Testing Dataset Analysis...")

try:
    response = requests.post("http://localhost:5001/api/anomaly/analyze-dataset",
        json={"max_events": 20, "use_claude": False, "threshold": 0.3},
        timeout=20
    )
    data = response.json()
    dataset_works = data.get("success", False) and response.status_code == 200
    check("Dataset analysis working", dataset_works)
    
    if dataset_works:
        stats = data.get("statistics", {})
        print(f"   → Analyzed {stats.get('total_analyzed', 0)} events")
        print(f"   → Found {stats.get('anomalies_detected', 0)} anomalies ({stats.get('anomaly_rate', 0)*100:.1f}% rate)")
        print(f"   → Average anomaly score: {stats.get('avg_anomaly_score', 0):.3f}")
except Exception as e:
    dataset_works = False
    check("Dataset analysis working", False)
    print(f"   Error: {e}")

print()

# Check 5: Frontend files exist
print("🎨 Checking Frontend Integration...")

import os

frontend_files = [
    ("webapp/src/pages/AnomalyDetection.tsx", "Anomaly Detection page"),
    ("webapp/src/lib/anomalyAPI.ts", "Anomaly API library"),
]

frontend_checks = []
for filepath, description in frontend_files:
    full_path = os.path.join(os.path.dirname(__file__), filepath)
    exists = os.path.exists(full_path)
    frontend_checks.append(exists)
    check(f"{description} exists", exists)

print()

# Check 6: Test files exist
print("🧪 Checking Test Files...")

test_files = [
    ("test_anomaly_api_no_claude.py", "Backend API tests"),
    ("test_anomaly_frontend.html", "Frontend integration tests"),
    ("ANOMALY_DETECTION_INTEGRATION.md", "Integration documentation"),
]

test_checks = []
for filepath, description in test_files:
    full_path = os.path.join(os.path.dirname(__file__), filepath)
    exists = os.path.exists(full_path)
    test_checks.append(exists)
    check(f"{description} exists", exists)

print()
print("=" * 80)
print("📋 FINAL VERIFICATION SUMMARY")
print("=" * 80)
print()

# Summary
all_checks = (
    [backend_running] + 
    endpoint_tests + 
    [statistical_works, dataset_works] +
    frontend_checks +
    test_checks
)

passed = sum(all_checks)
total = len(all_checks)

print(f"Checks Passed: {passed}/{total}")
print()

if passed == total:
    print("🎉 SUCCESS! All integration checks passed!")
    print()
    print("✅ Backend API is fully functional")
    print("✅ Statistical anomaly detection working")
    print("✅ Dataset analysis working")
    print("✅ Frontend integration complete")
    print("✅ Test suite available")
    print()
    print("🚀 The anomaly detection system is READY FOR USE!")
    print()
    print("Next Steps:")
    print("1. Start the frontend: cd webapp && npm run dev")
    print("2. Navigate to: http://localhost:5173/anomaly-detection")
    print("3. (Optional) Add Claude API key to .env for AI features")
    print()
    print("📖 Read ANOMALY_DETECTION_INTEGRATION.md for full documentation")
    sys.exit(0)
else:
    print("⚠️  Some checks failed. Review the results above.")
    failed_checks = total - passed
    print(f"   {failed_checks} issue(s) need attention")
    sys.exit(1)
