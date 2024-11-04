from typing import Optional
from pydantic import BaseModel, EmailStr


class ProjectModel(BaseModel):
    """Project model."""

    name: str
