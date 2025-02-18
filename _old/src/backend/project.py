# Copyright 2023, Battelle Energy Alliance, LLC
import datetime
import os
import shutil
import enum
import logging
from typing import List, Tuple
from werkzeug.datastructures import FileStorage
from sqlalchemy import JSON, Column, ForeignKey, Integer, String, Float, Enum
from sqlalchemy.orm import relationship

from backend import Base, MAX_NAME_LENGTH, MAX_DIR_LENGTH, DBSession
from backend.spine.db import SpineDBSession, SpineObject, SpineRelationship
from backend.spine.toolbox import SpineToolbox


SPINE_TEMPLATE_DIR = 'spine/Spine'
SPINE_PROJECTS_DIR = 'spine/projects'
SYSTEM_SPREADSHEET_FILENAME = '.spinetoolbox/items/user_input/user_data.xlsx'
SYSTEM_DB_DIR = '.spinetoolbox/items/miracl_db'
CURRENT_SYSTEM_DB_PATH = f'{SYSTEM_DB_DIR}/miracl_db.sqlite'
BASELINE_SYSTEM_DB_PATH = f'{SYSTEM_DB_DIR}/baseline.sqlite'
RESULTS_DB_PATH = '.spinetoolbox/items/metrics/Metrics.sqlite'
BASELINE_HAZARD_PREFIX = 'no_'

class GoalComparison(enum.Enum):
    LT = "&lt;"
    LTE = "&le;"
    EQ = "="
    GTE = "&ge;"
    GT = "&gt;"

    @staticmethod
    def get_all():
        all_comps = [str(e.value) for e in GoalComparison]
        return all_comps

    def compare(self, a, b) -> bool:
        try:
            if self is GoalComparison.LT:
                return a < b
            if self is GoalComparison.LTE:
                return a <= b
            if self is GoalComparison.EQ:
                return a == b
            if self is GoalComparison.GTE:
                return a >= b
            if self is GoalComparison.GT:
                return a > b
        except TypeError:
            return False

class MetricUnit(enum.Enum):
    NONE = "N/A"
    KW = "kW"
    KWH = "kWh"

BASE_HAZARD_NAME = 'Base'

class Metric(Base):
    goal = relationship('Goal', back_populates='metric')
    name = Column(String(MAX_NAME_LENGTH), nullable=False)
    unit = Column(Enum(MetricUnit))
    baseline_value = Column(Float)
    final_value = Column(Float)

    def get_delta(self) -> float:
        if self.final_value is None:
            return 0
        if self.baseline_value is None:
            return None
        return self.final_value - self.baseline_value

class Goal(Base):
    hazard_id = Column(Integer, ForeignKey('hazard.id'), nullable=False)
    hazard: 'Hazard' = relationship('Hazard', back_populates='goals')
    metric_id = Column(Integer, ForeignKey('metric.id'), nullable=False)
    metric: Metric = relationship('Metric', back_populates='goal')
    target_value = Column(Float)
    comparison = Column(Enum(GoalComparison))

    def _get_base_goal(self) -> 'Goal':
        project = self.hazard.project
        base_hazard = project.get_base_hazard()
        try:
            base_goal = [x for x in base_hazard.goals if x.metric.name == self.metric.name][0]
            return base_goal
        except IndexError as err:
            logging.exception('Unable to find base goal for metric %s.', self.metric.name)
            logging.exception(err)
            return None

    def get_comparison(self):
        if self.comparison is not None:
            return self.comparison

        comp = self._get_base_goal().comparison
        if comp is not None:
            return comp

        return GoalComparison.EQ

    def get_target_value(self):
        if self.target_value is not None:
            return self.target_value

        return self._get_base_goal().target_value

class HazardImpact(enum.Enum):
    UNKNOWN = "unknown"
    ACCEPTABLE = "acceptable"
    TOLERABLE = "tolerable"
    UNACCEPTABLE = "unacceptable"
    INTOLERABLE = "intolerable"

class HazardLikelihood(enum.Enum):
    UNKNOWN = "unknown"
    IMPROBABLE = "improbable"
    POSSIBLE = "possible"
    PROBABLE = "probable"

class HazardRiskLevel(enum.Enum):
    LOW = 0
    MEDIUM = 1
    HIGH = 2
    CRITICAL = 3

