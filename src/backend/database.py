from mongoengine import *
from backend.system import *
from backend.hazard import Hazard
from backend.impact import *
from backend.template import TemplateLibrary

DB_NAME = 'resilience_calculator'

_db = None

def get_instance(drop_and_recreate=False, templates_file=None):
    global _db
    if _db is None:

        _db = Database(drop_and_recreate=drop_and_recreate, templates_file=templates_file)
    return _db

class Database():

    def __init__(self, drop_and_recreate=False, templates_file=None):
        self.db = connect(DB_NAME)
        if drop_and_recreate:
            self.db.drop_database(DB_NAME)
            self.load_templates(templates_file)

        self.templates = TemplateLibrary()

    def load_templates(self, file):
        transmission_lines = [TransmissionLine(name='Test line', km=100.5, kv=300).save()]
        loads = [Load(name='Test load', type=LoadType.RESIDENTIAL, max_kw=3.75).save()]
        generators = [Generator(name='Test generator', type=GeneratorType.SOLAR_PV, max_kw=5.4).save()]
        system = DefaultSystem(system_id=0, name='Test system',
                    transmission_lines=transmission_lines,
                    loads=loads,
                    generators=generators)
        system.save()
