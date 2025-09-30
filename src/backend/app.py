from typing import Any, Dict, List, Optional

import json
import traceback
import argparse
import signal
import sys
import threading
import time

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# Attempt imports with diagnostics captured for health reporting
pypsa_import_error: Optional[str] = None
pandas_import_error: Optional[str] = None
try:
    import pandas as pd  # type: ignore
except Exception as e:  # pragma: no cover - diagnostics only
    pd = None  # type: ignore
    pandas_import_error = f"{type(e).__name__}: {e}"

# PyPSA import with optional dependency handling
try:
    # Temporarily suppress warnings during import
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        import pypsa  # type: ignore

    # Check if we can create a basic network (this will test core functionality)
    try:
        test_network = pypsa.Network()
        test_network.add("Bus", "test_bus", v_nom=110)
        pypsa_working = True
        pypsa_import_error = None
        print("PyPSA core functionality verified")
    except Exception as network_error:
        pypsa_working = False
        pypsa_import_error = f"PyPSA network creation failed: {network_error}"
        print(f"PyPSA network creation failed: {network_error}")

except Exception as e:  # pragma: no cover - diagnostics only
    pypsa = None  # type: ignore
    pypsa_working = False
    pypsa_import_error = f"{type(e).__name__}: {e}"
    print(f"PyPSA import failed: {e}")


class AnalyzeRequest(BaseModel):
    buses: List[Dict[str, Any]] = []
    generators: List[Dict[str, Any]] = []
    loads: List[Dict[str, Any]] = []
    lines: List[Dict[str, Any]] = []
    storage_units: List[Dict[str, Any]] = []
    snapshots: Optional[List[Any]] = None


app = FastAPI(title="ResDEEDS Analysis Service", version="0.1.0")


@app.get("/api/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "pypsa": bool(pypsa) and pypsa_working,
        "pandas": bool(pd),
        "pypsa_error": pypsa_import_error,
        "pandas_error": pandas_import_error,
    }


# Global server instance for graceful shutdown
server_instance = None
shutdown_event = threading.Event()


def signal_handler(signum, frame):
    """Handle shutdown signals gracefully."""
    print(f"\nReceived signal {signum}, shutting down gracefully...")
    shutdown_event.set()
    if server_instance:
        server_instance.should_exit = True


