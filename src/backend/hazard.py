from enum import Enum
from backend import *
from backend.impact import ImpactType
from backend.link import Link

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

class Hazard(db.Model, Templatable):
    hazard_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(MAX_NAME_LENGTH), nullable=False)
    type = db.Column(db.Enum(HazardType), nullable=False)
    type_other = db.Column(db.String(MAX_OTHER_LENGTH), nullable=True)
    primary_category = db.Column(db.Enum(HazardPrimaryCategory), nullable=True)
    secondary_category = db.Column(db.Enum(HazardSecondaryCategory), nullable=True)
    impacts = db.relationship('Impact', backref='hazard', lazy=True)

class HazardToHazardLink(db.Model, Link):
    this_type = db.Column(db.Enum(HazardType))
    that_type = db.Column(db.Enum(HazardType))

class HazardToImpactLink(db.Model, Link):
    this_type = db.Column(db.Enum(HazardType))
    that_type = db.Column(db.Enum(ImpactType))
