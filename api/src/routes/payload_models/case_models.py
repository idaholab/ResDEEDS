from typing import Any
from pydantic import BaseModel


class CaseModel(BaseModel):
    """Case model."""

    name: str
    diagram_data: str
