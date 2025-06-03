from datetime import datetime, timezone

from pydantic import BaseModel


class BaseDBModel(BaseModel):
    """User model."""

    created_at: datetime = datetime.now(timezone.utc)
    updated_at: datetime = datetime.now(timezone.utc)
