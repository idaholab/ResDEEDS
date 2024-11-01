from pydantic import EmailStr

from src.database.models import BaseDBModel


class UserModel(BaseDBModel):
    """User model."""

    email: EmailStr
    is_admin: bool = False
    password: str
