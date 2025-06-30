from fastapi import APIRouter, Depends, HTTPException, status

import xml.etree.ElementTree as ET

from src.bll.auth import JWTBearer, decode_jwt
from src.database.collection import case_document, project_document
from src.models.payload.case_models import CaseModel


router = APIRouter()


@router.get("/project/{project_id}/cases/", dependencies=[Depends(JWTBearer())])
async def get_project_cases(project_id: str, token: str = Depends(JWTBearer())):
    """Get project cases."""
    token_data = decode_jwt(token)
    project_data = project_document().get(document_id=project_id)
    if not project_data or token_data["user_id"] not in project_data["user_ids"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource",
        )

    return case_document().all({"project_id": project_id})


@router.get(
    "/project/{project_id}/case/{case_id}/", dependencies=[Depends(JWTBearer())]
)
async def get_project_case(
    project_id: str, case_id: str, token: str = Depends(JWTBearer())
):
    """Get project case."""
    token_data = decode_jwt(token)
    project_data = project_document().get(document_id=project_id)
    if not project_data or token_data["user_id"] not in project_data["user_ids"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource",
        )

    return case_document().get(document_id=case_id)


@router.post("/project/{project_id}/case/create/", dependencies=[Depends(JWTBearer())])
async def create_project_case(project_id: str, case: CaseModel):
    """Create a project case."""
    payload = case.model_dump()
    payload["project_id"] = project_id
    return case_document().create(payload)


@router.put(
    "/project/{project_id}/case/{case_id}/update/", dependencies=[Depends(JWTBearer())]
)
async def update_project_case(project_id: str, case_id: str, case: CaseModel):
    """Update a project case."""
    payload = case.model_dump()

    # Grab only the mxGraphModel from the diagram_data
    root = ET.fromstring(case.diagram_data)
    mxgraphmodel = root.find(".//mxGraphModel")
    if not mxgraphmodel:
        return HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid diagram data format",
        )

    payload["diagram_data"] = ET.tostring(mxgraphmodel, encoding="unicode")

    return case_document().update(query={"_id": case_id}, data=payload)


@router.delete(
    "/project/{project_id}/case/{case_id}/delete/", dependencies=[Depends(JWTBearer())]
)
async def delete_project_case(project_id: str, case_id: str):
    """Delete a project case."""
    return case_document().delete(document_id=case_id)
