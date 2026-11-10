# Automatic frontend development and testing deployment

## Sequence

1. Work on a feature branch from main, commit it, and push the feature.
2. Check out development or testing, pull, merge this same feature branch directly
   into the target branch, and push it.
3. Frontend CI runs separately. The GHCR workflow builds the Dockerfile, which
   also runs the Angular tests and production build, then publishes the image.
4. Only after publishing succeeds, ghcr.yml calls the reusable cd.yml workflow.
5. Your Windows runner checks out that same commit and deploys its SHA-tagged
   image with Helm into the matching namespace.
6. CD waits for readiness and verifies the exact deployed image.

The existing publishing job is connected with `needs: publish`. CD is a local
reusable workflow, loaded from the caller's commit; the file does not need to be
on main first. Features and PRs do not deploy. Production automation comes later.

## Runner and cluster prerequisites

- The frontend repository's runner is restaurant-frontend-local, installed in
  C:\Users\User\actions-runner-frontend, using labels self-hosted, Windows, X64.
- Keep its run.cmd terminal and Docker Desktop Kubernetes running.
- The runner uses your Windows user's installed Helm 4, kubectl, and kubeconfig.
- Both target namespaces contain a valid ghcr-pull registry Secret.
- Each target branch must contain the chart and Docker/Nginx files before pushing.
  Merge the prerequisite feature branches into testing before CD.
- Both backend Kubernetes Services exist as restaurant-menu:8081 and
  restaurant-order:8082 in the target namespace. The selected values file supplies these
  addresses to Nginx when the container starts.

The workflow selects docker-desktop explicitly for cluster operations and uses
Windows PowerShell. It does not commit kubeconfig or token values. Keep this
runner for trusted code only; deployment is limited to development/testing pushes.

## Image selection and rollback

Helm receives `--set-string image.tag=sha-<published-commit>`, overriding the old
manually pinned tag for this deployment without rewriting the values file. Each
run selects the frontend image built from that exact commit. Chart.yaml versions
the deployment configuration; increment it when chart configuration changes.
This push-triggered pipeline does not require a Git release tag.

Helm 4 uses rollback-on-failure to restore an earlier release on a failed upgrade.
The frontend has no database volume. Backend data is unaffected by this chart's
deployment, but rollback is not a database backup mechanism.

If the runner goes offline, deployment jobs wait; already running applications
continue while Docker Desktop runs. Build/test and publishing use GitHub-hosted
Ubuntu runners and do not need your laptop.

## Verify

On GitHub, open the latest Publish frontend image run. Build and publish should
finish before Deploy development or Deploy testing runs on your frontend runner.

```powershell
kubectl --context docker-desktop --namespace development get pods
kubectl --context docker-desktop --namespace development get deployment restaurant-frontend -o 'jsonpath={.spec.template.spec.containers[0].image}'
```

If an earlier port-forward disconnected after the Pod was replaced, restart it:

```powershell
kubectl --context docker-desktop --namespace development port-forward service/restaurant-frontend 14200:80
```

Open http://localhost:14200 and confirm categories, dishes, and orders work. The
rollout/probes verify frontend readiness; this browser check verifies the full
backend and Feign flow.

If a job is waiting, check the repository runner is online. For errors, inspect
the failed step and automatic Kubernetes diagnostics. Keep credentials private.

## Environment selection and testing

The workflow uses the target branch name to choose the namespace and values file:

| Branch      | Namespace   | Values file             | Image alias |
| ----------- | ----------- | ----------------------- | ----------- |
| development | development | values-development.yaml | development |
| testing     | testing     | values-testing.yaml     | testing     |

Both publish sha-<commit> too. Helm selects that exact SHA, not the moving alias.
A testing push builds its merged testing commit; this is not digest-preserving
promotion of the exact binary built earlier from development.

Commit/push the updated existing feature/cd branch, merge it into development and
verify it first, then merge the required features directly into testing with CD
last. Do not merge development into testing. Stop on conflicts before pushing.

In both namespaces, the backend Service names are identical but resolve to
namespace-local backends, keeping the development and testing data separate.
The frontend needs both backend Services present before Nginx starts.

Check testing:

```powershell
kubectl --context docker-desktop get pods,svc -n testing
kubectl --context docker-desktop -n testing get deployment restaurant-frontend -o 'jsonpath={.spec.template.spec.containers[0].image}'
kubectl --context docker-desktop -n testing port-forward service/restaurant-frontend 24200:80
```

Open http://localhost:24200 and create a category, dish, and order. Keep the
port-forward terminal running. Development can stay accessible on 14200 through
its own separate port-forward. We chose distinct local ports to avoid a conflict.
