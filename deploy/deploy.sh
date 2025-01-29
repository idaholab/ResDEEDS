#!/bin/bash

echo "Stopping existing container.."
dzdo docker stop resdeeds-web
dzdo docker stop resdeeds-api

echo "Pulling latest image.."
dzdo docker pull ghcr.io/idaholab/resdeeds/web:latest
dzdo docker pull ghcr.io/idaholab/resdeeds/api:latest

echo "Launching latest containers"
dzdo docker run -d --rm \
    -p 80:80 -p 443:443 \
    --name resdeeds-web \
    -v ./etc/ssl:/etc/ssl \
    -v ./etc/nginx:/etc/nginx/conf.d \
    -v /var/log/nginx:/var/log/nginx \
    ghcr.io/idaholab/resdeeds/web:latest
dzdo docker run -d --rm \
    -p 5000:5000 \
    --name resdeeds-api \
    --env-file .env \
    ghcr.io/idaholab/resdeeds/api:latest

echo "Deployed"