class Hazard(Base):
    name = Column(String(MAX_NAME_LENGTH), nullable=False)
    project_id = Column(Integer, ForeignKey('project.id'), nullable=False)
    project: 'Project' = relationship('Project', back_populates='hazards')
    goals: List[Goal] = relationship('Goal', order_by=Goal.id, back_populates='hazard', cascade='delete')
    impact: HazardImpact = Column(Enum(HazardImpact))
    likelihood: HazardLikelihood = Column(Enum(HazardLikelihood))

    def get_risk_level(self) -> HazardRiskLevel:
        if self.impact is HazardImpact.INTOLERABLE:
            if self.likelihood is HazardLikelihood.IMPROBABLE:
                return HazardRiskLevel.HIGH
            else:
                return HazardRiskLevel.CRITICAL
        elif self.impact is HazardImpact.UNACCEPTABLE:
            if self.likelihood is HazardLikelihood.IMPROBABLE:
                return HazardRiskLevel.MEDIUM
            else:
                return HazardRiskLevel.HIGH
        elif self.impact is HazardImpact.TOLERABLE:
            if self.likelihood is HazardLikelihood.PROBABLE:
                return HazardRiskLevel.HIGH
            else:
                return HazardRiskLevel.MEDIUM
        else:
            if self.likelihood is HazardLikelihood.PROBABLE:
                return HazardRiskLevel.MEDIUM
            else:
                return HazardRiskLevel.LOW

