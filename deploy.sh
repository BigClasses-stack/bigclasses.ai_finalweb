set -e  # Exit on any error

# Go to staging project folder
cd /home/ubuntu/stage/bigclasses.ai_finalweb

# Pull latest code from stage branch
git config pull.rebase false
git pull origin stage
cd /home/ubuntu/stage/bigclasses.ai_finalweb/bigclasses.ai
rm -rf node_modules package-lock.json
cd ..

# Fix file permissions to avoid Docker build errors
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;

# Bring down only the STAGING containers
docker-compose -f docker-compose.stage.yml -p stage down

# Build and start the staging stack
docker-compose -f docker-compose.stage.yml -p stage up -d --build

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx