# Automatic frontend development deployment

## Sequence

1. Work on a feature branch from main, commit it, and push the feature.
2. Check out development, pull, merge the feature, and push development.
3. Frontend CI runs separately. The GHCR workflow builds the Dockerfile, which
   also runs the Angular tests and production build, then publishes the image.
4. Only after publishing succeeds, ghcr.yml calls the reusable cd.yml workflow.
5. Your Windows runner checks out that same commit and deploys its SHA-tagged
   image with Helm into the development namespace.
6. CD waits for readiness and verifies the exact deployed image.

The existing publishing job is connected with `needs: publish`. CD is a local
reusable workflow, loaded from the caller's commit; the file does not need to be
on main before it works on development. Features and PRs do not deploy. Testing
and production automation will be added later.

## Runner and cluster prerequisites

- The frontend repository's runner is restaurant-frontend-local, installed in
  C:\Users\User\actions-runner-frontend, using labels self-hosted, Windows, X64.
- Keep its run.cmd terminal and Docker Desktop Kubernetes running.
- The runner uses your Windows user's installed Helm 4, kubectl, and kubeconfig.
- The development namespace contains the ghcr-pull image registry Secret.
- The frontend chart is already in development, along with the Docker/Nginx
  files. This feature edits the GHCR workflow but does not duplicate those files.
- Both backend Kubernetes Services exist as restaurant-menu:8081 and
  restaurant-order:8082. The frontend's values-development.yaml supplies these
  addresses to Nginx when the container starts.

The workflow selects docker-desktop explicitly for cluster operations and uses
Windows PowerShell. It does not commit kubeconfig or token values. Keep this
runner for trusted code only; deployment is limited to development pushes.

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
finish before Deploy development runs on your frontend runner.

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
