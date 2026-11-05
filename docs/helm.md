# Frontend Helm chart

Chart directory: `helm/restaurant-frontend`.

## What it creates

- A Deployment running the existing Angular/Nginx image from GHCR.
- A ClusterIP Service named after the Helm release, on port 80.
- Environment variables that configure Nginx's backend destinations at startup.

The frontend has no database and needs no persistent volume. Its backend Services
must exist in the same namespace under the names `restaurant-menu` (8081) and
`restaurant-order` (8082). Docker containers with those names are separate from
these Kubernetes Services.

Browser requests still use relative `/api` URLs. Nginx forwards menu/category calls
to menu-service and order calls to order-service. Order-service makes the Feign
call to menu-service when creating an order.

The chart selects the already published image tagged
`sha-031891eb6be095cef789dcecd2855c74370d1fa3`. Chart version `0.1.0` versions the
Helm configuration; `appVersion: 0.0.0` describes package.json's application
version. `image.tag` selects the actual deployed image.

Default values are shared. Environment files choose the image and backend URLs.
Namespace-local DNS means the same Service names connect development apps to
development backends and testing apps to testing backends.

## Validate

Run from the frontend directory:

```powershell
helm lint ./helm/restaurant-frontend --strict -f ./helm/restaurant-frontend/values-development.yaml
helm template restaurant-frontend ./helm/restaurant-frontend --namespace development -f ./helm/restaurant-frontend/values-development.yaml
helm lint ./helm/restaurant-frontend --strict -f ./helm/restaurant-frontend/values-testing.yaml
```

## Deploy development after validation

The `development` namespace needs the `ghcr-pull` Secret created earlier, and both
backend Services must be available before Nginx starts (it resolves their names
when reading its configuration).

```powershell
helm upgrade --install restaurant-frontend ./helm/restaurant-frontend --namespace development -f ./helm/restaurant-frontend/values-development.yaml --wait --timeout 5m
kubectl get pods,svc -n development
kubectl logs -n development deployment/restaurant-frontend
```

To open the Kubernetes frontend without conflicting with the Docker frontend
already using port 4200:

```powershell
kubectl port-forward -n development service/restaurant-frontend 14200:80
```

Keep the terminal running, then visit http://localhost:14200. No backend port
forwarding is needed for browser requests; Nginx reaches them inside Kubernetes.
Test category creation, dish creation, and order placement. Refresh an Angular
page to confirm route fallback also works. The Kubernetes databases start
separately from your Docker and IntelliJ databases.

Probes check that Nginx serves the frontend; they do not prove backend requests
or Feign calls succeed. Those are covered by the manual full-flow check.

## Testing later

After promoting the feature branches directly into testing, deploy menu-service,
then order-service, then frontend in that namespace using the selected image tags:

```powershell
helm upgrade --install restaurant-frontend ./helm/restaurant-frontend --namespace testing -f ./helm/restaurant-frontend/values-testing.yaml --wait --timeout 5m
```

We will add automated CD after manual deployment and the full flow work.
