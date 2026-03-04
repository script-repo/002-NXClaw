# NXClaw — Login details

## Portal URL (LoadBalancer)

**Base URL:** `http://x.x.x.x.x`

Use this in your browser once the Portal pod is running (see below).

---

## Default credentials

| Field     | Value   |
|----------|---------|
| **Username** | `admin` |
| **Password** | `admin` |

The API seeds this user on first startup (when it can connect to Postgres). To override, set `ADMIN_USERNAME` and `ADMIN_PASSWORD` on the `nxclaw-api` deployment before the first run.

---

## Current deployment status

- **Namespace:** `nxclaw` — created  
- **Postgres:** Deployed; pod should become Ready after the volume permission fix.  
- **API:** Deployment applied; pod is in **ErrImagePull** until the image `nxclaw-api:latest` is available in the cluster (build and push or load; see [DEPLOY-K8S.md](DEPLOY-K8S.md)).  
- **Portal:** Deployment applied; pod is in **ErrImagePull** until the image `nxclaw-portal:latest` is available (see [DEPLOY-K8S.md](DEPLOY-K8S.md)).  
- **LoadBalancer:** Service `nxclaw-portal` has **EXTERNAL-IP** `x.x.x.x` (port 80).

After you build and push (or load) the API and Portal images so the pods run:

1. Open **http://x.x.x.x** in a browser.  
2. Log in with **admin** / **admin**.
