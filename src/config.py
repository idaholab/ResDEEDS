import json

try:
    with open("config/config.json", "r", encoding='utf-8') as config_file:
        config = json.load(config_file)
except FileNotFoundError:
    print('Config file config/config.json not found.')
    exit(1)