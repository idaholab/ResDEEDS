import os
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional, Type

from pydantic import BaseModel
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection


def get_db() -> Database:
    """Get database client."""
    print("--------------------------------------------")
    print(os.environ["MONGO_URI"])
    print("--------------------------------------------")
    return MongoClient(f"mongodb://{os.environ["MONGO_URI"]}", tz_aware=True).resdeeds


class Document:
    """Document class for storing document data in the database."""

    def __init__(self, collection: str, model: Type[BaseModel], unique_field: str = ""):
        self.collection: Collection = getattr(get_db(), collection)
        self.model = model
        self.unique_field = unique_field

    def all(self, query: dict = {}) -> list[dict]:
        """Get all documents."""
        data = self._return_json(list(self.collection.find(query)))
        return data if isinstance(data, list) else []

    def get(self, document_id: str = "", query: dict = {}) -> Optional[dict]:
        """Get a document."""
        if document_id:
            query["_id"] = ObjectId(document_id)
        data = self._return_json(self.collection.find_one(query))
        return data if isinstance(data, dict) else {}

    def create(self, data: dict) -> str:
        """Create a new document."""
        self._create_unique_index()
        return str(self.collection.insert_one(self._validate_data(data)).inserted_id)

    def update(self, query: dict, data: dict) -> Optional[dict]:
        """Update a document."""
        if "_id" in query and isinstance(query["_id"], str):
            query["_id"] = ObjectId(query["_id"])

        data["updated_at"] = datetime.now(timezone.utc)
        ret_data = self._return_json(
            self.collection.find_one_and_update(query, {"$set": data})
        )

        return ret_data if isinstance(ret_data, dict) else {}

    def delete(self, document_id="", query: dict = {}) -> None:
        """Delete a document."""
        if document_id:
            query["_id"] = ObjectId(document_id)
        self.collection.delete_one(query)

    def _create_unique_index(self):
        """Create a unique index."""
        if self.unique_field:
            self.collection.create_index(self.unique_field, unique=True)

    def _return_json(self, data: Optional[dict | list]) -> Optional[dict | list]:
        """Return JSON data."""
        if not data:
            return None
        if isinstance(data, dict) and "_id" in data:
            data["_id"] = str(data["_id"])
        if isinstance(data, list):
            for item in data:
                if "_id" in item:
                    item["_id"] = str(item["_id"])
        return data

    def _validate_data(self, data: dict) -> dict:
        """Validate data."""
        return self.model(**data).model_dump(by_alias=True)
