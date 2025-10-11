#!/usr/bin/env python3
"""
Quick test script for the /api/dataset/statistics endpoint
"""

import requests
import json

def test_statistics_endpoint():
    """Test the statistics endpoint"""
    print("🧪 Testing /api/dataset/statistics endpoint...")
    print()
    
    try:
        # Test the endpoint
        response = requests.get('http://localhost:5001/api/dataset/statistics', timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success'):
                stats = data['statistics']
                print("✅ Successfully loaded statistics!")
                print(f"   📊 Total Events: {stats['totalEvents']:,}")
                print(f"   🔬 Data Source: {stats.get('dataSource', 'unknown')}")
                
                if stats.get('dataSource') == 'mixed':
                    print(f"   🔬 Analyzed: {stats.get('analyzedCount', 0)}")
                    print(f"   📊 Raw: {stats.get('rawCount', 0)}")
                
                print(f"   🎯 Classifications:")
                for label, count in stats.get('classificationBreakdown', {}).items():
                    print(f"      - {label}: {count}")
                
                print(f"   ⚡ Confidence Distribution:")
                conf = stats.get('confidenceDistribution', {})
                print(f"      - High (>80%): {conf.get('high', 0)}")
                print(f"      - Medium (50-80%): {conf.get('medium', 0)}")
                print(f"      - Low (<50%): {conf.get('low', 0)}")
                
                print(f"   📈 Scatter Points: {len(stats.get('scatterData', []))}")
                print()
                print("✅ All checks passed!")
                return True
            else:
                print(f"❌ API returned error: {data.get('error')}")
                return False
        else:
            print(f"❌ HTTP Error {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server")
        print("   Make sure to run: python3 webapp_backend.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    success = test_statistics_endpoint()
    exit(0 if success else 1)
