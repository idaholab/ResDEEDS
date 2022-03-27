from backend import *

class Project(db.Model, BackendBase):
    user = db.Column(db.String(MAX_NAME_LENGTH), nullable=False)
    system = db.relationship('System', uselist=False, backref='project', lazy=True)
    goals = db.relationship('Goal', backref='project', lazy=True)
    metrics = db.relationship('Metric', backref='project', lazy=True)
    hazards = db.relationship('Hazard', backref='project', lazy=True)

    @classmethod
    def get_all_for_user(cls, user):
        return cls.query.filter_by(user=user).all()

class Goal(db.Model, BackendBase):
    project_id = db.Column(db.Integer, db.ForeignKey('project.obj_id'), nullable=False)
    #metrics = db.relationship('Metric', backref='goal', lazy=True)

class Metric(db.Model, BackendBase):
    project_id = db.Column(db.Integer, db.ForeignKey('project.obj_id'), nullable=False)