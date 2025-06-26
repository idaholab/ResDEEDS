from fastapi import APIRouter, Depends, HTTPException, status
import pandas as pd

from src.database.collection import case_document
from src.bll.auth import JWTBearer
from src.bll.psa.network import create_network, validate_user_input
from src.bll.utils import sanitize_dict
from src.bll.psa.utils import diagram_to_dict


router = APIRouter()


@router.get("/case/{case_id}/analyze/", dependencies=[Depends(JWTBearer())])
async def analyze_case(case_id: str):
    """Analyze a project's case."""
    case = case_document().get(document_id=case_id)

    if not case:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Case not found.",
        )

    # warning_message = validate_user_input(case)

    # Use a single snapshot with a simple index
    snapshots = pd.RangeIndex(1)
    network = create_network(
        case["name"], diagram_to_dict(case["diagram_data"]), snapshots=snapshots
    )

    # Run linear power flow analysis
    network.lpf()

    # Extract static component data
    static_data = {
        "buses": network.buses.to_dict(),
        "generators": network.generators.to_dict(),
        "loads": network.loads.to_dict(),
        "lines": network.lines.to_dict(),
        "storage_units": network.storage_units.to_dict(),
    }

    # Helper function to extract first snapshot from time series data
    def get_first_snapshot(df):
        if df.empty:
            return {}
        # Get the first row (snapshot) and convert to dict
        return {col: float(df[col].iloc[0]) for col in df.columns}

    # Extract power flow results - just the first snapshot for each
    flow_results = {
        # Line active power flow at bus0 and bus1 sides
        "lines_flow": {
            "p0": get_first_snapshot(network.lines_t.p0)
            if hasattr(network.lines_t, "p0")
            else {},
            "p1": get_first_snapshot(network.lines_t.p1)
            if hasattr(network.lines_t, "p1")
            else {},
            "q0": get_first_snapshot(network.lines_t.q0)
            if hasattr(network.lines_t, "q0")
            else {},
            "q1": get_first_snapshot(network.lines_t.q1)
            if hasattr(network.lines_t, "q1")
            else {},
        },
        # Generator output (active/reactive power)
        "generators_output": {
            "p": get_first_snapshot(network.generators_t.p)
            if hasattr(network.generators_t, "p")
            else {},
            "q": get_first_snapshot(network.generators_t.q)
            if hasattr(network.generators_t, "q")
            else {},
        },
        # Load consumption (if variable)
        "loads_consumption": {
            "p": get_first_snapshot(network.loads_t.p)
            if hasattr(network.loads_t, "p")
            else {},
            "q": get_first_snapshot(network.loads_t.q)
            if hasattr(network.loads_t, "q")
            else {},
        },
        # Storage units state
        "storage_units_state": {
            "p": get_first_snapshot(network.storage_units_t.p)
            if hasattr(network.storage_units_t, "p")
            else {},
            "state_of_charge": get_first_snapshot(
                network.storage_units_t.state_of_charge
            )
            if hasattr(network.storage_units_t, "state_of_charge")
            else {},
        },
        # Bus data (voltage angles and magnitudes)
        "buses_state": {
            "v_mag_pu": get_first_snapshot(network.buses_t.v_mag_pu)
            if hasattr(network.buses_t, "v_mag_pu")
            else {},
            "v_ang": get_first_snapshot(network.buses_t.v_ang)
            if hasattr(network.buses_t, "v_ang")
            else {},
        },
    }

    return sanitize_dict({"static_data": static_data, "flow_results": flow_results})
