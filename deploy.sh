set -e  # Exit on any error

# Go to staging project folder
cd /home/ubuntu/prod/bigclasses.ai_finalweb

# Pull latest code from prod branch
git config pull.rebase false
git pull origin prod
cd /home/ubuntu/prod/bigclasses.ai_finalweb/bigclasses.ai
rm -rf node_modules package-lock.json
cd ..

# Bring down only the STAGING containers
docker-compose -f docker-compose.prod.yml -p prod down

# Build and start the staging stack
docker-compose -f docker-compose.prod.yml -p prod up -d --build

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx