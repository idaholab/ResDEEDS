# Copyright 2023, Battelle Energy Alliance, LLC
import json

with open('config/config.json') as f:
    cur = json.load(f)
    
cur['app_secret_key'] = "test"

with open('config/config.json','w') as f:
    json.dump(cur, f, indent=4)