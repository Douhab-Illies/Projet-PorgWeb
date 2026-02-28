#!/usr/bin/env bash
set -euo pipefail
DOCKERHUB_USER="${1:-${DOCKERHUB_USER:-yourdockerhub}}"
IMAGE_TAG="${2:-${IMAGE_TAG:-1.0.0}}"

echo "Patching k8s manifests with DOCKERHUB_USER=$DOCKERHUB_USER IMAGE_TAG=$IMAGE_TAG"

for f in k8s/20-catalog.yaml k8s/30-order.yaml k8s/40-gateway.yaml k8s/45-frontend.yaml; do
  sed -i "s|DOCKERHUB_USER|$DOCKERHUB_USER|g" "$f"
  sed -i "s|IMAGE_TAG|$IMAGE_TAG|g" "$f"
done

echo "Done."
