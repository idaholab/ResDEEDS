from src.database.document import Document


class User(Document):
    """User class for storing user data in the database."""

    def __init__(self):
        super().__init__("users")
