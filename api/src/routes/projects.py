from fastapi import APIRouter, Depends, HTTPException, status

from src.bll.auth import JWTBearer, decode_jwt
from src.routes.payload_models.project_models import ProjectModel
from src.database.collection import project_document


router = APIRouter()


@router.get("/", dependencies=[Depends(JWTBearer())])
async def get_projects(token: str = Depends(JWTBearer())):
    return project_document().all()


@router.post("/project/create/", dependencies=[Depends(JWTBearer())])
async def register_user(project: ProjectModel, token: str = Depends(JWTBearer())):
    """Register a new user."""

    payload = project.model_dump()
    token_data = decode_jwt(token)
    payload["user_ids"] = [token_data["user_id"]]
    return project_document().create(payload)


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
    return project_document().delete(document_id=project_id)
