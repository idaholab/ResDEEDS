from typing import Literal
from pydantic import EmailStr

from src.models.database import BaseDBModel


class UserModel(BaseDBModel):
    """User model."""

    email: EmailStr
    password: bytes
    role: Literal["user", "admin"] = "user"
