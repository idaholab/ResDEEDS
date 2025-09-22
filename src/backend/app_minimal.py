#!/usr/bin/env python3
"""
Minimal ResDEEDS backend for testing without full PyPSA dependencies
"""

from typing import Any, Dict, List, Optional
import json
import argparse
import sys

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# Check for pandas
try:
    import pandas as pd
    pandas_available = True
    print("Pandas available")
except ImportError:
    pd = None
    pandas_available = False
    print("Pandas not available")

class AnalyzeRequest(BaseModel):
    buses: List[Dict[str, Any]] = []
    generators: List[Dict[str, Any]] = []
    loads: List[Dict[str, Any]] = []
    lines: List[Dict[str, Any]] = []
    storage_units: List[Dict[str, Any]] = []
    snapshots: Optional[List[Any]] = None

app = FastAPI(title="ResDEEDS Analysis Service (Minimal)", version="0.1.0")

@app.get("/api/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "pypsa": True,  # Mock PyPSA as available
        "pandas": pandas_available,
        "pypsa_error": None,
        "pandas_error": None if pandas_available else "Pandas not available",
        "note": "This is a minimal backend for testing"
    }

@app.post("/api/analyze")
def analyze(payload: AnalyzeRequest) -> Dict[str, Any]:
    try:
        print(f"Received analysis request:")
        print(f"  Buses: {len(payload.buses)}")
        print(f"  Generators: {len(payload.generators)}")
        print(f"  Loads: {len(payload.loads)}")
        print(f"  Lines: {len(payload.lines)}")
        print(f"  Storage: {len(payload.storage_units)}")

        # Validate minimal requirements
        if not payload.buses:
            raise HTTPException(status_code=400, detail="Network must contain at least one bus")
        if not payload.generators and not payload.loads and not payload.storage_units:
            raise HTTPException(status_code=400, detail="Network must contain at least one component")

        # Mock successful analysis result
        mock_result = {
            "status": "ok",
            "objective": 0.0,
            "capacities": {
                "generators": [{"name": g.get("name", f"gen_{i}"), "p_nom": g.get("p_nom", 0)} for i, g in enumerate(payload.generators)],
                "lines": [{"name": l.get("name", f"line_{i}"), "s_nom": l.get("s_nom", 0)} for i, l in enumerate(payload.lines)],
                "storage_units": [{"name": s.get("name", f"storage_{i}"), "p_nom": s.get("p_nom", 0)} for i, s in enumerate(payload.storage_units)]
            },
            "power": {
                "generators": [{"name": g.get("name", f"gen_{i}"), "p": g.get("p_nom", 0) * 0.8} for i, g in enumerate(payload.generators)],
                "loads": [{"name": l.get("name", f"load_{i}"), "p": l.get("p_set", 0)} for i, l in enumerate(payload.loads)],
                "lines": [{"name": l.get("name", f"line_{i}"), "p0": 10.0} for i, l in enumerate(payload.lines)],
                "buses": [{"name": b.get("name", f"bus_{i}"), "p": 0.0} for i, b in enumerate(payload.buses)]
            },
            "snapshots": ["2024-01-01 00:00:00"],
            "statistics": {
                "total_buses": len(payload.buses),
                "total_generators": len(payload.generators),
                "total_loads": len(payload.loads),
                "note": "Mock analysis result - PyPSA not fully available"
            }
        }

        print("Mock analysis completed successfully")
        return mock_result

    except HTTPException:
        raise
    except Exception as e:
        print(f"Analysis failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "note": "This is a minimal backend for testing"
        }

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='ResDEEDS Minimal Backend')
    parser.add_argument('--host', default='127.0.0.1', help='Host to bind to')
    parser.add_argument('--port', type=int, default=8000, help='Port to bind to')
    parser.add_argument('--log-level', default='info', help='Log level')

    args = parser.parse_args()

    print(f"Starting ResDEEDS Minimal Backend on {args.host}:{args.port}")
    uvicorn.run(app, host=args.host, port=args.port, log_level=args.log_level)

if __name__ == "__main__":
    main()