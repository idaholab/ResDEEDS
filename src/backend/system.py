from enum import Enum
from mongoengine import *
# from backend.database import 50


class System(Document):
    name = StringField(max_length=50)
    user = StringField(max_length=50)
    meta = {'allow_inheritance': True}

class TransmissionLine(Document):
    name = StringField(max_length=50)
    km = IntField(min_value=0)
    kv = FloatField(min_value=0)

class LoadType(Enum):
    RESIDENTIAL = 'residential'
    COMMERCIAL = 'commercial'
    OTHER = 'other'

class Load(Document):
    name = StringField(max_length=50)
    max_kw = FloatField(min_value=0)
    type = EnumField(LoadType)

class GeneratorType(Enum):
    GAS = 'gas'
    COAL = 'coal'
    DIESEL = 'Diesel Generator'
    WIND = 'Wind'
    SOLAR_PV = 'PV solar'
    SOLAR_CSP = 'CSP solar'
    HYDRO = 'hydro'
    OTHER = 'other'

class Generator(Document):
    name = StringField(max_length=50)
    max_kw = FloatField(min_value=0)
    type = EnumField(GeneratorType)

class DefaultSystem(System):
    transmission_lines = ListField(ReferenceField(TransmissionLine))
    loads = ListField(ReferenceField(Load))
    generators = ListField(ReferenceField(Generator))
