# Publishing the frontend to GHCR

The `.github/workflows/ghcr.yml` workflow runs after a push to `development`,
including a locally merged feature. Pushing `feature/ghcr` alone does not run it.

The workflow logs in with GitHub's automatic `GITHUB_TOKEN`, then builds the
Docker image. The Dockerfile runs Angular tests and the production build, then
packages the compiled files with Nginx. Only successful builds are published.
No custom password or personal access token is needed for this workflow.

The Dockerfile, `.dockerignore`, and Nginx configuration already exist in
`development`. They are not duplicated in this feature branch.

Published tags:

```text
ghcr.io/igli31/restaurant-frontend:development
ghcr.io/igli31/restaurant-frontend:sha-<full-commit-sha>
```

The `development` tag points to the latest published development build; the SHA
tag identifies an exact source commit. Helm will select the image version later.
Publishing does not deploy or change your running local containers.

After merging and pushing to development, open GitHub Actions and check
**Publish frontend image → Build and publish**. After success, the image is
available through GitHub Packages. New GHCR packages are private by default;
pulling them locally or in Kubernetes requires registry authentication.

Testing and production publishing will be introduced later. If a push fails with
a permissions error, check repository/organization Actions policies and whether
an existing package grants this repository Actions access.

Reference: [GitHub package publishing](https://docs.github.com/en/packages/managing-github-packages-using-github-actions-workflows/publishing-and-installing-a-package-with-github-actions).
