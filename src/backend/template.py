from backend.hazard import Hazard
from mongoengine import *

class TemplateLibrary():

    def __init__(self):
        self.hazards = Hazard.objects(is_template=True)

class Template(Document):
    is_template = BooleanField()

    meta = {'allow_inheritance': True}