from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserModel(BaseModel):
    """User model."""

    email: EmailStr
    password: str
    created_at: datetime = datetime.now()
    updated_at: datetime
