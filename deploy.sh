#!/bin/bash
set -e  # Exit on any error

echo "=== SWITCHING TO STAGING DIRECTORY ==="
cd /home/ubuntu/stage/bigclasses.ai_finalweb

echo "=== FIXING FILE PERMISSIONS ==="
sudo chown -R ubuntu:ubuntu .

echo "=== CLEANING BUILD AND CACHE FILES ==="
find . -type f -name '*.pyc' -delete || true
find . -type d -name '__pycache__' -exec rm -rf {} + || true

echo "=== FETCHING AND RESETTING TO REMOTE 'stage' ==="
git fetch origin
git reset --hard origin/stage
git clean -fd

echo "=== STOPPING OLD STAGING CONTAINERS ==="
docker-compose -f docker-compose.stage.yml -p stage down

echo "=== BUILDING & STARTING NEW STAGING CONTAINERS ==="
docker-compose -f docker-compose.stage.yml -p stage up -d --build

echo "=== RELOADING NGINX ==="
sudo nginx -t && sudo systemctl restart nginx

echo "=== DEPLOYMENT COMPLETED SUCCESSFULLY ==="
