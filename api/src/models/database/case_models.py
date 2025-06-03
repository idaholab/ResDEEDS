from src.models.database import BaseDBModel


class CaseModel(BaseDBModel):
    """Case Model."""

    name: str
    project_id: str
    diagram_data: str
