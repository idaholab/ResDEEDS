from abc import abstractmethod
from backend import *


class Link():
    link_id = db.Column(db.Integer, primary_key=True)
    this_type = db.Column(db.String(MAX_NAME_LENGTH), nullable=False)
    that_type = db.Column(db.String(MAX_NAME_LENGTH), nullable=False)

    # @property
    # @classmethod
    # @abstractmethod
    # def this_type(cls):
    #     ...

    # @property
    # @classmethod
    # @abstractmethod
    # def that_type(cls):
    #     ...

    @classmethod
    def all_for_type(cls, type):
        return [l.that_type for l in cls.query.filter_by(this_type=type)]