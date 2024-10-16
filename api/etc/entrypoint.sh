#!/bin/bash

echo "Launching ResDEEDS API..."

if [[ $DEBUG -eq 1 ]];
then
    echo "Running in debug mode"
    flask --app src/main run --host 0.0.0.0
else
    echo "Running in production mode"
    flask --app src/main run --host 0.0.0.0
fi
