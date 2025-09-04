# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for ResDEEDS FastAPI backend.

This spec file configures the bundling of the FastAPI application with
all necessary dependencies for PyPSA analysis.
"""

import sys
import os
from pathlib import Path

# Get the backend directory
backend_dir = Path(SPECPATH)

block_cipher = None

# Hidden imports required for FastAPI, Uvicorn, and PyPSA
hidden_imports = [
    # FastAPI core dependencies
    'fastapi',
    'fastapi.routing',
    'fastapi.applications',
    'fastapi.middleware',
    'fastapi.middleware.cors',
    'fastapi.middleware.trustedhost',
    'fastapi.exception_handlers',
    'fastapi.exceptions',
    'fastapi.responses',
    'fastapi.security',
    'fastapi.utils',
    'fastapi.concurrency',
    
    # Uvicorn server dependencies
    'uvicorn',
    'uvicorn.main',
    'uvicorn.server',
    'uvicorn.config',
    'uvicorn.workers',
    'uvicorn.workers.uvicorn_worker',
    'uvicorn.protocols',
    'uvicorn.protocols.http',
    'uvicorn.protocols.http.h11_protocol',
    'uvicorn.protocols.http.httptools_protocol',
    'uvicorn.protocols.websockets',
    'uvicorn.protocols.websockets.websockets_protocol',
    'uvicorn.protocols.websockets.wsproto_protocol',
    'uvicorn.lifespan',
    'uvicorn.lifespan.on',
    
    # Pydantic dependencies
    'pydantic',
    'pydantic.fields',
    'pydantic.main',
    'pydantic.validators',
    'pydantic.types',
    'pydantic.json',
    'pydantic.config',
    'pydantic.error_wrappers',
    'pydantic.utils',
    'pydantic.schema',
    'pydantic.typing',
    'pydantic._internal',
    'pydantic._internal._config',
    'pydantic._internal._fields',
    'pydantic._internal._generate_schema',
    'pydantic._internal._typing_extra',
    'pydantic._internal._utils',
    'pydantic._internal._validators',
    
    # Starlette (FastAPI dependency)
    'starlette',
    'starlette.applications',
    'starlette.routing',
    'starlette.responses',
    'starlette.requests',
    'starlette.middleware',
    'starlette.middleware.base',
    'starlette.middleware.cors',
    'starlette.middleware.errors',
    'starlette.middleware.exceptions',
    'starlette.exceptions',
    'starlette.types',
    'starlette.status',
    'starlette.background',
    'starlette.concurrency',
    
    # PyPSA and scientific computing dependencies
    'pypsa',
    'pypsa.components',
    'pypsa.optimization',
    'pypsa.optimization.optimize',
    'pypsa.io',
    'pypsa.networkclustering',
    'pypsa.plot',
    'pypsa.statistics',
    'pypsa.linopt',
    'pypsa.linopf',
    'pypsa.pf',
    'pypsa.contingency',
    'pypsa.geo',
    
    # Pandas and NumPy
    'pandas',
    'pandas.core',
    'pandas.core.groupby',
    'pandas.core.window',
    'pandas.io',
    'pandas.io.formats',
    'pandas.io.formats.style',
    'pandas._libs',
    'pandas._libs.tslibs',
    'numpy',
    'numpy.core',
    'numpy.core._multiarray_umath',
    'numpy.linalg',
    'numpy.random',
    
    # JSON and HTTP dependencies
    'json',
    'typing',
    'typing_extensions',
    'email_validator',
    'anyio',
    'sniffio',
    'h11',
    'httptools',
    'python_multipart',
    'websockets',
    'wsproto',
    
    # Other common dependencies
    'multiprocessing',
    'multiprocessing.spawn',
    'concurrent',
    'concurrent.futures',
    'asyncio',
    'signal',
    'argparse',
    'traceback',
    'threading',
    'time',
    'sys',
    'os',
    'pathlib',
    'warnings',
]

# Collect data files if any (currently none needed for basic FastAPI app)
datas = []

# Collect binaries (none specific needed for this application)
binaries = []

# Runtime hooks directory
runtime_hooks = [str(backend_dir / 'hooks' / 'rthook_pypsa.py')] if (backend_dir / 'hooks' / 'rthook_pypsa.py').exists() else []

a = Analysis(
    [str(backend_dir / '__main__.py')],
    pathex=[str(backend_dir)],
    binaries=binaries,
    datas=datas,
    hiddenimports=hidden_imports,
    hookspath=[str(backend_dir / 'hooks')] if (backend_dir / 'hooks').exists() else [],
    hooksconfig={},
    runtime_hooks=runtime_hooks,
    excludes=[
        # Exclude GUI frameworks we don't need
        'tkinter',
        'matplotlib.backends._backend_tk',
        'matplotlib.backends._backend_qt',
        'PyQt5',
        'PyQt6',
        'PySide2',
        'PySide6',
    ],
    noarchive=False,
    optimize=0,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='resdeeds-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # Keep console for server logs
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)