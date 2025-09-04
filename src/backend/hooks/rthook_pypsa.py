# Runtime hook for PyPSA to fix data file paths when running from PyInstaller bundle

import sys
import os
from pathlib import Path

# Only run this hook when frozen (in PyInstaller bundle)
if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
    # We're running in a PyInstaller bundle
    bundle_dir = Path(sys._MEIPASS)
    
    # Check if pypsa data directory exists in the bundle
    pypsa_data_dir = bundle_dir / 'pypsa' / 'data'
    
    if pypsa_data_dir.exists():
        # Set environment variable that pypsa might use to find data files
        os.environ['PYPSA_DATA_DIR'] = str(pypsa_data_dir)
        
        # Also try to modify sys.path to help with import resolution
        pypsa_dir = bundle_dir / 'pypsa'
        if pypsa_dir.exists() and str(pypsa_dir) not in sys.path:
            sys.path.insert(0, str(pypsa_dir.parent))