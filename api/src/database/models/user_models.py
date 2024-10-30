from pydantic import EmailStr

from api.src.database.models import BaseDBModel


class UserModel(BaseDBModel):
    """User model."""

    email: EmailStr
    password: str
