# Copyright 2023, Battelle Energy Alliance, LLC
import json
import logging
from typing import Dict, Tuple, List

from spinedb_api import DiffDatabaseMapping


class SpineObject:

    def __init__(self, object_class_name, object_class_id, object_id, object_name):
        self.object_id = object_id
        self.object_class_name = object_class_name
        self.object_class_id = object_class_id
        self.object_name = object_name
        self.parameters: Dict[str, Tuple[int, str]] = {}

    @property
    def pretty_parameters(self) -> str:
        return json.dumps(self.parameters, sort_keys=True, indent=4)

    def __repr__(self):
        return f'<backend.SpineObject.{self.object_class_name} at {id(self)}>'

class SpineRelationship:

    def __init__(self, id: int, name: str, objects: List[SpineObject]):
        self.name = name
        self.objects = objects
        self.id = id
        self.parameters: Dict[str, Tuple[int, str]] = {}

class SpineScenario:

    def __init__(self, name: str):
        self.name = name

class SpineDBSession:

    def __init__(self):
        self._db_maps: Dict[str, DiffDatabaseMapping] = {}
        self._objects: Dict[str, Dict[int, SpineObject]] = {}
        self._relationships: Dict[str, Dict[int, SpineRelationship]] = {}

    def _url(self, dir: str, db_path: str):
        return f'sqlite:///{dir}/{db_path}'

    def _open(self, url: str) -> DiffDatabaseMapping:
        if url not in self._db_maps:
            self._db_maps[url] = DiffDatabaseMapping(url)
        return self._db_maps[url]

    def find_object_by_name(self, url, obj_name: str) -> SpineObject:
        for obj in self._objects[url].values():
            if obj.object_name == obj_name:
                return obj

    def get_objects(self, proj_dir: str, db_path: str) -> List[SpineObject]:
        url = self._url(proj_dir, db_path)
        if url in self._objects:
            return list(self._objects[url].values())
        db_map = self._open(url)

        loaded_classes = db_map.object_class_list()
        classes = {}
        for c in loaded_classes:
            classes[c.id] = c.name

        objects = {}
        loaded_objs = db_map.object_list()
        for obj in loaded_objs:
            objects[obj.id] = SpineObject(object_class_name=classes[obj.class_id],
                                        object_class_id=obj.class_id,
                                        object_id=obj.id,
                                        object_name=obj.name)
            obj_param_defs = db_map.object_parameter_definition_list(object_class_id=obj.class_id)
            for opd in obj_param_defs:
                objects[obj.id].parameters[opd.parameter_name] = None

        object_param_vals = db_map.object_parameter_value_list()

        for opv in object_param_vals:
            obj = objects[opv.entity_id]
            obj.parameters[opv.parameter_name] = (opv.id, opv.value.decode('utf-8'))

        self._objects[url] = objects
        return list(objects.values())

    def get_relationships(self, proj_dir: str, db_path: str) -> List[SpineRelationship]:
        url = self._url(proj_dir, db_path)
        if url in self._relationships:
            return list(self._relationships[url].values())
        db_map = self._open(url)

        relationships = {}
        loaded_relationships = db_map.wide_relationship_list()
        # Make sure objects are loaded
        self.get_objects(proj_dir, db_path)
        objects = self._objects[url]
        for lr in loaded_relationships:
            objs = []
            for i in lr.object_id_list.split(','):
                objs.append(objects[int(i)])
            relationship = SpineRelationship(id=lr.id, name=lr.name, objects=objs)
            rel_param_defs = db_map.relationship_parameter_definition_list(relationship_class_id=lr.class_id)
            for rpd in rel_param_defs:
                relationship.parameters[rpd.parameter_name] = None
            relationships[lr.id] = relationship

        rel_param_vals = db_map.relationship_parameter_value_list()
        for rpv in rel_param_vals:
            rel = relationships[rpv.entity_id]
            rel.parameters[rpv.parameter_name] = (rpv.id, rpv.value.decode('utf-8'))

        self._relationships[url] = relationships
        return list(relationships.values())

    def get_scenarios(self, proj_dir: str, db_path: str) -> List[SpineScenario]:
        url = self._url(proj_dir, db_path)
        db_map = self._open(url)

        alts = db_map.alternative_list()
        hazard_names = [alt.name.replace('_alt', '') for alt in alts]
        return [SpineScenario(name) for name in hazard_names]

    def update_object_parameter(self, dir: str, db_path: str, obj_id: int, param: str, val: str) -> bool:
        url = self._url(dir, db_path)
        obj = self._objects[url][obj_id]
        if val == '':
            if obj.parameters[param] is not None:
                self._db_maps[url].remove_items(parameter_value=[obj.parameters[param][0]])
            obj.parameters[param] = None
            return True
        else:
            if obj.parameters[param] is not None:
                param_id = obj.parameters[param][0]
                obj.parameters[param] = (param_id, val)
                item = {
                    'id': param_id,
                    'value': val.encode('utf-8')
                }
                updated = self._db_maps[url].update_parameter_values(item)
                if updated:
                    return True
                return False
            else:
                obj_param_defs = self._db_maps[url].object_parameter_definition_list(object_class_id=obj.object_class_id)
                param_def = [opd for opd in obj_param_defs if opd.parameter_name == param][0]
                obj_param_vals = self._db_maps[url].object_parameter_value_list()
                sample_param_val = obj_param_vals[0]
                item = {
                    'parameter_definition_id': param_def.id,
                    'alternative_id': sample_param_val.alternative_id,
                    'entity_id': obj.object_id,
                    'entity_class_id': obj.object_class_id,
                    'value': val.encode('utf-8')
                }
                try:
                    # This returns a tuple of (id_set, err_list)
                    new_id = self._db_maps[url].add_parameter_values(item)[0].pop()
                    obj.parameters[param] = (new_id, val)
                    logging.debug('Added param value id %d', new_id)
                    return True
                except IndexError as err:
                    logging.exception('Failed to add %s', str(item))
                    logging.exception(err)
                    return False

    def update_relationship_object(self, dir: str, db_path: str, rel_id: int, obj_index: int, obj_name: str) -> bool:
        url = self._url(dir, db_path)
        rel = self._relationships[url][rel_id]
        obj = self.find_object_by_name(url, obj_name)
        obj_list = rel.objects
        obj_list[obj_index] = obj
        rel.objects = obj_list
        item = {
            'id': rel.id,
            'object_id_list': [obj.object_id for obj in obj_list],
            'object_class_id_list': [obj.object_class_id for obj in obj_list]
        }
        updated = self._db_maps[url].update_wide_relationships(item)
        logging.debug('Updated: %s', str(updated))
        if updated:
            return True
        return False

    def commit(self):
        for db_map in self._db_maps.values():
            if db_map.has_pending_changes():
                db_map.commit_session('Handled request.')
            # Also manually close the connection to the DB - otherwise this can prevent the Delete
            # option on the main page from working.
            db_map.connection.close()
