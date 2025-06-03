from src.database.document import Document
from src.models.database.user_models import UserModel
from src.models.database.project_models import ProjectModel
from src.models.database.case_models import CaseModel


def project_document() -> Document:
    """Get project document."""
    return Document(collection="projects", model=ProjectModel, unique_field="name")


def case_document() -> Document:
    """Get case document."""
    return Document(collection="cases", model=CaseModel)


def user_document() -> Document:
    """Get user document."""
    return Document(collection="users", model=UserModel, unique_field="email")
