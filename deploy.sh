#!/bin/bash

# Deployment script for EC2
# Usage: ./deploy.sh

set -e

echo "Starting deployment..."

# Pull latest changes
echo "Pulling latest code from git..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm install

# Build application
echo "Building application..."
npm run build

# Run database migrations
echo "Running database migrations..."
npm run db:migrate

# Restart PM2
echo "Restarting application..."
pm2 restart mermaid-app

# Show logs
echo "Deployment complete! Showing logs..."
pm2 logs mermaid-app --lines 50
