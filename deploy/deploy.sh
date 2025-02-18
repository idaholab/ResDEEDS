#!/bin/bash

echo "Stopping existing containers.."
dzdo docker compose stop

echo "Pulling latest image.."
dzdo docker compose pull

echo "Launching latest containers"
dzdo docker compose up -d

echo "Deployed"