#!/usr/bin/env python3
"""
Entry point for the ResDEEDS backend when run as a module or standalone executable.

This file allows the backend to be run in multiple ways:
1. As a module: python -m resdeeds-backend
2. As a script: python __main__.py
3. As a PyInstaller executable: ./resdeeds-backend
"""

import sys
import os
from pathlib import Path

# Add the current directory to Python path for imports
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Import and run the main function from app.py
if __name__ == "__main__":
    try:
        from app import main
        main()
    except KeyboardInterrupt:
        print("\nShutdown requested")
        sys.exit(0)
    except ImportError as e:
        print(f"Failed to import backend application: {e}")
        print("Make sure all dependencies are installed.")
        sys.exit(1)
    except Exception as e:
        print(f"Failed to start backend: {e}")
        sys.exit(1)