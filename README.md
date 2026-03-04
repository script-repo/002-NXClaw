# NXClaw

Autonomous agent fleet platform based on [Nanoclaw](https://github.com/qwibitai/nanoclaw): centralized portal for managing agents in Kubernetes with configurable inference (e.g. Nutanix Enterprise AI).

## Docs

| Document | Purpose |
|----------|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, components, API, deployment topology |
| [docs/APPLICATION.md](docs/APPLICATION.md) | What the app does, run locally, configuration |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Build images, push to registry, deploy to Kubernetes |
| [docs/LOGIN-DETAILS.md](docs/LOGIN-DETAILS.md) | Portal URL and default credentials after deploy |

## Quick start (local)

```bash
npm install
npm run build --workspaces --if-present
# Start Postgres, then:
export DATABASE_URL=postgresql://user:pass@localhost:5432/nxclaw
npm run dev -w apps/api &
VITE_API_URL=http://localhost:3000 npm run dev -w apps/portal
# Open http://localhost:5174 — login admin / admin
```

## Deploy to Kubernetes

1. Build and push images (see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)), or run the [GitHub Actions workflow](.github/workflows/build-push.yaml) (push to `main` or trigger manually).
2. Set your registry in `infra/overlays/default/kustomization.yaml` (edit `newName` for API and Portal).
3. Deploy: `kubectl apply -k infra/overlays/default`
4. Get Portal URL: `kubectl get svc nxclaw-portal -n nxclaw` — use EXTERNAL-IP. Login: **admin** / **admin**.

## Repo layout

- **apps/api** — Backend API (Node, Express, TypeScript)
- **apps/portal** — Portal SPA (Vite, React)
- **apps/chat-ui** — Chat Web UI (scaffold)
- **packages/ui** — Shared UI components and design tokens
- **packages/shared** — Shared types
- **infra/base** — Kubernetes base manifests
- **infra/overlays/default** — Kustomize overlay (image registry/tag)
