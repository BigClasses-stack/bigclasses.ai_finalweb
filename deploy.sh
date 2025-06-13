#!/bin/bash
set -e  # Exit on any error

echo "=== SWITCHING TO STAGING DIRECTORY ==="
cd /home/ubuntu/stage/bigclasses.ai_finalweb

echo "=== CLEANING UNNEEDED FILES ==="
# Stop all running Python processes that may lock .pyc files
if pgrep -f python; then
  echo "Stopping running Python processes..."
  pkill -f python
fi

# Force permissions and remove .pyc files and __pycache__ directories
find . -type f -name '*.pyc' -exec chmod +w {} \; -exec rm -f {} \;
find . -type d -name '__pycache__' -exec chmod -R +w {} \; -exec rm -rf {} +

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