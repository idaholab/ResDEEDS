from abc import ABC, abstractmethod
from enum import Enum
from backend import *
from enum import Enum


class ImpactType(Enum):
    POWER_LINES = 'Power lines'
    SUBSTATIONS = 'Substations'
    OTHER = 'Other'

class Impact(db.Model, Templatable):
    impact_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(MAX_NAME_LENGTH), nullable=False)
    type = db.Column(db.Enum(ImpactType), nullable=False)
    type_other = db.Column(db.String(MAX_OTHER_LENGTH), nullable=True)
    severity = db.Column(db.Numeric(precision=5, scale=4), nullable=False)
    hazard_id = db.Column(db.Integer, db.ForeignKey('hazard.hazard_id'), nullable=False)
