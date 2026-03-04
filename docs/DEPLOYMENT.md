# NXClaw — Deployment

This document describes how to build container images and deploy NXClaw to Kubernetes.

---

## 1. Overview

Deployment uses **Kustomize**. Image names and tags are set in an overlay so you can point at your own registry.

- **Build:** Build API and Portal images from `apps/api` and `apps/portal` (Docker or GitHub Actions).
- **Push:** Push to a registry your cluster can pull from (e.g. GHCR, Docker Hub, ACR, GCR).
- **Deploy:** `kubectl apply -k infra/overlays/default` (after setting images in the overlay).

---

## 2. Build images

From the repository root, with Docker available:

```bash
docker build -t <REGISTRY>/nxclaw-api:latest ./apps/api
docker build -t <REGISTRY>/nxclaw-portal:latest ./apps/portal
```

Replace `<REGISTRY>` with your registry (e.g. `ghcr.io/myorg`, `docker.io/myuser`, `myregistry.azurecr.io`).

---

## 3. Push images

```bash
docker push <REGISTRY>/nxclaw-api:latest
docker push <REGISTRY>/nxclaw-portal:latest
```

Ensure the cluster’s node identity can pull from the registry (imagePullSecrets if private).

---

## 4. Set image in Kustomize overlay

Edit `infra/overlays/default/kustomization.yaml` and set `newTag` and (if needed) `newName` so they match what you pushed, for example:

```yaml
images:
  - name: nxclaw-api
    newName: ghcr.io/myorg/nxclaw-api
    newTag: latest
  - name: nxclaw-portal
    newName: ghcr.io/myorg/nxclaw-portal
    newTag: latest
```

Or set once via:

```bash
cd infra/overlays/default
kustomize edit set image nxclaw-api=<REGISTRY>/nxclaw-api:latest
kustomize edit set image nxclaw-portal=<REGISTRY>/nxclaw-portal:latest
```

---

## 5. Deploy to Kubernetes

**5.1 Create namespace (if not already present)**

```bash
kubectl apply -f infra/base/namespace.yaml
```

**5.2 Apply the full stack (Postgres, API, Portal)**

```bash
kubectl apply -k infra/overlays/default
```

**5.3 (Optional) Use a private registry**

Create a pull secret and reference it in the overlay’s `patches` or in the Deployment specs:

```bash
kubectl create secret docker-registry regcred \
  --docker-server=<REGISTRY> \
  --docker-username=<USER> \
  --docker-password=<TOKEN> \
  -n nxclaw
```

Then add `imagePullSecrets: [name: regcred]` to the API and Portal deployments (e.g. via a patch in the overlay).

---

## 6. Verify

```bash
kubectl get pods -n nxclaw
kubectl get svc -n nxclaw
```

Portal is exposed via the LoadBalancer service `nxclaw-portal`. Use its EXTERNAL-IP (or hostname) in the browser. Default login: **admin** / **admin** (see [LOGIN-DETAILS.md](LOGIN-DETAILS.md)).

---

## 7. Option A — GitHub Actions (build and push to GHCR)

If the repo is on GitHub:

1. **Push to `main`** or run the workflow manually: **Actions → Build and push NXClaw images → Run workflow**.
2. After the run completes, the job summary shows the image URLs (`ghcr.io/<owner>/nxclaw-api:latest` and `nxclaw-portal:latest`).
3. **Set the overlay** to that owner (replace `REPO_OWNER` in the overlay once):
   - **Windows:** `.\scripts\set-registry.ps1 -Owner <YOUR_GITHUB_ORG_OR_USER>`
   - **Unix:** `./scripts/set-registry.sh <YOUR_GITHUB_ORG_OR_USER>`
   Use the same value as in the image URL (e.g. `DaemonBehr` if images are `ghcr.io/DaemonBehr/...`).
4. **Deploy:** `kubectl apply -k infra/overlays/default`
5. Get Portal URL: `kubectl get svc nxclaw-portal -n nxclaw` — use EXTERNAL-IP. Login: **admin** / **admin**.

No extra secrets are needed for GHCR when the repo is on GitHub; `GITHUB_TOKEN` can push packages for the same repo.

---

## 8. References

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [APPLICATION.md](APPLICATION.md)
- [LOGIN-DETAILS.md](LOGIN-DETAILS.md)
