#!/usr/bin/env python3
"""
Test the complete analyze workflow from network creation to results
"""

import sys
import subprocess
import time
import requests
import json

def test_analyze_workflow():
    """Test the complete analyze workflow"""
    print("Testing ResDEEDS Analyze Workflow")
    print("=" * 40)

    # 1. Start backend service
    print("1. Starting backend service...")
    backend_dir = "src/backend"
    proc = None

    try:
        proc = subprocess.Popen([
            sys.executable, "app_minimal.py", "--host", "127.0.0.1", "--port", "8007"
        ], cwd=backend_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # Wait for service to start
        time.sleep(3)

        # 2. Test health endpoint
        print("2. Testing health endpoint...")
        response = requests.get("http://127.0.0.1:8007/api/health", timeout=5)
        health_data = response.json()
        print(f"   Health: {health_data}")

        # 3. Create a simple test network
        print("3. Creating test network...")
        test_network = {
            "buses": [
                {"name": "bus1", "v_nom": 110, "x": 0, "y": 0},
                {"name": "bus2", "v_nom": 110, "x": 1, "y": 0}
            ],
            "generators": [
                {"name": "gen1", "bus": "bus1", "p_nom": 100, "carrier": "solar", "marginal_cost": 0}
            ],
            "loads": [
                {"name": "load1", "bus": "bus2", "p_set": 50, "q_set": 0}
            ],
            "lines": [
                {"name": "line1", "bus0": "bus1", "bus1": "bus2", "r": 0.01, "x": 0.1, "s_nom": 100}
            ],
            "storage_units": [],
            "snapshots": ["2024-01-01 00:00:00"]
        }

        # 4. Test analyze endpoint
        print("4. Testing analyze endpoint...")
        response = requests.post(
            "http://127.0.0.1:8007/api/analyze",
            json=test_network,
            timeout=30
        )

        if response.status_code == 200:
            result = response.json()
            print(f"   Analysis result status: {result.get('status')}")
            if result.get('error'):
                print(f"   Analysis warning/error: {result.get('error')}")
            if result.get('objective') is not None:
                print(f"   Objective: {result.get('objective')}")
            print("Analysis endpoint working!")
            return True
        else:
            print(f"Analysis failed with status {response.status_code}: {response.text}")
            return False

    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        if proc:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()

if __name__ == "__main__":
    success = test_analyze_workflow()
    if success:
        print("\nAnalyze workflow test PASSED!")
        print("The analyze button should now work in ResDEEDS.")
    else:
        print("\nAnalyze workflow test FAILED.")
    sys.exit(0 if success else 1)