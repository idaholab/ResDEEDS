from typing import Optional
from pydantic import BaseModel, EmailStr


class UserModel(BaseModel):
    """User model."""

    email: EmailStr
    password: str


class UserUpdateModel(BaseModel):
    """User model."""

    email: Optional[EmailStr] = None
    password: Optional[str] = None


class UserDeleteModel(BaseModel):
    """User delete model."""

    email: EmailStr
