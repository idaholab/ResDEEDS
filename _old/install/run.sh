#!/bin/sh
# Copyright 2023, Battelle Energy Alliance, LLC
export QT_QPA_PLATFORM="offscreen"
export FLASK_APP=./src/app.py
flask run --host=0.0.0.0 --no-reload --debugger