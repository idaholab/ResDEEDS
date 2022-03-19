from abc import abstractmethod
from enum import Enum
from backend import *


class System(db.Model, BackendBase):
    user = db.Column(db.String(MAX_NAME_LENGTH), nullable=False)

    @classmethod
    def get_all_for_user(cls, user):
        return cls.query.filter_by(user=user).all()

    @abstractmethod
    def apply_impact(self, impact):
        ...

class SpineSystem(System):
    spine_dir = db.Column(db.String(MAX_DIR_LENGTH))

    def apply_impact(self, impact):
        pass

# class TransmissionLine(Document):
#     name = StringField(max_length=MAX_NAME_LENGTH)
#     km = IntField(min_value=0)
#     kv = FloatField(min_value=0)

# class LoadType(Enum):
#     RESIDENTIAL = 'residential'
#     COMMERCIAL = 'commercial'
#     OTHER = 'other'

class Load(db.Model, BackendBase):
    load_type = db.Column(db.String(MAX_NAME_LENGTH), nullable=True)
    min_kw = db.Column(db.Float, nullable=False)
    max_kw = db.Column(db.Float, nullable=False)
    avg_kw = db.Column(db.Float, nullable=False)
    
    system_id = db.Column(db.Integer, db.ForeignKey('system.obj_id'), nullable=False)

# class GeneratorType(Enum):
#     GAS = 'gas'
#     COAL = 'coal'
#     DIESEL = 'diesel'
#     WIND = 'wind'
#     SOLAR_PV = 'PV solar'
#     SOLAR_CSP = 'CSP solar'
#     HYDRO = 'hydro'
#     OTHER = 'other'

class Generation(db.Model, BackendBase):
    generation_type = db.Column(db.String(MAX_NAME_LENGTH), nullable=True)
    capacity_kw = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(MAX_NAME_LENGTH), nullable=True)

    system_id = db.Column(db.Integer, db.ForeignKey('system.obj_id'), nullable=False)

class ConnectedSystem(db.Model, BackendBase):
    system_id = db.Column(db.Integer, db.ForeignKey('system.obj_id'), nullable=True)

class Communications(db.Model, BackendBase):
    system_id = db.Column(db.Integer, db.ForeignKey('system.obj_id'), nullable=True)

class DefaultSystem(System):

    generation = db.relationship('Generation', backref='system', lazy=True)
    load = db.relationship('Load', backref='system', lazy=True)
    connected_systems = db.relationship('ConnectedSystem', backref='system', lazy=True)
    communications = db.relationship('Communications', backref='system', lazy=True)

    market_generation_capital_cost = db.Column(db.Numeric(scale=2), nullable=True)
    market_avg_cost_per_kw = db.Column(db.Numeric(scale=2), nullable=True)
    market_avg_maintenance_cost = db.Column(db.Numeric(scale=2), nullable=True)
    market_avg_consumer_rate_winter = db.Column(db.Numeric(scale=2), nullable=True)
    market_avg_consumer_rate_summer = db.Column(db.Numeric(scale=2), nullable=True)

    def apply_impact(self, impact):
        type = impact.type

        if type is ImpactType.POWER_LINES:
            pass

        elif type is ImpactType.SUBSTATIONS:
            pass

        # Save self? Return a copy?
