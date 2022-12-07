from typing import List
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from backend import MAX_NAME_LENGTH, MAX_OTHER_LENGTH, Base, DBSession, Templatable
from backend.link import Link
from backend.impact import Impact

# class HazardType(Enum):
#     RANSOMWARE = 'ransomware'
#     DENIAL_OF_SERVICE = 'denial of service'
#     OTHER = 'other'

# class HazardPrimaryCategory(Enum):
#     CYBER_HAZARD = 'cyber hazard'
#     PHYSICAL_HAZARD = 'physical hazard'

# class HazardSecondaryCategory(Enum):
#     CYBERATTACK = 'cyberattack'
#     UNINTENTIONAL = 'unintentional'

# class Hazard(Base, Templatable):
#     hazard_type = Column(String(MAX_NAME_LENGTH), nullable=False)
#     #hazard_type = db.Column(db.Enum(HazardType), nullable=False)
#     #hazard_type_other = db.Column(db.String(MAX_OTHER_LENGTH), nullable=True)
#     #primary_category = db.Column(db.Enum(HazardPrimaryCategory), nullable=True)
#     #secondary_category = db.Column(db.Enum(HazardSecondaryCategory), nullable=True)
#     primary_category = Column(String(MAX_OTHER_LENGTH), nullable=True)
#     secondary_category = Column(String(MAX_OTHER_LENGTH), nullable=True)
#     impacts = relationship('Impact', order_by=Impact.impact_type, back_populates='hazard')
#     project_id = Column(Integer, ForeignKey('project.id'), nullable=True)
#     project = relationship('Project', back_populates='hazards')

#     @classmethod
#     def get_all_for_category(cls, session: DBSession, cat: str) -> List['Hazard']:
#         hazards = session.query(cls).filter_by(primary_category=cat).all()
#         hazards.extend(session.query(cls).filter_by(secondary_category=cat).all())
#         return hazards

#     @classmethod
#     def clone(cls, h) -> 'Hazard':
#         impacts = [Impact.clone(i) for i in h.impacts]
#         return Hazard(
#                 hazard_type=h.hazard_type,
#                 primary_category=h.primary_category,
#                 secondary_category=h.secondary_category,
#                 impacts=impacts)

# class HazardToHazardLink(Link):
#     link_id = Column(Integer, ForeignKey('link.id'), primary_key=True)
#     #this_type = db.Column(db.Enum(HazardType))
#     #that_type = db.Column(db.Enum(HazardType))

# class HazardToImpactLink(Link):
#     link_id = Column(Integer, ForeignKey('link.id'), primary_key=True)
#     #this_type = db.Column(db.Enum(HazardType))
#     #that_type = db.Column(db.Enum(ImpactType))
