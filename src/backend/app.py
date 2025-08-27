from typing import Any, Dict, List, Optional

import json
import traceback

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

try:
    import pandas as pd
    import pypsa
except Exception as e:
    # Defer import errors to runtime responses to keep server importable
    pd = None
    pypsa = None


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
        "pypsa": bool(pypsa),
        "pandas": bool(pd),
    }


def build_pypsa_network(payload: AnalyzeRequest):
    if pypsa is None or pd is None:
        raise RuntimeError(
            "Python dependencies missing. Ensure 'pypsa' and 'pandas' are installed."
        )

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
            v_nom=bus.get("v_nom", 110),
            carrier=bus.get("carrier", "AC"),
            x=bus.get("x"),
            y=bus.get("y"),
        )

    # Generators
    for gen in payload.generators:
        n.add(
            "Generator",
            gen.get("name") or gen.get("id") or f"gen_{len(n.generators)}",
            bus=gen.get("bus", ""),
            p_nom=gen.get("p_nom", 0),
            p_nom_extendable=bool(gen.get("p_nom_extendable", False)),
            carrier=gen.get("carrier", "generic"),
            marginal_cost=gen.get("marginal_cost", 0),
            capital_cost=gen.get("capital_cost", 0),
            control=gen.get("control", "PQ"),
        )

    # Loads
    for load in payload.loads:
        n.add(
            "Load",
            load.get("name") or load.get("id") or f"load_{len(n.loads)}",
            bus=load.get("bus", ""),
            p_set=load.get("p_set", 0),
            q_set=load.get("q_set", 0),
        )

    # Lines
    for line in payload.lines:
        n.add(
            "Line",
            line.get("name") or line.get("id") or f"line_{len(n.lines)}",
            bus0=line.get("bus0"),
            bus1=line.get("bus1"),
            r=line.get("r", 0.01),
            x=line.get("x", 0.1),
            s_nom=line.get("s_nom", 0),
            s_nom_extendable=bool(line.get("s_nom_extendable", False)),
            length=line.get("length"),
            capital_cost=line.get("capital_cost"),
            s_max_pu=line.get("s_max_pu"),
        )

    # Storage Units
    for su in payload.storage_units:
        n.add(
            "StorageUnit",
            su.get("name") or su.get("id") or f"storage_{len(n.storage_units)}",
            bus=su.get("bus", ""),
            p_nom=su.get("p_nom", 0),
            p_nom_extendable=bool(su.get("p_nom_extendable", False)),
            max_hours=su.get("max_hours", 4),
            efficiency_store=su.get("efficiency_store", su.get("efficiency", 0.9)),
            efficiency_dispatch=su.get("efficiency_dispatch", su.get("efficiency", 0.9)),
            capital_cost=su.get("capital_cost", 0),
            cyclic_state_of_charge=bool(su.get("cyclic_state_of_charge", True)),
        )

    return n


@app.post("/api/analyze")
def analyze(payload: AnalyzeRequest) -> Dict[str, Any]:
    try:
        n = build_pypsa_network(payload)

        # Validate minimal completeness
        if n.buses.empty:
            raise HTTPException(status_code=400, detail="Network must contain at least one bus")
        if n.loads.empty and n.generators.empty and n.storage_units.empty:
            raise HTTPException(status_code=400, detail="Network must contain at least one component (load/generator/storage)")

        # Run linear optimization (LOPF)
        n.optimize()

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