class Project(Base):
    name = Column(String(MAX_NAME_LENGTH), nullable=False)
    user_id = Column(String(MAX_NAME_LENGTH), nullable=False)
    hazards: List[Hazard] = relationship('Hazard', order_by=Hazard.name, back_populates='project', cascade='delete')
    dir = Column(String(MAX_DIR_LENGTH), nullable=False)
    results = Column(JSON, nullable=True)

    @classmethod
    def build(cls, session: DBSession, name: str, user_id: str = None) -> 'Project':
        d = datetime.datetime.now()
        directory = f'{SPINE_PROJECTS_DIR}/{name.replace(" ", "_")}_{d.strftime("%Y%m%d%H%M%S")}'
        shutil.copytree(SPINE_TEMPLATE_DIR, directory)
        project = cls(name=name, user_id=user_id, dir=directory)
        session.add(project)
        # We commit early here so that the Project gets assigned an ID by SQLAlchemy.
        session.commit()
        return project

    @staticmethod
    def get_template_file_path():
        return f'../{SPINE_TEMPLATE_DIR}/{SYSTEM_SPREADSHEET_FILENAME}'

    @classmethod
    def get_all_for_user(cls, session: DBSession, user_id: str) -> List['Project']:
        return session.query(cls).filter_by(user_id=user_id).all()

    def _save_system_db_as(self, path: str):
        shutil.copy2(f'{self.dir}/{CURRENT_SYSTEM_DB_PATH}', f'{self.dir}/{path}')

    def _load_system_db_from(self, path: str):
        try:
            os.replace(f'{self.dir}/{path}', f'{self.dir}/{CURRENT_SYSTEM_DB_PATH}')
        except FileNotFoundError:
            pass

    def run_spineopt(self) -> str:
        toolbox = SpineToolbox(self.dir)
        logging.debug('Running Spine Toolbox project...')
        toolbox.run()
        logging.debug('Spine Toolbox workflow complete.')

    def import_system(self, session: DBSession, spine_db: SpineDBSession, file: FileStorage, is_baseline: bool = True):
        file.save(os.path.join(self.dir, SYSTEM_SPREADSHEET_FILENAME))
        logging.debug('System spreadsheet saved.')
        toolbox = SpineToolbox(self.dir)
        toolbox.import_system()

        if is_baseline:
            logging.debug('Saving baseline system...')
            self._save_system_db_as(BASELINE_SYSTEM_DB_PATH)
            logging.debug('Running full Spine Toolbox project...')
            toolbox.run()
            logging.debug('Spine Toolbox workflow complete.')
            self.import_hazards(session, spine_db)
            self.load_results(spine_db, baseline=True)

    def get_system(self, spine_db: SpineDBSession, baseline=False) -> Tuple[List[SpineObject], List[SpineRelationship]]:
        db_path = CURRENT_SYSTEM_DB_PATH
        if baseline:
            db_path = BASELINE_SYSTEM_DB_PATH
        objects = spine_db.get_objects(self.dir, db_path)
        relationships = spine_db.get_relationships(self.dir, db_path)
        return (objects, relationships)

    def update_object_parameter(self, spine_db: SpineDBSession, obj_id: int, param_name: str, val: str):
        spine_db.update_object_parameter(self.dir, CURRENT_SYSTEM_DB_PATH, obj_id, param_name, val)

    def update_relationship_object(self, spine_db: SpineDBSession, rel_id: int, obj_index: int, obj_name: str):
        spine_db.update_relationship_object(self.dir, CURRENT_SYSTEM_DB_PATH, rel_id, obj_index, obj_name)

    def import_hazards(self, session: DBSession, spine_db: SpineDBSession) -> List[Hazard]:
        for h in self.hazards:
            session.delete(h)
        scenarios = spine_db.get_scenarios(self.dir, CURRENT_SYSTEM_DB_PATH)
        hazard_names = [s.name for s in scenarios]
        hazards = []
        for name in hazard_names:
            goals = []
            metrics = self.import_metrics(session, spine_db)
            for m in metrics:
                goal = Goal(metric=m)
                session.add(goal)
                goals.append(goal)
            hazard = Hazard(name=name, project=self, goals=goals)
            session.add(hazard)
            hazards.append(hazard)
        self.hazards = hazards
        return hazards

    def get_hazards(self) -> List[Hazard]:
        return [h for h in self.hazards if h.name != BASE_HAZARD_NAME and BASELINE_HAZARD_PREFIX not in h.name]

    def get_base_hazard(self) -> Hazard:
        return [h for h in self.hazards if h.name == BASE_HAZARD_NAME][0]

    def import_metrics(self, session: DBSession, spine_db: SpineDBSession) -> List[Metric]:
        objects = spine_db.get_objects(self.dir, RESULTS_DB_PATH)
        metrics = [Metric(name=o.object_name) for o in objects if o.object_class_name == 'metrics']
        for m in metrics:
            session.add(m)
        return metrics 

    def delete(self, session: DBSession):
        shutil.rmtree(self.dir)
        super().delete(session)

    def update_goal(self, session: DBSession, hazard_name: str, metric_name: str, comparison: str, target_value: float):
        try:
            hazard = [h for h in self.hazards if h.name == hazard_name][0]
            goal = [g for g in hazard.goals if g.metric.name == metric_name][0]
        except IndexError as err:
            logging.exception('Goal with metric %s for hazard %s not found.', metric_name, hazard_name)
            logging.exception(err)
            return

        goal.comparison = GoalComparison(comparison)
        goal.target_value = target_value

    def load_results(self, spine_db: SpineDBSession, baseline=False) -> List[Hazard]:
        relationships = spine_db.get_relationships(self.dir, RESULTS_DB_PATH)
        for r in relationships:
            hazard_name = r.objects[0].object_name
            if hazard_name[:len(BASELINE_HAZARD_PREFIX)] == BASELINE_HAZARD_PREFIX:
                hazard_name = 'Base'
                hazard = self.get_base_hazard()
            else:
                hazard = [h for h in self.hazards if h.name == hazard_name][0]
            logging.debug('Found hazard %s.', hazard.name)

            metric = [g.metric for g in hazard.goals if g.metric.name == r.objects[1].object_name][0]
            logging.debug('Found metric %s.', metric.name)

            try:
                if baseline:
                    logging.info(r.parameters)
                    metric.baseline_value = float(r.parameters['value'][1])
                else:
                    metric.final_value = float(r.parameters['value'][1])
            except ValueError as err:
                logging.exception('Skipping result %s because value is not a float (%s)', r.name, str(r.parameters["value"][1]))
                logging.exception(err)

        return self.hazards

    # Returns (added, removed, changed)
    def calculate_proposed_changes(self, spine_db: SpineDBSession) -> Tuple[List[SpineObject], List[SpineObject], List[SpineObject]]:
        proposed_objects = spine_db.get_objects(self.dir, CURRENT_SYSTEM_DB_PATH)
        proposed_names = [obj.object_name for obj in proposed_objects]
        baseline_objects = spine_db.get_objects(self.dir, BASELINE_SYSTEM_DB_PATH)
        baseline_names = [obj.object_name for obj in baseline_objects]

        added = [obj for obj in proposed_objects if obj.object_name not in baseline_names]
        removed = [obj for obj in baseline_objects if obj.object_name not in proposed_names]

        changed = []
        for obj in proposed_objects:
            if obj.object_name in baseline_names:
                baseline_obj = [x for x in baseline_objects if x.object_name == obj.object_name][0]
                new_obj = SpineObject(obj.object_class_name, obj.object_class_id, obj.object_id, obj.object_name)
                for param_name, id_val in obj.parameters.items():
                    if id_val is None:
                        proposed_val = None
                    else:
                        proposed_val = id_val[1]
                    try:
                        baseline_val = baseline_obj.parameters[param_name][1]
                    except TypeError:
                        baseline_val = None
                    if proposed_val != baseline_val:
                        new_obj.parameters[param_name] = (0, proposed_val)

                if new_obj.parameters:
                    changed.append(new_obj)

        return added, removed, changed
