import datetime
import os
import random
import shutil
import enum
from typing import List, Tuple
from werkzeug.datastructures import FileStorage
from sqlalchemy import JSON, Column, ForeignKey, Integer, String, Float, Enum
from sqlalchemy.orm import relationship
from backend import Base, MAX_NAME_LENGTH, MAX_DIR_LENGTH, DBSession
from backend.spine.db import SpineDBSession, SpineObject, SpineRelationship, SpineScenario
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
        all = [str(e.value) for e in GoalComparison]
        print(all)
        return all

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

# METRICS = {
#     "load_unserved": {
#         "name": "Load unserved",
#         "unit": MetricUnit.KWH
#     },
#     "total_capacity": {
#         "name": "Total capacity",
#         "unit": MetricUnit.KW
#     },
#     "energy_storage": {
#         "name": "Total energy storage",
#         "unit": MetricUnit.KWH
#     }
# }

BASE_HAZARD_NAME = 'Base'

class Metric(Base):
    #goal_id = Column(Integer, ForeignKey('goal.id'), nullable=False)
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
    #project_id = Column(Integer, ForeignKey('project.id'), nullable=False)
    #project = relationship('Project', back_populates='goals')
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
        except IndexError:
            print(f'Unable to find base goal for metric {self.metric.name}.')
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
    #system_id = Column(Integer, ForeignKey('system.id'))
    #baseline_system_id = Column(Integer, ForeignKey('system.id'))
    #baseline_system = relationship('System', cascade='delete', foreign_keys=[baseline_system_id])
    #final_system_id = Column(Integer, ForeignKey('system.id'))
    #final_system = relationship('System', cascade='delete', foreign_keys=[final_system_id])
    #goals: List[Goal] = relationship('Goal', order_by=Goal.id, back_populates='project', cascade='delete')
    #metrics = relationship('Metric', back_populates='project', cascade='delete')
    hazards: List[Hazard] = relationship('Hazard', order_by=Hazard.name, back_populates='project', cascade='delete')

    dir = Column(String(MAX_DIR_LENGTH), nullable=False)

    results = Column(JSON, nullable=True)

    @classmethod
    def build(cls, session: DBSession, spine_db: SpineDBSession, name: str, user_id: str = None) -> 'Project':
        d = datetime.datetime.now()
        directory = f'{SPINE_PROJECTS_DIR}/{name.replace(" ", "_")}_{d.strftime("%Y%m%d%H%M%S")}'
        shutil.copytree(SPINE_TEMPLATE_DIR, directory)
        # goals = []
        # for k, v in METRICS.items():
        #     metric = Metric(name=v['name'], unit=v['unit'])
        #     session.add(metric)
        #     goal = Goal(metric=metric)
        #     session.add(goal)
        #     goals.append(goal)
        project = cls(name=name, user_id=user_id, dir=directory)
        #project.import_hazards(session, spine_db)
        session.add(project)
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
        #os.rename(f'{self.dir}/{CURRENT_SYSTEM_DB_PATH}', f'{self.dir}/{path}')
        #session = SpineDBSession()
        #session.clone_db(self.dir, path)

    def _load_system_db_from(self, path: str):
        #shutil.copy2(f'{self.dir}/{path}', f'{self.dir}/{CURRENT_SYSTEM_DB_PATH}')
        try:
            os.replace(f'{self.dir}/{path}', f'{self.dir}/{CURRENT_SYSTEM_DB_PATH}')
        except FileNotFoundError:
            # Assume the file is already loaded
            pass

    def run_spineopt(self) -> str:
        toolbox = SpineToolbox(self.dir)
        result = toolbox.run()
        print(result)

    def import_system(self, session: DBSession, spine_db: SpineDBSession, file: FileStorage, is_baseline: bool = True) -> str:
        file.save(os.path.join(self.dir, SYSTEM_SPREADSHEET_FILENAME))
        print('System spreadsheet saved.')
        toolbox = SpineToolbox(self.dir)
        result = ''
        #TODO: uncomment
        result = toolbox.import_system()
        for i in result:
            print(i)
        ##spine_session = SpineDBSession()

        if is_baseline:
            print('Saving baseline system...')
            self._save_system_db_as(BASELINE_SYSTEM_DB_PATH)
            print('Running full Spine Toolbox project...')
            #TODO: uncomment
            result = toolbox.run()
            print(result)
            self.import_hazards(session, spine_db)
            self.load_results(spine_db, baseline=True)

        #self._save_system_db_as(FINAL_SYSTEM_DB_PATH)
        # if self.baseline_system:
        #     session.delete(self.baseline_system)
        # system = System(objects=spine_objects)
        # session.add_all(spine_objects)
        # session.add(system)
        # self.baseline_system = system

        # TODO: obtain list of hazards from alternatives and create Hazards, Goals, and Metrics
        # Also if baseline, populate baseline value of metrics??

        return result

    def get_system(self, spine_db: SpineDBSession, baseline=False) -> Tuple[List[SpineObject], List[SpineRelationship]]:
        db_path = CURRENT_SYSTEM_DB_PATH
        if baseline:
            db_path = BASELINE_SYSTEM_DB_PATH
        objects = spine_db.get_objects(self.dir, db_path)
        relationships = spine_db.get_relationships(self.dir, db_path)
        return (objects, relationships)

    def update_object_parameter(self, spine_db: SpineDBSession, obj_id: int, param_name: str, val: str):
        spine_db.update_object_parameter(self.dir, CURRENT_SYSTEM_DB_PATH, obj_id, param_name, val)

    # def update_relationship_parameter(self, spine_db: SpineDBSession, rel_id: int, param_name: str, val: str):
    #     spine_db.update_relationship_parameter(self.dir, CURRENT_SYSTEM_DB_PATH, rel_id, param_name, val)

    def update_relationship_object(self, spine_db: SpineDBSession, rel_id: int, obj_index: int, obj_name: str):
        spine_db.update_relationship_object(self.dir, CURRENT_SYSTEM_DB_PATH, rel_id, obj_index, obj_name)

    def import_hazards(self, session: DBSession, spine_db: SpineDBSession) -> List[Hazard]:
        for h in self.hazards:
            session.delete(h)
        scenarios = spine_db.get_scenarios(self.dir, CURRENT_SYSTEM_DB_PATH)
        #hazard_names = [BASE_HAZARD_NAME]
        #hazard_names.extend([s.name for s in scenarios])
        hazard_names = [s.name for s in scenarios]
        print(f'Hazard names: {hazard_names}')
        hazards = []
        # TODO: calculate for base scenario too?
        for name in hazard_names:
            goals = []
            # TODO: this is wrong... shouldn't be done per hazard
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
        print(objects)
        metrics = [Metric(name=o.object_name) for o in objects if o.object_class_name == 'metrics']
        for m in metrics:
            session.add(m)
        return metrics 

    # def update_hazard_parameter(self, spine_db: SpineDBSession, obj_id: int, param: str, val: str):
    #     spine_db.up

    def delete(self, session: DBSession):
        shutil.rmtree(self.dir)
        super().delete(session)

    def update_goal(self, session: DBSession, hazard_name: str, metric_name: str, comparison: str, target_value: float):
        try:
            hazard = [h for h in self.hazards if h.name == hazard_name][0]
            goal = [g for g in hazard.goals if g.metric.name == metric_name][0]
        except IndexError:
            print(f'Goal with metric {metric_name} for hazard {hazard_name} not found.')
            return

        goal.comparison = GoalComparison(comparison)
        goal.target_value = target_value

    def load_results(self, spine_db: SpineDBSession, baseline=False) -> List[Hazard]:
        relationships = spine_db.get_relationships(self.dir, RESULTS_DB_PATH)
        for r in relationships:
            print(r.objects[0].object_name)
            print([h.name for h in self.hazards])
            hazard_name = r.objects[0].object_name
            if hazard_name[:len(BASELINE_HAZARD_PREFIX)] == BASELINE_HAZARD_PREFIX:
                hazard_name = 'Base'
                hazard = self.get_base_hazard()
            else:
                hazard = [h for h in self.hazards if h.name == hazard_name][0]
            print(f'Found hazard {hazard.name}')
            print(r.objects[1].object_name)

            print([g.metric.name for g in hazard.goals])

            metric = [g.metric for g in hazard.goals if g.metric.name == r.objects[1].object_name][0]
            print(f'Found metric {metric.name}')
            try:
                if baseline:
                    print(r.parameters)
                    metric.baseline_value = float(r.parameters['value'][1])
                else:
                    metric.final_value = float(r.parameters['value'][1])
            except ValueError:
                print(f'Skipping {r.name} because value is not a float ({r.parameters["value"][1]})')

        return self.hazards

    # Returns (added, removed, changed)
    def calculate_proposed_changes(self, spine_db: SpineDBSession) -> Tuple[List[SpineObject], List[SpineObject], List[SpineObject]]:
        proposed_objects = spine_db.get_objects(self.dir, CURRENT_SYSTEM_DB_PATH)
        proposed_names = [obj.object_name for obj in proposed_objects]
        baseline_objects = spine_db.get_objects(self.dir, BASELINE_SYSTEM_DB_PATH)
        baseline_names = [obj.object_name for obj in baseline_objects]

        added = [obj for obj in proposed_objects if obj.object_name not in baseline_names]
        removed = [obj for obj in baseline_objects if obj.object_name not in proposed_names]

        # TODO: move to spine/db.py?
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
