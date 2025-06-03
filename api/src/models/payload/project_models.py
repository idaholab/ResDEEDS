from pydantic import BaseModel


class ProjectModel(BaseModel):
    """Project model."""

    name: str