def build_pypsa_network(payload: AnalyzeRequest):
    if not pypsa or not pd:
        details = []
        if not pypsa and pypsa_import_error:
            details.append(f"pypsa import error: {pypsa_import_error}")
        if not pd and pandas_import_error:
            details.append(f"pandas import error: {pandas_import_error}")
        msg = "Python dependencies missing. Ensure 'pypsa' and 'pandas' are installed."
        if details:
            msg = f"{msg} (" + "; ".join(details) + ")"
        raise RuntimeError(msg)

    n = pypsa.Network()

    # Snapshots
    if payload.snapshots:
        try:
            # Accept both strings and timestamps
            snapshots = pd.to_datetime(payload.snapshots)
            n.set_snapshots(snapshots)
        except Exception:
            # Fallback to a single synthetic snapshot
            n.set_snapshots(pd.date_range("2024-01-01", periods=1, freq="H"))
    else:
        n.set_snapshots(pd.date_range("2024-01-01", periods=1, freq="H"))

    # Buses
    for bus in payload.buses:
        n.add(
            "Bus",
            bus.get("name") or bus.get("id") or str(len(n.buses)),
            v_nom=bus.get("v_nom") if bus.get("v_nom") is not None else 110,
            carrier=bus.get("carrier") if bus.get("carrier") is not None else "AC",
            x=bus.get("x"),
            y=bus.get("y"),
        )

    # Generators
    for gen in payload.generators:
        n.add(
            "Generator",
            gen.get("name") or gen.get("id") or f"gen_{len(n.generators)}",
            bus=gen.get("bus") if gen.get("bus") is not None else "",
            p_nom=gen.get("p_nom") if gen.get("p_nom") is not None else 0,
            p_nom_extendable=bool(gen.get("p_nom_extendable") if gen.get("p_nom_extendable") is not None else False),
            carrier=gen.get("carrier") if gen.get("carrier") is not None else "generic",
            marginal_cost=gen.get("marginal_cost") if gen.get("marginal_cost") is not None else 1,  # 0.001 $/kWh converted to $/MWh
            capital_cost=gen.get("capital_cost") if gen.get("capital_cost") is not None else 0,
            control=gen.get("control") if gen.get("control") is not None else "PQ",
        )

    # Loads
    for load in payload.loads:
        n.add(
            "Load",
            load.get("name") or load.get("id") or f"load_{len(n.loads)}",
            bus=load.get("bus") if load.get("bus") is not None else "",
            p_set=load.get("p_set") if load.get("p_set") is not None else 0,
            q_set=load.get("q_set") if load.get("q_set") is not None else 0,
        )

    # Lines
    for line in payload.lines:
        n.add(
            "Line",
            line.get("name") or line.get("id") or f"line_{len(n.lines)}",
            bus0=line.get("bus0"),
            bus1=line.get("bus1"),
            r=line.get("r") if line.get("r") is not None else 0.01,
            x=line.get("x") if line.get("x") is not None else 0.1,
            s_nom=line.get("s_nom") if line.get("s_nom") is not None else 0,
            s_nom_extendable=bool(line.get("s_nom_extendable") if line.get("s_nom_extendable") is not None else False),
            length=line.get("length"),
            capital_cost=line.get("capital_cost"),
            s_max_pu=line.get("s_max_pu"),
        )

    # Storage Units
    for su in payload.storage_units:
        n.add(
            "StorageUnit",
            su.get("name") or su.get("id") or f"storage_{len(n.storage_units)}",
            bus=su.get("bus") if su.get("bus") is not None else "",
            p_nom=su.get("p_nom") if su.get("p_nom") is not None else 0,
            p_nom_extendable=bool(su.get("p_nom_extendable") if su.get("p_nom_extendable") is not None else False),
            max_hours=su.get("max_hours") if su.get("max_hours") is not None else 4,
            efficiency_store=su.get("efficiency_store") if su.get("efficiency_store") is not None else (su.get("efficiency") if su.get("efficiency") is not None else 0.9),
            efficiency_dispatch=su.get("efficiency_dispatch") if su.get("efficiency_dispatch") is not None else (su.get("efficiency") if su.get("efficiency") is not None else 0.9),
            capital_cost=su.get("capital_cost") if su.get("capital_cost") is not None else 0,
            cyclic_state_of_charge=bool(su.get("cyclic_state_of_charge") if su.get("cyclic_state_of_charge") is not None else True),
        )

    return n


