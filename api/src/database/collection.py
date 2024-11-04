from src.database.document import Document
from src.database.models.user_models import UserModel
from src.database.models.project_models import ProjectModel


def project_document() -> Document:
    """Get project document."""
    return Document(collection="projects", model=ProjectModel, unique_field="name")


def user_document() -> Document:
    """Get user document."""
    return Document(collection="users", model=UserModel, unique_field="email")
