from src.database.document import Document
from src.database.models import UserModel


class User(Document):
    """User class for storing user data in the database."""

    def __init__(self):
        super().__init__(collection="users", model=UserModel)
