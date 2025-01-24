#!/bin/bash

echo "Stopping existing container.."
dzdo docker stop resdeeds-web

echo "Pulling latest image.."
dzdo docker pull ghcr.io/idaholab/resdeeds/web:latest

echo "Launching latest container"
dzdo docker run -d --rm \
    -p 80:80 -p 443:443 \
    --name resdeeds-web \
    -v ./etc/ssl:/etc/ssl \
    -v ./etc/nginx:/etc/nginx/conf.d \
    -v /var/log/nginx:/var/log/nginx \
    ghcr.io/idaholab/resdeeds/web:latest

echo "Deployed"