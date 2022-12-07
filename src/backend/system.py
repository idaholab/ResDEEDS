from abc import abstractmethod

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from backend import MAX_DIR_LENGTH, MAX_NAME_LENGTH, Base


class System(Base):
    #name = Column(String(MAX_NAME_LENGTH), nullable=False)
    #project_id = Column(Integer, ForeignKey('project.id'), nullable=False)
    #project = relationship('Project', back_populates='system')

    #objects = relationship('SystemSpineObject', back_populates='system', cascade='delete')
    #metrics = relationship('Metric', back_populates='system', cascade='delete')
    pass
