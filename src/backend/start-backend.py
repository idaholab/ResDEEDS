#!/usr/bin/env python3
"""
Startup script for ResDEEDS backend that ensures dependencies are available
"""

import sys
import os
import subprocess
from pathlib import Path

def ensure_dependencies():
    """Ensure all required dependencies are installed"""
    try:
        import fastapi, uvicorn, pypsa, pandas
        print("All dependencies available")
        return True
    except ImportError as e:
        print(f"Missing dependencies: {e}")
        print("Installing dependencies with uv...")

        try:
            # Try to install with uv sync
            result = subprocess.run([
                sys.executable, "-m", "uv", "sync"
            ], cwd=Path(__file__).parent, capture_output=True, text=True)

            if result.returncode == 0:
                print("Dependencies installed successfully")
                return True
            else:
                print(f"uv sync failed: {result.stderr}")
                return False
        except Exception as install_error:
            print(f"Failed to install dependencies: {install_error}")
            return False

def start_backend():
    """Start the backend service"""
    # Check for required PyPSA dependencies
    missing_deps = []

    try:
        import pypsa
    except ImportError:
        missing_deps.append("pypsa")

    try:
        import geopandas
    except ImportError:
        missing_deps.append("geopandas")

    try:
        import pandas
    except ImportError:
        missing_deps.append("pandas")

    if missing_deps:
        print(f"ERROR: Missing required dependencies: {', '.join(missing_deps)}")
        print()
        print("To install the missing dependencies, run:")
        print("  pip install pypsa geopandas pandas")
        print()
        print("Or with uv:")
        print("  uv add pypsa geopandas pandas")
        print()
        print("Note: geopandas requires additional system dependencies.")
        print("See: https://geopandas.org/en/stable/getting_started/install.html")
        return False

    # All dependencies available, start the full backend
    try:
        from app import main
        print("Starting ResDEEDS backend with full PyPSA support...")
        main()
    except Exception as e:
        print(f"Failed to start backend: {e}")
        return False

if __name__ == "__main__":
    start_backend()