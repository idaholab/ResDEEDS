from pydantic import BaseModel


class UserModel(BaseModel):
    """User model."""

    email: str
    password: str
