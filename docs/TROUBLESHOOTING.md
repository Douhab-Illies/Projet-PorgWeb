# Troubleshooting

## `npm ci` échoue
Les Dockerfiles utilisent `npm install` pour éviter le besoin de `package-lock.json`.

## `Cannot GET /` via le gateway
Le gateway mappe correctement `/api/products` -> `/products` et `/api/orders` -> `/orders`.
Vérifie que tu rebuilds bien l'image gateway.

## NetworkPolicy
Si les pods ne communiquent plus après `k8s/70-networkpolicy.yaml`, ton cluster n'a peut-être pas de CNI compatible (Calico/Cilium).
Dans ce cas, commente les NetworkPolicy pour la démo ou installe un CNI.

## Ingress host
Ajoute une entrée hosts:
`<MINIKUBE_IP> micro.local`
