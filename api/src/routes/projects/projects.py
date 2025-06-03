from fastapi import APIRouter, Depends, HTTPException, status

from src.bll.auth import JWTBearer, decode_jwt
from src.models.payload.project_models import ProjectModel
from src.database.collection import case_document, project_document


router = APIRouter()


@router.get("/", dependencies=[Depends(JWTBearer())])
async def get_projects(token: str = Depends(JWTBearer())):
    """Get all projects by user id."""
    token_data = decode_jwt(token)
    return project_document().all({"user_ids": token_data["user_id"]})


@router.post("/project/create/", dependencies=[Depends(JWTBearer())])
async def create_project(project: ProjectModel, token: str = Depends(JWTBearer())):
    """Create a new project."""

    payload = project.model_dump()
    token_data = decode_jwt(token)
    payload["user_ids"] = [token_data["user_id"]]
    project_id = project_document().create(payload)

    # Create the default Base Case
    case_document().create(
        {
            "project_id": project_id,
            "name": "Base Case",
            "diagram_data": '<mxGraphModel dx="1155" dy="686" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="4" value="Bus" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="360" y="240" width="120" height="60" as="geometry"/></mxCell></root></mxGraphModel>',
        }
    )

    return project_id


@router.post("/project/{project_id}/copy/", dependencies=[Depends(JWTBearer())])
async def copy_project(
    project_id: str, project: ProjectModel, token: str = Depends(JWTBearer())
):
    """Create a new project from an existing project."""

    payload = project.model_dump()
    token_data = decode_jwt(token)
    payload["user_ids"] = [token_data["user_id"]]
    new_project_id = project_document().create(payload)
    case_documents = case_document().all({"project_id": project_id})

    # Generate all cases from the existing project
    for case in case_documents:
        case_document().create(
            {
                "project_id": new_project_id,
                "name": case["name"],
                "diagram_data": case["diagram_data"],
            }
        )

    return new_project_id


@router.get("/project/{project_id}/", dependencies=[Depends(JWTBearer())])
async def get_project(project_id: str, token: str = Depends(JWTBearer())):
    """Get a project."""
    token_data = decode_jwt(token)
    project_data = project_document().get(document_id=project_id)
    if not project_data or token_data["user_id"] not in project_data["user_ids"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource",
        )
    return project_data


@router.put("/project/{project_id}/update/", dependencies=[Depends(JWTBearer())])
async def update_project(
    project_id: str, project: ProjectModel, token: str = Depends(JWTBearer())
):
    """Update a project."""
    token_data = decode_jwt(token)
    project_data = project_document().get(document_id=project_id)
    if not project_data or token_data["user_id"] not in project_data["user_ids"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource",
        )
    payload = project.model_dump()
    return project_document().update(query={"_id": project_id}, data=payload)


@router.delete("/project/{project_id}/delete/", dependencies=[Depends(JWTBearer())])
async def delete_project(project_id: str, token: str = Depends(JWTBearer())):
    """Delete a project."""
    token_data = decode_jwt(token)
    project_data = project_document().get(document_id=project_id)
    if not project_data or token_data["user_id"] not in project_data["user_ids"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource",
        )

    # Delete all cases associated with the project
    cases = case_document().all({"project_id": project_id})
    for case in cases:
        case_document().delete(document_id=case["_id"])

    return project_document().delete(document_id=project_id)
