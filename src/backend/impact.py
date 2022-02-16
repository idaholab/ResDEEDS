from abc import ABC, abstractmethod
from enum import Enum
from mongoengine import *
from backend import MAX_NAME_LENGTH
from enum import Enum

MAX_SEVERITY = 10

class ImpactType(Enum):
    POWER_LINES = 'Power lines'
    SUBSTATIONS = 'Substations'

class Impact(Document):
    type = EnumField(ImpactType)
    severity = IntField(min_value=0, max_value=MAX_SEVERITY)

    @abstractmethod
    def apply(self, system):
        ...

    meta = {'allow_inheritance': True}

# class PowerLinesImpact(Impact):

#     def apply(self, system):
#         # Degrade power lines of the system
#         pass
