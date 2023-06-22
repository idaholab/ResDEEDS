# Copyright 2023, Battelle Energy Alliance, LLC
import json
from typing import Dict, List, Type
from sqlalchemy import Boolean, Column, Integer, String, JSON, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base, declared_attr
from sqlalchemy.orm import sessionmaker, relationship
from config import config
import logging

MAX_NAME_LENGTH = 80
MAX_DIR_LENGTH = 80
MAX_OTHER_LENGTH = 20

dbc = config["database"]
if dbc["dialect"] == 'sqlite':
    db_uri = f'sqlite:///{dbc["db_name"]}.db'
elif dbc["dialect"] == 'mysql':
    db_uri = f'mysql://{dbc["db_user"]}:{dbc["db_pass"]}@{dbc["db_host"]}/{dbc["db_name"]}'
else:
    logging.error(f'DB dialect {dbc["dialect"]} unsupported.')
    exit(1)
engine = create_engine(db_uri, echo=False)
DBSession = sessionmaker(bind=engine)

class Templatable:
    is_template = Column(Boolean, default=False)

    @classmethod
    def templates(cls, session: DBSession) -> List['Templatable']:
        return session.query(cls).filter_by(is_template=True)

class Base:
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()

    __table_args__ = {'mysql_engine': 'InnoDB'}

    id = Column(Integer, primary_key=True)

    # @classmethod
    # def get_by_name(cls, session: DBSession, obj_name: str) -> 'Base':
    #     return session.query(cls).filter_by(name=obj_name).first()

    @classmethod
    def get_by_id(cls, session: DBSession, obj_id: int) -> 'Base':
        return session.query(cls).filter_by(id=obj_id).one_or_none()

    def delete(self, session: DBSession):
        session.delete(self)

Base = declarative_base(cls=Base)

if not engine.dialect.has_table(engine, 'project'):
    #from backend.hazard import Hazard, HazardToHazardLink, HazardToImpactLink
    #from backend.impact import Impact, IMPACT_TYPES
    from backend.project import Goal, Metric, Project, Hazard
    logging.info('Table project not found, creating tables.')
    #Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    #DBSession().commit()
else:
    logging.info('Tables already exist.')

if config["database"]["drop_and_recreate"]:
    #from backend.hazard import Hazard, HazardToHazardLink, HazardToImpactLink
    #from backend.impact import Impact, IMPACT_TYPES
    from backend.project import Goal, Metric, Hazard, Project

    #meta = MetaData(bind=engine)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # s = DBSession()

    # with open("config/hazards.csv", "r", encoding="utf-8-sig") as csvfile:
    #     header_line = csvfile.readline()
    #     reader = csv.reader(csvfile, delimiter=',', skipinitialspace=True)
    #     NAME = 0
    #     PRIMARY_CAT = 1
    #     SECONDARY_CAT = 2
    #     ASSOC_HAZARDS = 3
    #     IMPACTS = 4
    #     METRICS = 5
    #     for row in reader:
    #         logging.info(row)
    #         name = row[NAME]
    #         primary_cat = row[PRIMARY_CAT]
    #         secondary_cat = row[SECONDARY_CAT]
    #         impacts = row[IMPACTS].split(';')
    #         new_impacts = []
    #         for impact in [i.lstrip() for i in impacts if i != '']:
    #             if impact not in IMPACT_TYPES:
    #                 logging.warning('Impact type %s not found while loading templates.', impact)
    #             new_impact = Impact(is_template=True, impact_type=impact, severity=0.5)
    #             logging.info(new_impact)
    #             # logging.info(Impact.get_by_name(impact))
    #             # if Impact.get_by_name(impact) is not None:
    #             #     try:
    #             #         type = ImpactType(impact)
    #             #         new_impact = Impact(name=impact, type=ImpactType(impact), severity=0.5)
    #             #     except ValueError as e:
    #             #         new_impact = Impact(name=impact, type=ImpactType.OTHER, type_other=impact, severity=0.5)
    #             s.add(new_impact)
    #             new_impacts.append(new_impact)

    #             link = HazardToImpactLink(this_type=name, that_type=impact)
    #             s.add(link)

    #         hazard = Hazard(is_template=True, hazard_type=name, impacts=new_impacts, primary_category=primary_cat, secondary_category=secondary_cat)
    #         s.add(hazard)

    #         assoc_hazards = row[ASSOC_HAZARDS].split(';')
    #         for assoc_hazard in [h.lstrip() for h in assoc_hazards if h != '']:
    #             link = HazardToHazardLink(this_type=name, that_type=assoc_hazard)
    #             s.add(link)

    # # impact = Impact(name='Test impact', type=ImpactType.SUBSTATIONS, severity=0.75)
    # # db.session.add(impact)
    # # hazard = Hazard(is_template=True, name='Test template hazard', type=HazardType.RANSOMWARE, impacts=[impact])
    # # db.session.add(hazard)
    # # link = HazardToHazardLink(this_type=HazardType.RANSOMWARE, that_type=HazardType.DENIAL_OF_SERVICE)
    # # db.session.add(link)
    # # link = HazardToImpactLink(this_type=HazardType.RANSOMWARE, that_type=ImpactType.SUBSTATIONS)
    # # db.session.add(link)

    # s.commit()

