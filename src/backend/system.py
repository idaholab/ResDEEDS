from abc import abstractmethod
from enum import Enum
from mongoengine import *
from backend import MAX_NAME_LENGTH
from backend.impact import ImpactType


class System(Document):
    system_id = IntField(min_value=0)
    name = StringField(max_length=MAX_NAME_LENGTH)

    meta = {'allow_inheritance': True}

    @abstractmethod
    def apply_impact(self, impact):
        ...

class TransmissionLine(Document):
    name = StringField(max_length=MAX_NAME_LENGTH)
    km = IntField(min_value=0)
    kv = FloatField(min_value=0)

class LoadType(Enum):
    RESIDENTIAL = 'residential'
    COMMERCIAL = 'commercial'
    OTHER = 'other'

class Load(Document):
    name = StringField(max_length=MAX_NAME_LENGTH)
    max_kw = FloatField(min_value=0)
    type = EnumField(LoadType)

class GeneratorType(Enum):
    GAS = 'gas'
    COAL = 'coal'
    DIESEL = 'diesel'
    WIND = 'wind'
    SOLAR_PV = 'PV solar'
    SOLAR_CSP = 'CSP solar'
    HYDRO = 'hydro'
    OTHER = 'other'

class Generator(Document):
    name = StringField(max_length=MAX_NAME_LENGTH)
    max_kw = FloatField(min_value=0)
    type = EnumField(GeneratorType)

class DefaultSystem(System):
    transmission_lines = ListField(ReferenceField(TransmissionLine))
    loads = ListField(ReferenceField(Load))
    generators = ListField(ReferenceField(Generator))

    def apply_impact(self, impact):
        type = impact.type

        if type is ImpactType.POWER_LINES:
            pass

        elif type is ImpactType.SUBSTATIONS:
            pass

        # Save self? Return a copy?
