#!/bin/bash

echo "Stopping existing container.."
dzdo docker stop resdeeds-web

echo "Pulling latest image.."
dzdo docker pull ghcr.io/idaholab/resdeeds/web:latest

echo "Launching latest container"
dzdo docker run -d --rm \
    --env-file .env \
    -p 80:80 -p 443:433 \
    --name resdeeds-web \
    -v ./etc/ssl:/etc/ssl
    ghcr.io/idaholab/resdeeds/web:latest

echo "Deployed"