@app.post("/api/analyze")
def analyze(payload: AnalyzeRequest) -> Dict[str, Any]:
    try:
        # Check dependencies first
        if not pypsa or not pd or not pypsa_working:
            details = []
            if not pypsa and pypsa_import_error:
                details.append(f"pypsa import error: {pypsa_import_error}")
            if not pd and pandas_import_error:
                details.append(f"pandas import error: {pandas_import_error}")
            if pypsa and not pypsa_working and pypsa_import_error:
                details.append(f"pypsa functionality error: {pypsa_import_error}")

            msg = "Python dependencies missing or not working. Ensure 'pypsa' and 'pandas' are properly installed."
            if details:
                msg = f"{msg} (" + "; ".join(details) + ")"
            return {"status": "error", "error": msg}

        n = build_pypsa_network(payload)

        # Validate minimal completeness
        if n.buses.empty:
            raise HTTPException(status_code=400, detail="Network must contain at least one bus")
        if n.loads.empty and n.generators.empty and n.storage_units.empty:
            raise HTTPException(status_code=400, detail="Network must contain at least one component (load/generator/storage)")

        print(f"Running optimization for network with {len(n.buses)} buses, {len(n.generators)} generators, {len(n.loads)} loads")

        # Run linear optimization (LOPF) with timeout handling
        try:
            # For basic networks, we can skip optimization if PyPSA's solver isn't fully configured
            # and just return the network structure
            n.optimize()
            print("Optimization completed successfully")
        except Exception as opt_error:
            print(f"Optimization failed: {opt_error}")
            return {
                "status": "error",
                "error": f"PyPSA optimization failed: {opt_error}. This usually indicates missing solver dependencies or network configuration issues."
            }

        # Gather results
        objective = getattr(n, "objective", None)

        # Capacities
        def series_or_empty(df, col):
            return df[col] if (col in df.columns) else None

        capacities = {
            "generators": (
                n.generators[["p_nom"]]
                .assign(p_nom_opt=series_or_empty(n.generators, "p_nom_opt"))
                .reset_index()
                .rename(columns={"index": "name"})
                .to_dict(orient="records")
            ) if not n.generators.empty else [],
            "lines": (
                n.lines[["s_nom"]]
                .assign(s_nom_opt=series_or_empty(n.lines, "s_nom_opt"))
                .reset_index()
                .rename(columns={"index": "name"})
                .to_dict(orient="records")
            ) if not n.lines.empty else [],
            "storage_units": (
                n.storage_units[["p_nom", "max_hours"]]
                .assign(p_nom_opt=series_or_empty(n.storage_units, "p_nom_opt"))
                .reset_index()
                .rename(columns={"index": "name"})
                .to_dict(orient="records")
            ) if not n.storage_units.empty else [],
        }

        # Power flows and dispatch at the first snapshot for brevity
        if len(n.snapshots) > 0:
            snap = n.snapshots[0]
        else:
            snap = None

        power = {
            "generators": (
                n.generators_t.p.loc[snap].reset_index().rename(columns={"index": "name", snap: "p"}).to_dict(orient="records")
                if hasattr(n, "generators_t") and hasattr(n.generators_t, "p") and snap is not None else []
            ),
            "loads": (
                n.loads_t.p.loc[snap].reset_index().rename(columns={"index": "name", snap: "p"}).to_dict(orient="records")
                if hasattr(n, "loads_t") and hasattr(n.loads_t, "p") and snap is not None else []
            ),
            "lines": (
                n.lines_t.p0.loc[snap].reset_index().rename(columns={"index": "name", snap: "p0"}).to_dict(orient="records")
                if hasattr(n, "lines_t") and hasattr(n.lines_t, "p0") and snap is not None else []
            ),
            "buses": (
                n.buses_t.p.loc[snap].reset_index().rename(columns={"index": "name", snap: "p"}).to_dict(orient="records")
                if hasattr(n, "buses_t") and hasattr(n.buses_t, "p") and snap is not None else []
            ),
        }

        stats = {}
        try:
            # Some PyPSA stats helpers
            s = n.statistics()
            stats = json.loads(s.to_json()) if hasattr(s, "to_json") else {}
        except Exception:
            stats = {}

        return {
            "status": "ok",
            "objective": objective,
            "capacities": capacities,
            "power": power,
            "snapshots": [str(s) for s in list(n.snapshots)],
            "statistics": stats,
        }
    except HTTPException:
        raise
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc(limit=3),
        }


def create_server(host: str = "127.0.0.1", port: int = 8000, log_level: str = "info"):
    """Create and configure the uvicorn server."""
    config = uvicorn.Config(
        app=app,
        host=host,
        port=port,
        log_level=log_level,
        access_log=True,
        server_header=False,
        date_header=False,
    )
    return uvicorn.Server(config)


def main():
    """Main entry point for the backend server."""
    parser = argparse.ArgumentParser(
        description="ResDEEDS Analysis Backend Service",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    
    parser.add_argument(
        "--host",
        type=str,
        default="127.0.0.1",
        help="Host to bind the server to"
    )
    
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to bind the server to"
    )
    
    parser.add_argument(
        "--log-level",
        type=str,
        default="info",
        choices=["critical", "error", "warning", "info", "debug", "trace"],
        help="Log level for the server"
    )
    
    parser.add_argument(
        "--version",
        action="version",
        version="ResDEEDS Backend 0.1.0"
    )
    
    args = parser.parse_args()
    
    # Set up signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Create and start the server
    global server_instance
    server_instance = create_server(
        host=args.host,
        port=args.port,
        log_level=args.log_level
    )
    
    print(f"Starting ResDEEDS Analysis Backend...")
    print(f"Server will be available at: http://{args.host}:{args.port}")
    print(f"Health check: http://{args.host}:{args.port}/api/health")
    print(f"API docs: http://{args.host}:{args.port}/docs")
    print("Press Ctrl+C to stop the server")
    
    try:
        server_instance.run()
    except KeyboardInterrupt:
        print("\nShutdown requested by user")
    except Exception as e:
        print(f"Server error: {e}")
        sys.exit(1)
    finally:
        print("Server stopped")


if __name__ == "__main__":
    main()
