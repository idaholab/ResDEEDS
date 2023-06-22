# Copyright 2023, Battelle Energy Alliance, LLC
import json
import logging
import os

try:
    with open(os.path.join(os.path.realpath(__file__),"../config/config.json"), "r", encoding='utf-8') as config_file:
        config = json.load(config_file)
except FileNotFoundError:
    logging.critical('Config file config/config.json not found.')
    exit(1)

try:
    with open(os.path.join(os.path.realpath(__file__),"../config/local.json"), "r", encoding='utf-8') as local_config_file:
        config.update(json.load(local_config_file))
except FileNotFoundError:
    logging.info('Local config file config/local.json not found. Create this file to override default config options.')
