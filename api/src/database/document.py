from bson import json_util
import json
import os
from datetime import datetime, timezone
from typing import Optional, Type

from pydantic import BaseModel
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection


def get_db() -> Database:
    """Get database client."""
    return MongoClient(f"mongodb://{os.environ["MONGO_URI"]}", tz_aware=True).resdeeds


class Document:
    """Document class for storing document data in the database."""

    def __init__(self, collection: str, model: Type[BaseModel], unique_field: str = ""):
        self.collection: Collection = getattr(get_db(), collection)
        self.model = model
        self.unique_field = unique_field

    def all(self) -> list[dict]:
        """Get all documents."""
        data = self._return_json(list(self.collection.find()))
        return data if isinstance(data, list) else []

    def get(self, query: dict) -> Optional[dict]:
        """Get a document."""
        data = self._return_json(self.collection.find_one(query))
        return data if isinstance(data, dict) else {}

    def create(self, data: dict) -> str:
        """Create a new document."""
        self._create_unique_index()
        return str(self.collection.insert_one(self._validate_data(data)).inserted_id)

    def update(self, query: dict, data: dict) -> Optional[dict]:
        """Update a document."""
        data["updated_at"] = datetime.now(timezone.utc)
        ret_data = self._return_json(
            self.collection.find_one_and_update(query, {"$set": data})
        )
        return ret_data if isinstance(ret_data, dict) else {}

    def delete(self, query: dict) -> None:
        """Delete a document."""
        self.collection.delete_one(query)

    def _create_unique_index(self):
        """Create a unique index."""
        if self.unique_field:
            self.collection.create_index(self.unique_field, unique=True)

    def _return_json(self, data: Optional[dict | list]) -> Optional[dict | list]:
        """Return JSON data."""
        if not data:
            return None
        return json.loads(json_util.dumps(data))

    def _validate_data(self, data: dict) -> dict:
        """Validate data."""
        return self.model(**data).model_dump(by_alias=True)
