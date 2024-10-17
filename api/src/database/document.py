import os

from pydantic import BaseModel
from pymongo import MongoClient
from pymongo.database import Database


def get_db() -> Database:
    """Get database client."""
    return MongoClient(f"mongodb:://{os.environ["MONGO_URI"]}", tz_aware=True).resdeeds


class Document:
    """Document class for storing document data in the database."""

    def __init__(self, collection: str, model: BaseModel):
        self.collection = getattr(get_db(), collection)
        self.model = model
    
    def create(self, data: dict) -> dict:
        """Create a new document."""
        return self.collection.insert_one(self.model(**data)).inserted_id
    
