import os

from pymongo import MongoClient
from pymongo.database import Database


def get_db() -> Database:
    """Get database client."""
    return MongoClient(os.environ["MONGO_URI"], tz_aware=True).resdeeds


class Document:
    """Document class for storing document data in the database."""

    def __init__(self, collection: str):
        self.collection = getattr(get_db(), collection)
