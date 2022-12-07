import csv

from sqlalchemy import Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from backend import MAX_NAME_LENGTH, Base, Templatable




# class ImpactType(Enum):
#     POWER_LINES = 'power lines'
#     SUBSTATIONS = 'substations'
#     OTHER = 'other'

IMPACT_TYPES = []

with open("config/impacts.csv", "r", encoding="utf-8-sig") as csvfile:
    header_line = csvfile.readline()
    reader = csv.reader(csvfile, delimiter=',', skipinitialspace=True)
    NAME = 0
    METRICS = 1
    for row in reader:
        name = row[NAME]
        if name != '' and name not in IMPACT_TYPES:
            IMPACT_TYPES.append(name)

class Impact(Base, Templatable):
    
    impact_type = Column(String(MAX_NAME_LENGTH), nullable=False)
    #type_other = db.Column(db.String(MAX_OTHER_LENGTH), nullable=True)
    severity = Column(Numeric(precision=5, scale=4), nullable=False)
    hazard_id = Column(Integer, ForeignKey('hazard.id'), nullable=False)
    hazard = relationship('Hazard', back_populates='impacts')

    @classmethod
    def clone(cls, i: 'Impact') -> 'Impact':
        return Impact(
                name=i.name,
                impact_type=i.impact_type,
                severity=i.severity)
