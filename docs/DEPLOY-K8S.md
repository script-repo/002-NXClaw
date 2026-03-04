# NXClaw — Kubernetes deploy

## Status

- **Namespace:** `nxclaw` — created
- **Postgres:** PVC, Deployment, Service, Secret — applied (pod will run once PVC binds)
- **API:** Deployment, Service, Secret — applied (pod needs image `nxclaw-api:latest`)
- **Portal:** Deployment, LoadBalancer Service — applied (pod needs image `nxclaw-portal:latest`)

**LoadBalancer (Portal):** The service `nxclaw-portal` has been assigned an external IP by the cluster. Use that IP to open the app in a browser.

---

## Making the API and Portal run

The cluster cannot pull `nxclaw-api:latest` or `nxclaw-portal:latest` until those images are available. Use one of these options.

### Option A: Build and push to a container registry

1. **Build and tag** (run where Docker is available):

   ```bash
   docker build -t YOUR_REGISTRY/nxclaw-api:latest ./apps/api
   docker build -t YOUR_REGISTRY/nxclaw-portal:latest ./apps/portal
   docker push YOUR_REGISTRY/nxclaw-api:latest
   docker push YOUR_REGISTRY/nxclaw-portal:latest
   ```

   Replace `YOUR_REGISTRY` with your registry (e.g. `docker.io/youruser`, `gcr.io/your-project`, etc.).

2. **Point the deployments at the registry:**

   - In `infra/api.yaml`, set the API deployment container image to `YOUR_REGISTRY/nxclaw-api:latest`.
   - In `infra/portal.yaml`, set the Portal deployment container image to `YOUR_REGISTRY/nxclaw-portal:latest`.

3. **Re-apply:**

   ```bash
   kubectl apply -f infra/api.yaml -n nxclaw
   kubectl apply -f infra/portal.yaml -n nxclaw
   ```

### Option B: Kind / Minikube (local cluster)

If the cluster is Kind or Minikube and Docker is available on the same machine:

```bash
docker build -t nxclaw-api:latest ./apps/api
docker build -t nxclaw-portal:latest ./apps/portal
kind load docker-image nxclaw-api:latest nxclaw-portal:latest   # Kind
# OR
minikube image load nxclaw-api:latest nxclaw-portal:latest     # Minikube
```

Then restart the deployments so they pull the newly loaded images:

```bash
kubectl rollout restart deployment nxclaw-api nxclaw-portal -n nxclaw
```

---

## After the API and Portal are Running

1. **Get the Portal URL**  
   Run:  
   `kubectl get svc nxclaw-portal -n nxclaw`  
   Use the **EXTERNAL-IP** (or **LoadBalancer** IP) and port **80**.

2. **Open in a browser**  
   `http://<EXTERNAL-IP>`

3. **Login (default seed)**  
   The API runs DB init on startup and creates a default tenant and admin user:

   - **Username:** `admin`  
   - **Password:** `admin`  

   To override, set env `ADMIN_USERNAME` / `ADMIN_PASSWORD` on the API deployment before first run.

---

## Quick reference

| Resource        | Namespace | Purpose                    |
|----------------|-----------|----------------------------|
| nxclaw-postgres | nxclaw   | PostgreSQL (DB)            |
| nxclaw-api      | nxclaw   | Backend API (auth, config, chat) |
| nxclaw-portal   | nxclaw   | Portal UI (LoadBalancer)   |
