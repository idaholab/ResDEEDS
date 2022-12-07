


from typing import List
from sqlalchemy import Column, String

from backend import MAX_NAME_LENGTH, Base, DBSession


class Link(Base):
    this_type = Column(String(MAX_NAME_LENGTH), nullable=False)
    that_type = Column(String(MAX_NAME_LENGTH), nullable=False)

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
    def all_for_type(cls, session: DBSession, type: str) -> List[str]:
        return [l.that_type for l in session.query(cls).filter_by(this_type=type)]