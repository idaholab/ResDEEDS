#!/bin/sh
export QT_QPA_PLATFORM="offscreen"
export FLASK_APP=./src/app.py
flask run --host=0.0.0.0