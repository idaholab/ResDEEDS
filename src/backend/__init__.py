from flask_sqlalchemy import SQLAlchemy

MAX_NAME_LENGTH = 50
MAX_DIR_LENGTH = 80
MAX_OTHER_LENGTH = 20

db = SQLAlchemy()

class Templatable():
    is_template = db.Column(db.Boolean, default=False)

    @classmethod
    def templates(cls):
        return cls.query.filter_by(is_template=True)