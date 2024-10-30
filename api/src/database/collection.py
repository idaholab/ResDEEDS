from src.database.document import Document
from src.database.models.user_models import UserModel


def user_document() -> Document:
    """Get user document."""
    return Document(collection="users", model=UserModel, unique_field="email")
