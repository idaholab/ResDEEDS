from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import Annotated
import pandas as pd

from src.database.collection import case_document
from src.bll.auth import JWTBearer
from src.bll.psa.network import create_network
from src.bll.psa.dynamic_network import create_dynamic_network, validate_network_topology, NetworkValidationError
from src.bll.utils import sanitize_dict
from src.models.payload.network_models import NetworkCreationModel, NetworkResponseModel


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

    # Use a single snapshot with a simple index
    snapshots = pd.RangeIndex(1)
    network = create_network(case["name"], snapshots=snapshots)

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


@router.post(
    "/network/create/",
    response_model=NetworkResponseModel,
    dependencies=[Depends(JWTBearer())],
    status_code=status.HTTP_201_CREATED
)
async def create_pypsa_network(
    network_config: Annotated[
        NetworkCreationModel,
        Body(
            description="Configuration for PyPSA network creation",
            examples={
                "simple_network": {
                    "name": "Test Network",
                    "buses": [
                        {"name": "Bus1", "carrier": "AC", "v_nom": 20.0},
                        {"name": "Bus2", "carrier": "AC", "v_nom": 20.0}
                    ],
                    "generators": [{
                        "name": "Gen1",
                        "bus": "Bus1", 
                        "carrier": "gas",
                        "p_nom": 100.0,
                        "marginal_cost": 50.0,
                        "control": "Slack"
                    }],
                    "loads": [{
                        "name": "Load1",
                        "bus": "Bus2",
                        "p_set": 80.0
                    }],
                    "lines": [{
                        "name": "Line1",
                        "bus0": "Bus1",
                        "bus1": "Bus2",
                        "length": 5.0
                    }]
                }
            }
        )
    ]
) -> NetworkResponseModel:
    """Create a PyPSA network with specified configuration."""
    
    try:
        # Validate network topology
        validate_network_topology(network_config)
        
        # Create the network
        network, component_counts = create_dynamic_network(network_config)
        
        return NetworkResponseModel(
            network_name=network.name,
            component_counts=component_counts,
            status="created",
            message=f"Successfully created network '{network.name}' with {sum(component_counts.values())} components"
        )
    except NetworkValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Network validation failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create network: {str(e)}"
        )
