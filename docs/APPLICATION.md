# NXClaw — Application overview

This document describes what the application does, how to run it locally, and how it is configured.

---

## 1. What NXClaw does

- **Portal:** Web UI for admins and tenants. Login with a local user (stored in Postgres). Manage agent configs and inference endpoints. Dashboard view of agents and status.
- **Chat UI:** Separate app for end users to send messages to the Nanoclaw agent and see responses (via the API; agent uses NAI or other OpenAI-compatible inference).
- **API:** Backend that authenticates users, stores and returns agent/inference config, persists chat sessions and messages, and proxies chat requests to the Nanoclaw agent.

V1 scope: one tenant, one admin user, one Nanoclaw agent, one inference endpoint (NAI). Multi-tenant and multiple agents come later.

---

## 2. Technology stack

| Layer   | Stack |
|--------|--------|
| Portal | Vite, React, React Router; shared `@nxclaw/ui` (design tokens, Shell, Button, Card, Input). |
| Chat UI| Same as Portal (Vite, React, `@nxclaw/ui`). |
| API    | Node.js 20+, Express, TypeScript; pg (PostgreSQL); bcryptjs, jsonwebtoken, zod. |
| DB     | PostgreSQL 16 (Alpine in K8s). |
| Runtime| Containers (Alpine-based); Portal served by nginx in production. |

---

## 3. Running locally

**Prerequisites:** Node 20+, npm, PostgreSQL (local or Docker).

**1. Install and build workspace**

```bash
cd /path/to/nxclaw
npm install
npm run build --workspaces --if-present
```

**2. Database**

Create a database and run schema + seed:

```bash
createdb nxclaw
export DATABASE_URL=postgresql://user:pass@localhost:5432/nxclaw
npm run init-db -w apps/api
```

Or use the API’s built-in init (schema + seed on first start) by pointing it at an empty DB.

**3. Start API**

```bash
export DATABASE_URL=postgresql://user:pass@localhost:5432/nxclaw
export JWT_SECRET=dev-secret
npm run dev -w apps/api
```

API listens on port 3000.

**4. Start Portal**

```bash
export VITE_API_URL=http://localhost:3000
npm run dev -w apps/portal
```

Open the URL shown (e.g. http://localhost:5174). Login: **admin** / **admin** (if you used the default seed).

**5. (Optional) Chat UI**

```bash
export VITE_API_URL=http://localhost:3000
npm run dev -w apps/chat-ui
```

---

## 4. Configuration

### API (environment)

| Variable       | Purpose |
|----------------|---------|
| DATABASE_URL   | Postgres connection string. |
| JWT_SECRET     | Secret for signing JWTs. |
| PORT           | Listen port (default 3000). |
| ADMIN_USERNAME | Override default admin username (first run only). |
| ADMIN_PASSWORD | Override default admin password (first run only). |
| NANOCLAW_URL   | Base URL of Nanoclaw instance for chat proxy. |

### Portal / Chat UI (build-time)

| Variable     | Purpose |
|--------------|---------|
| VITE_API_URL | API base URL. Use `''` when served behind nginx that proxies `/api` to the API. |

### Kubernetes

- **Secrets:** `nxclaw-postgres-secret` (DB password), `nxclaw-api-secret` (JWT_SECRET).
- **ConfigMap:** Optional for non-sensitive config.
- Images and registry are set via Kustomize (see [DEPLOYMENT.md](DEPLOYMENT.md)).

---

## 5. Key files

| Path | Purpose |
|------|---------|
| apps/api/src/index.ts | API entry; Express app; DB init and listen. |
| apps/api/src/db/schema.ts | Postgres DDL. |
| apps/api/src/routes/*.ts | Auth, agent-config, inference, chat. |
| apps/portal/src/App.tsx | Router; Login and Dashboard routes. |
| apps/portal/nginx.conf | Production: static files + proxy `/api` to API. |
| packages/ui/src/* | Shared components and CSS tokens. |

---

## 6. References

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
