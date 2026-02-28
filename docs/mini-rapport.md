# Mini-rapport (à compléter + screenshots)

## 1) Objectif
Microservices (REST + bonus gRPC), Docker, Kubernetes, Gateway, 2 services reliés, base de données, sécurité (RBAC + NetworkPolicy), bonus Istio/mTLS.

## 2) Architecture
- Front React servi par Nginx
- API Gateway Node
- catalog-service (REST + gRPC)
- order-service (REST) + PostgreSQL
- order-service appelle catalog-service en gRPC pour valider les produits

## 3) Démo locale
- `docker compose up --build`
- Screens: UI + `curl` / Postman

## 4) Démo Kubernetes
- `kubectl get all -n micro-20`
- Screenshot Ingress + accès via navigateur

## 5) Base de données
- Screenshot logs / table `orders` remplie + PVC

## 6) Sécurité
- RBAC: Role/RoleBinding appliqués
- NetworkPolicy: règles de flux
- Bonus: Istio mTLS STRICT + DestinationRule

## 7) Bonus gRPC
- Screenshot logs order-service montrant l'appel gRPC
