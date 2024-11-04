from src.database.models import BaseDBModel


class ProjectModel(BaseDBModel):
    """Project Model."""

    name: str
    user_ids: list[str]
