# EC2 Deployment Guide

## Prerequisites

- AWS EC2 instance (Ubuntu 22.04 LTS recommended)
- Domain name (optional, for SSL)
- Clerk account with production keys

## Step 1: Launch EC2 Instance

### Instance Configuration
- **AMI**: Ubuntu Server 22.04 LTS
- **Instance Type**: t3.small or larger (minimum 2GB RAM)
- **Storage**: 20GB+ EBS volume
- **Security Group Rules**:
  - SSH (22) - Your IP
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0
  - Custom (3000) - 0.0.0.0/0 (for testing, remove in production)

## Step 2: Connect to EC2 and Install Dependencies

```bash
# Connect to your instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v20.x
npm --version

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

## Step 3: Clone and Setup Application

```bash
# Create app directory
sudo mkdir -p /var/www
sudo chown -R ubuntu:ubuntu /var/www
cd /var/www

# Clone your repository
git clone YOUR_REPO_URL mermaid-app
cd mermaid-app

# Install dependencies
npm install

# Create production environment file
nano .env.production
```

### .env.production Configuration

```bash
# Database
DATABASE_URL=file:/var/www/mermaid-app/data/db.sqlite

# Clerk Authentication (PRODUCTION KEYS!)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY
CLERK_SECRET_KEY=sk_live_YOUR_PRODUCTION_SECRET

# Email Domain Filtering
ALLOWED_EMAIL_DOMAINS=agenticai.nz

# Production URL
NEXT_PUBLIC_URL=https://yourdomain.com
```

**Important**: Get production Clerk keys from https://dashboard.clerk.com

## Step 4: Build Application

```bash
# Build the Next.js app
npm run build

# Setup database
npm run db:migrate

# Test the build
npm start
```

Visit `http://your-ec2-ip:3000` to verify the app works.

## Step 5: Configure PM2

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add this configuration:

```javascript
module.exports = {
  apps: [{
    name: 'mermaid-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/mermaid-app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

```bash
# Start app with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd
# Run the command it outputs (starts with 'sudo env PATH=...')

# Check status
pm2 status
pm2 logs mermaid-app
```

## Step 6: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/mermaid-app
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 10M;
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/mermaid-app /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```

## Step 7: Setup SSL with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

Certbot will automatically update your Nginx config for HTTPS.

## Step 8: Configure Clerk Production Settings

1. Go to https://dashboard.clerk.com
2. Select your production application
3. Configure **Allowed Origins** and **Allowed Redirect URLs**:
   - Add: `https://yourdomain.com`
   - Add: `https://yourdomain.com/*`

## Step 9: Database Backup (Important!)

```bash
# Create backup directory
mkdir -p /var/www/mermaid-app/backups

# Create backup script
nano /var/www/mermaid-app/backup.sh
```

Add this script:

```bash
#!/bin/bash
BACKUP_DIR="/var/www/mermaid-app/backups"
DB_PATH="/var/www/mermaid-app/data/db.sqlite"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
cp $DB_PATH $BACKUP_DIR/db_$DATE.sqlite

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_*.sqlite" -mtime +7 -delete

echo "Backup completed: db_$DATE.sqlite"
```

```bash
# Make executable
chmod +x /var/www/mermaid-app/backup.sh

# Add to crontab (daily backup at 2 AM)
crontab -e

# Add this line:
0 2 * * * /var/www/mermaid-app/backup.sh >> /var/www/mermaid-app/backups/backup.log 2>&1
```

## Deployment Checklist

- [ ] EC2 instance launched with correct security groups
- [ ] Node.js 20+ installed
- [ ] Application cloned and dependencies installed
- [ ] Production environment variables configured
- [ ] Application built successfully (`npm run build`)
- [ ] Database migrated (`npm run db:migrate`)
- [ ] PM2 configured and running
- [ ] Nginx configured as reverse proxy
- [ ] SSL certificate installed
- [ ] Clerk production settings updated
- [ ] Database backup cron job configured
- [ ] Application accessible via domain

## Updating the Application

```bash
# SSH into server
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to app directory
cd /var/www/mermaid-app

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild application
npm run build

# Run database migrations (if any)
npm run db:migrate

# Restart PM2
pm2 restart mermaid-app

# Check logs
pm2 logs mermaid-app
```

## Monitoring

```bash
# View PM2 status
pm2 status

# View logs
pm2 logs mermaid-app

# View real-time monitoring
pm2 monit

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System resources
htop
```

## Troubleshooting

### Application won't start
```bash
# Check PM2 logs
pm2 logs mermaid-app --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart PM2
pm2 restart mermaid-app
```

### Nginx errors
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Database issues
```bash
# Check database file permissions
ls -la /var/www/mermaid-app/data/

# Ensure directory is writable
sudo chown -R ubuntu:ubuntu /var/www/mermaid-app/data/
chmod 755 /var/www/mermaid-app/data/
```

### Out of memory
```bash
# Check memory usage
free -h

# Consider upgrading instance type or adding swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Security Best Practices

1. **Keep system updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Configure firewall (UFW)**
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

3. **Disable password authentication** (SSH keys only)
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set: PasswordAuthentication no
   sudo systemctl restart sshd
   ```

4. **Regular backups** - Database backups run daily at 2 AM

5. **Monitor logs** - Check PM2 and Nginx logs regularly

6. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   ```

## Cost Optimization

- **Instance Type**: Start with t3.small ($15-20/month)
- **Storage**: 20GB EBS is sufficient for most use cases
- **Reserved Instances**: Consider 1-year reserved for 30% savings
- **CloudWatch**: Set up billing alerts

## Support

For issues or questions:
- Check logs: `pm2 logs mermaid-app`
- Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify environment variables are set correctly
- Ensure Clerk production keys are configured
