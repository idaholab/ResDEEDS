# Copyright 2023, Battelle Energy Alliance, LLC
import logging
from sqlalchemy import Column, Integer, create_engine
from sqlalchemy.ext.declarative import declarative_base, declared_attr
from sqlalchemy.orm import sessionmaker

from config import config

MAX_NAME_LENGTH = 80
MAX_DIR_LENGTH = 80
MAX_OTHER_LENGTH = 20

dbc = config["database"]
if dbc["dialect"] == 'sqlite':
    db_uri = f'sqlite:///{dbc["db_name"]}.db'
elif dbc["dialect"] == 'mysql':
    db_uri = f'mysql://{dbc["db_user"]}:{dbc["db_pass"]}@{dbc["db_host"]}/{dbc["db_name"]}'
else:
    logging.error('DB dialect %s unsupported.', dbc["dialect"])
    exit(1)
engine = create_engine(db_uri, echo=False)
DBSession = sessionmaker(bind=engine)

class Base:
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()

    __table_args__ = {'mysql_engine': 'InnoDB'}

    id = Column(Integer, primary_key=True)

    @classmethod
    def get_by_id(cls, session: DBSession, obj_id: int) -> 'Base':
        return session.query(cls).filter_by(id=obj_id).one_or_none()

    def delete(self, session: DBSession):
        session.delete(self)

Base = declarative_base(cls=Base)

if not engine.dialect.has_table(engine, 'project'):
    # These imports are required to make SQLAlchemy aware of what tables are needed
    from backend.project import Goal, Metric, Project, Hazard
    logging.info('Table project not found, creating tables.')
    Base.metadata.create_all(bind=engine)
else:
    logging.info('Tables already exist.')

if config["database"]["drop_and_recreate"]:
    # These imports are required to make SQLAlchemy aware of what tables are needed
    from backend.project import Goal, Metric, Hazard, Project

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
