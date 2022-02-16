from enum import Enum
from mongoengine import *
from backend.impact import ImpactType
from backend import MAX_NAME_LENGTH
from backend.template import Template

class HazardType(Enum):
    RANSOMWARE = 'Ransomware'
    DENIAL_OF_SERVICE = 'Denial of service'
    OTHER = 'Other'

class HazardPrimaryCategory(Enum):
    CYBER_HAZARD = 'Cyber hazard'
    PHYSICAL_HAZARD = 'Physical hazard'

class HazardSecondaryCategory(Enum):
    CYBERATTACK = 'Cyberattack'
    UNINTENTIONAL = 'Unintentional'

class Hazard(Template):

    name = StringField(max_length=MAX_NAME_LENGTH)

    associated_hazard_types = ListField(ReferenceField(HazardType))
    associated_impact_types = ListField(ReferenceField(ImpactType))
