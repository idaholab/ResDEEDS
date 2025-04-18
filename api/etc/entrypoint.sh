#!/bin/bash

echo "Launching ResDEEDS API..."

if [[ $DEBUG -eq 1 ]];
then
    echo "Running in debug mode"
    uvicorn src.main:app \
    --host 0.0.0.0 \
    --port 5000 \
    --reload
else
    echo "Running in production mode"
    uvicorn src.main:app \
    --host 0.0.0.0 \
    --port 5000 \
    --workers 4
fi
