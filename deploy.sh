#!/bin/bash
set -e  # Exit on any error

echo "=== SWITCHING TO STAGING DIRECTORY ==="
cd /home/ubuntu/stage/bigclasses.ai_finalweb

echo "=== CLEANING UNNEEDED FILES ==="
# Clean Python bytecode files
find . -type f -name '*.pyc' -delete
find . -type d -name '__pycache__' -exec rm -rf {} +

# (Optional) Clean old node_modules cache if it's accidentally committed
if [ -d "bigclasses.ai/node_modules" ]; then
  rm -rf bigclasses.ai/node_modules
fi

echo "=== FORCING LATEST GIT STATE ==="
# Force local code to match the remote 'stage' branch
git fetch origin
git reset --hard origin/stage
git clean -fd

echo "=== SHUTTING DOWN OLD STAGING CONTAINERS ==="
docker-compose -f docker-compose.stage.yml -p stage down

echo "=== BUILDING AND STARTING STAGING CONTAINERS ==="
docker-compose -f docker-compose.stage.yml -p stage up -d --build

echo "=== TESTING AND RESTARTING NGINX ==="
sudo nginx -t
sudo systemctl restart nginx

echo "=== DEPLOYMENT COMPLETE ==="