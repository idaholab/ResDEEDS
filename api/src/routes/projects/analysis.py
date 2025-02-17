from fastapi import APIRouter, Depends

from src.bll.auth import JWTBearer
from src.bll.psa.network import create_network


router = APIRouter()


@router.get("/analyze", dependencies=[Depends(JWTBearer())])
async def get_projects():
    """Get all projects by user id."""
    create_network("Test Network")
    return {"message": "Analysis complete."}
