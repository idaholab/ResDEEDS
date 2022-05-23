from enum import Enum
from backend import *
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

class Hazard(db.Model, BackendBase, Templatable):
    hazard_type = db.Column(db.String(MAX_NAME_LENGTH), nullable=False)
    #hazard_type = db.Column(db.Enum(HazardType), nullable=False)
    #hazard_type_other = db.Column(db.String(MAX_OTHER_LENGTH), nullable=True)
    #primary_category = db.Column(db.Enum(HazardPrimaryCategory), nullable=True)
    #secondary_category = db.Column(db.Enum(HazardSecondaryCategory), nullable=True)
    primary_category = db.Column(db.String(MAX_OTHER_LENGTH), nullable=True)
    secondary_category = db.Column(db.String(MAX_OTHER_LENGTH), nullable=True)
    impacts = db.relationship('Impact', backref='hazard', lazy=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.obj_id'), nullable=True)

    @classmethod
    def get_all_for_category(cls, cat):
        hazards = cls.query.filter_by(primary_category=cat).all()
        hazards.extend(cls.query.filter_by(secondary_category=cat).all())
        return hazards

    @classmethod
    def clone(cls, h):
        impacts = [Impact.clone(i) for i in h.impacts]
        return Hazard(
                name=h.name,
                hazard_type=h.hazard_type,
                primary_category=h.primary_category,
                secondary_category=h.secondary_category,
                impacts=impacts)

class HazardToHazardLink(db.Model, Link):
    pass
    #this_type = db.Column(db.Enum(HazardType))
    #that_type = db.Column(db.Enum(HazardType))

class HazardToImpactLink(db.Model, Link):
    pass
    #this_type = db.Column(db.Enum(HazardType))
    #that_type = db.Column(db.Enum(ImpactType))
