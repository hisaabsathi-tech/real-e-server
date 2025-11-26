#!/bin/bash

echo 'Pulling latest changes...'
git pull origin dev

echo 'Building new images...'
docker compose build

echo 'Starting services with rolling update...'
docker compose up -d --no-deps --build realestate

echo 'Waiting for health checks...'
sleep 30

echo 'Checking container health...'
if docker compose ps | grep -q "healthy\|Up"; then
    echo 'Deployment successful!'
    
    echo 'Cleaning up unused images...'
    docker image prune -f
    
    echo 'Running containers:'
    docker ps
else
    echo 'Deployment failed - containers not healthy!'
    echo 'Rolling back...'
    docker compose down
    docker compose up -d
    exit 1
fi
