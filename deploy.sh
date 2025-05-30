set -e  # Exit on any error
cd /home/ubuntu/bigclasses


git config pull.rebase false
git pull origin prod

docker-compose down
docker-compose up -d --build

# Enable the site
# sudo ln -s /etc/nginx/sites-available/bigclasses.ai /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx