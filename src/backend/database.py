from mongoengine import *
from system import *

DB_NAME = 'resilience_calculator'
MAX_NAME_LENGTH = 50

db = None

def initialize(drop_and_recreate=False, default_objects_file=None):
    global db
    db = connect(DB_NAME)
    if drop_and_recreate:
        db.drop_database(DB_NAME)
        load_default_objects(default_objects_file)

def load_default_objects(file):
    transmission_lines = [TransmissionLine(name='Test line', km=100.5, kv=300).save()]
    loads = [Load(name='Test load', type=LoadType.RESIDENTIAL, max_kw=3.75).save()]
    generators = [Generator(name='Test generator', type=GeneratorType.SOLAR_PV, max_kw=5.4).save()]
    system = DefaultSystem(system_id=0, name='Test system',
                transmission_lines=transmission_lines,
                loads=loads,
                generators=generators)
    system.save()