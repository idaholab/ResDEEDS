from flask_sqlalchemy import SQLAlchemy

MAX_NAME_LENGTH = 80
MAX_DIR_LENGTH = 80
MAX_OTHER_LENGTH = 20

db = SQLAlchemy()

class Templatable():
    is_template = db.Column(db.Boolean, default=False)

    @classmethod
    def templates(cls):
        return cls.query.filter_by(is_template=True)

class BackendBase():
    obj_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(MAX_NAME_LENGTH), nullable=False)

    @classmethod
    def get_by_name(cls, name):
        return cls.query.filter_by(name=name).first()

    @classmethod
    def get_by_id(cls, obj_id):
        return cls.query.filter_by(obj_id=obj_id).first()