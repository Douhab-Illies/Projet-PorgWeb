# Microservices 20/20 – Full stack (Front + API Gateway + 2 Microservices + DB + K8s + Sécurité + Bonus gRPC/Istio)

Ce projet est construit pour couvrir le sujet (microservices, Docker/Kubernetes, gateway, 2 services reliés, base de données, sécurité RBAC/NetworkPolicy, bonus gRPC + service mesh Istio/mTLS).

## Architecture

```
          (web)
Browser  ------> Nginx (frontend)  ---->  api-gateway (REST)
                                      |->  catalog-service (REST + gRPC)
                                      |->  order-service  (REST) ----> PostgreSQL
                                                     |
                                                     | gRPC
                                                     v
                                             catalog-service
```

## Démarrage local (Docker Compose)

```bash
docker compose up --build
```

- UI: http://localhost:8080/
- API (via nginx): http://localhost:8080/api/products
- Health gateway: http://localhost:8080/health

### Exemples de tests

```bash
curl -s http://localhost:8080/api/products | jq
curl -s -X POST http://localhost:8080/api/orders \
  -H 'content-type: application/json' \
  -d '{"items":[{"productId":"p1","quantity":2},{"productId":"p2","quantity":1}]}' | jq
curl -s http://localhost:8080/api/orders | jq
```

## Kubernetes (Minikube)

```bash
minikube start
minikube addons enable ingress
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -n micro-20 -f k8s/10-postgres.yaml
kubectl apply -n micro-20 -f k8s/20-catalog.yaml
kubectl apply -n micro-20 -f k8s/30-order.yaml
kubectl apply -n micro-20 -f k8s/40-gateway.yaml
kubectl apply -n micro-20 -f k8s/45-frontend.yaml
kubectl apply -n micro-20 -f k8s/50-ingress.yaml

kubectl apply -n micro-20 -f k8s/60-rbac.yaml
kubectl apply -n micro-20 -f k8s/70-networkpolicy.yaml
```

### Bonus Istio + mTLS STRICT
```bash
istioctl install -y --set profile=demo
kubectl label namespace micro-20 istio-injection=enabled --overwrite
kubectl rollout restart deploy -n micro-20 catalog-service order-service api-gateway frontend

kubectl apply -n micro-20 -f k8s/istio/00-peerauth-strict.yaml
kubectl apply -n micro-20 -f k8s/istio/10-destinationrules.yaml
kubectl apply -n micro-20 -f k8s/istio/20-gateway.yaml
kubectl apply -n micro-20 -f k8s/istio/30-virtualservice.yaml
```

