from datetime import datetime

from pydantic import BaseModel


class BaseDBModel(BaseModel):
    """User model."""

    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
