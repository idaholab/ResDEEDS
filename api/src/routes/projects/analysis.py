from fastapi import APIRouter, Depends, HTTPException, status

from src.database.collection import case_document
from src.bll.auth import JWTBearer
from src.bll.psa.network import create_network
from src.bll.utils import sanitize_dict


router = APIRouter()


@router.get("/case/{case_id}/analyze/", dependencies=[Depends(JWTBearer())])
async def analyze_case(case_id: str):
    """Get all projects by user id."""
    case = case_document().get(document_id=case_id)

    if not case:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Case not found.",
        )

    network = create_network(case["name"])

    # Run linear power flow analysis
    network.lpf()

    return sanitize_dict(
        {
            "buses": network.buses.to_dict(),
            "generators": network.generators.to_dict(),
            "loads": network.loads.to_dict(),
            "lines": network.lines.to_dict(),
            "storage_units": network.storage_units.to_dict(),
        }
    )
