import csv
from abc import ABC, abstractmethod
from enum import Enum
from backend import *
from enum import Enum




# class ImpactType(Enum):
#     POWER_LINES = 'power lines'
#     SUBSTATIONS = 'substations'
#     OTHER = 'other'

class Impact(db.Model, Templatable):
    obj_id = db.Column(db.Integer, primary_key=True)
    impact_type = db.Column(db.String(MAX_NAME_LENGTH), nullable=False)
    #type_other = db.Column(db.String(MAX_OTHER_LENGTH), nullable=True)
    severity = db.Column(db.Numeric(precision=5, scale=4), nullable=False)
    hazard_id = db.Column(db.Integer, db.ForeignKey('hazard.obj_id'), nullable=False)

    TYPES = []

    with open("config/impacts.csv", "r", encoding="utf-8-sig") as csvfile:
        header_line = csvfile.readline()
        reader = csv.reader(csvfile, delimiter=',', skipinitialspace=True)
        NAME = 0
        METRICS = 1
        for row in reader:
            name = row[NAME]
            if name != '' and name not in TYPES:
                TYPES.append(name)

    @classmethod
    def clone(cls, i):
        return Impact(
                name=i.name,
                impact_type=i.impact_type,
                severity=i.severity)
