#!/usr/bin/env bash
set -euo pipefail

TAG="${1:-1.0.0}"
DOCKERHUB_USER="${DOCKERHUB_USER:-yourdockerhub}"

echo "Using DOCKERHUB_USER=$DOCKERHUB_USER TAG=$TAG"

docker build -t "$DOCKERHUB_USER/catalog-service:$TAG" ./services/catalog-service
docker build -t "$DOCKERHUB_USER/order-service:$TAG"   ./services/order-service
docker build -t "$DOCKERHUB_USER/api-gateway:$TAG"     ./gateway
docker build -t "$DOCKERHUB_USER/frontend:$TAG"        ./frontend

docker push "$DOCKERHUB_USER/catalog-service:$TAG"
docker push "$DOCKERHUB_USER/order-service:$TAG"
docker push "$DOCKERHUB_USER/api-gateway:$TAG"
docker push "$DOCKERHUB_USER/frontend:$TAG"
