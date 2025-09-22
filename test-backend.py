#!/usr/bin/env python3
"""
Test script to verify ResDEEDS backend functionality
"""

import sys
import subprocess
import time
import requests
import json

def test_dependencies():
    """Test if required dependencies are available"""
    print("Testing Python dependencies...")

    try:
        import fastapi
        print(f"✓ FastAPI {fastapi.__version__}")
    except ImportError as e:
        print(f"✗ FastAPI not available: {e}")
        return False

    try:
        import uvicorn
        print(f"✓ Uvicorn available")
    except ImportError as e:
        print(f"✗ Uvicorn not available: {e}")
        return False

    try:
        import pandas as pd
        print(f"✓ Pandas {pd.__version__}")
    except ImportError as e:
        print(f"✗ Pandas not available: {e}")
        return False

    try:
        import pypsa
        print(f"✓ PyPSA {pypsa.__version__}")
    except ImportError as e:
        print(f"✗ PyPSA not available: {e}")
        return False

    return True

def test_backend_service():
    """Test the backend service"""
    print("\nTesting backend service...")

    # Start backend service
    backend_dir = "src/backend"
    proc = None

    try:
        # Try to start with uv first
        print("Starting backend with uv environment...")
        proc = subprocess.Popen([
            sys.executable, "-m", "uv", "run", "python", "app.py",
            "--host", "127.0.0.1", "--port", "8002"
        ], cwd=backend_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # Wait for service to start
        time.sleep(3)

        # Test health endpoint
        response = requests.get("http://127.0.0.1:8002/api/health", timeout=5)
        health_data = response.json()

        print(f"Health check response: {json.dumps(health_data, indent=2)}")

        if health_data.get("status") == "ok" and health_data.get("pypsa") and health_data.get("pandas"):
            print("✓ Backend service is working correctly!")
            return True
        else:
            print("✗ Backend service has dependency issues")
            return False

    except subprocess.TimeoutExpired:
        print("✗ Backend service failed to start (timeout)")
        return False
    except requests.RequestException as e:
        print(f"✗ Failed to connect to backend service: {e}")
        return False
    except Exception as e:
        print(f"✗ Error testing backend service: {e}")
        return False
    finally:
        if proc:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()

def main():
    print("ResDEEDS Backend Test")
    print("=" * 30)

    # Test 1: Dependencies
    deps_ok = test_dependencies()

    # Test 2: Backend service (only if deps are OK)
    if deps_ok:
        service_ok = test_backend_service()

        if service_ok:
            print("\n🎉 All tests passed! The analyze button should work now.")
        else:
            print("\n❌ Backend service tests failed. Check dependencies.")
    else:
        print("\n❌ Dependency tests failed. Run: python -m uv sync")

if __name__ == "__main__":
    main()