# NXClaw — SPARC Refinement Plan (Phase 3)

**Artifact:** Refinement / TDD implementation plan  
**Project:** NXClaw (002-NXClaw)  
**Phase:** 3 — Refinement  
**Status:** Approved — ready to implement  
**Spec:** [NXClaw-SPECIFICATION.md](NXClaw-SPECIFICATION.md) | **Architecture:** [NXClaw-ARCHITECTURE.md](NXClaw-ARCHITECTURE.md)

---

## 1. Repo and structure

- **One repo**, monorepo layout.
- **Tool:** npm workspaces (no extra tooling).
- **Layout (target):**
  ```
  apps/
    api/          # Backend API (Node/TypeScript)
    portal/       # Portal web app (admin + tenant)
    chat-ui/      # Chat Web UI
  packages/
    ui/           # Shared component library (Portal + Chat UI)
    shared/       # Shared types, constants, config (optional)
  infra/          # K8s manifests, Helm values (or charts/)
  docs/
  config/
  scripts/
  ```
- Code under `apps/*`, `packages/*`; tests colocated or in `apps/*/tests` / `**/*.test.ts`; no app code in project root.

---

## 2. Implementation order

All components deployed to Kubernetes using the **Kubernetes MCP server** (Cursor).

| Step | Component | Deliverable |
|------|-----------|-------------|
| **A** | Backend API | Auth (simple user in DB), agent config CRUD, chat persistence, proxy to agent; Postgres + pgVector (PVC). |
| **B** | Portal | Admin + tenant areas; local auth; manage Nanoclaw (config/status); same shared UI library. |
| **C** | K8s + Nanoclaw | One Nanoclaw agent deployed (Helm or manifest); PVC; in tenant namespace; NAI endpoint configured. |
| **D** | Chat Web UI | Send message, show response via API; same shared UI library; request/response. |

Deploy via MCP: apply manifests or Helm from this repo (e.g. `infra/` or `charts/`).

---

## 3. Nanoclaw and NAI

### Nanoclaw
- **Source:** [github.com/qwibitai/nanoclaw](https://github.com/qwibitai/nanoclaw)
- **Stack:** Node.js 20+, single process; SQLite; agents run in Docker (or container). Claude Agent SDK.
- **Custom inference:** Set `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN` (or equivalent) to point at an Anthropic/OpenAI-compatible endpoint (NAI).
- **K8s:** No official Helm chart in repo; we build a container image from the repo and deploy (e.g. one Deployment + PVC for SQLite/data). Agent container spawning may need adaptation for K8s (document in step C).

### NAI
- **Status:** Base URL and auth available (e.g. API key in K8s secret).
- **Use:** Configure Nanoclaw (and any backend proxy) to use NAI as OpenAI-compatible endpoint.

---

## 4. Backend API

- **Runtime:** Node.js with **TypeScript**; keep stack consistent across repo.
- **Framework:** Express or Fastify (pick one and stick with it).
- **Auth (V1):** Simple username/password stored in DB (hashed); session or JWT for API calls.
- **Responsibilities:** User auth; agent config CRUD; inference endpoint config; chat session create/list; chat message send (proxy to Nanoclaw) and persist response; read/write Postgres and pgVector.

---

## 5. Front-end

- **Goal:** Small, fast, visually stunning; modern web aesthetics and techniques.
- **Shared:** One component library (`packages/ui`) used by both Portal and Chat UI.
- **Portal:** Admin area + tenant area; login; manage Nanoclaw instance (config, status).
- **Chat UI:** Chat interface only; send message, display response (request/response).
- **Stack:** Choose one SPA stack (e.g. Vite + React, or Svelte/Vue) and use for both apps; keep bundles small and UX polished.

---

## 6. Tests

- **Scope:** Whatever validates **core functionality** for V1.
- **Suggested minimum:**
  - **API:** Integration tests for auth (login, protected routes), agent config CRUD, chat send/response and persistence.
  - **Core logic:** Unit tests for auth helpers, validation, chat proxy logic.
- **Tool:** Jest or Vitest for Node/API; same or Playwright for front-end if needed. No existing test setup in repo; add in step A for API.

---

## 7. V1 success / “production-ready in 2 days”

- **Target:** **Deployable** — all pieces run in Kubernetes, one end-to-end flow works.
- **Flow:** User logs in (Portal) → configures/manages Nanoclaw (Portal) → opens Chat UI → sends message → agent (Nanoclaw) responds via NAI → response shown in Chat UI; data persisted (Postgres/pgVector, PVC).
- **Deployment:** Via Kubernetes MCP server from this repo (manifests or Helm under `infra/` or `charts/`).

---

## 8. TDD approach per step

### Step A — Backend API
1. **Test first:** Auth (login returns token, invalid credentials 401); agent config (create/read/update); chat (post message, get history).
2. **Implement:** DB schema (users, tenants, agent_config, inference_endpoints, chat_sessions, messages); API routes; proxy to Nanoclaw endpoint.
3. **Refactor:** Keep handlers under 500 lines; typed interfaces for public API.

### Step B — Portal
1. **Test first:** (Optional) critical path E2E or component tests for login and agent config screen.
2. **Implement:** Login page; admin/tenant layout; agent config form and status view; use `packages/ui`.
3. **Refactor:** Reuse UI components; small bundle.

### Step C — K8s + Nanoclaw
1. **Test first:** (Optional) smoke test — pod starts, health endpoint or SQLite present.
2. **Implement:** Dockerfile for Nanoclaw (from repo); K8s Deployment + PVC; ConfigMap/Secret for NAI; namespace(s) per architecture; deploy via MCP.
3. **Refactor:** Clear separation portal NS vs tenant NS; one agent Deployment + PVC.

### Step D — Chat Web UI
1. **Test first:** (Optional) submit message, mock API returns response, UI shows it.
2. **Implement:** Chat view; call API to send message and fetch response; display in UI; use `packages/ui`.
3. **Refactor:** Same design system as Portal; request/response only.

---

## 9. Acceptance criteria checklist (V1)

- [ ] **A** Backend API runs in K8s; local user auth (simple user in DB); agent config and inference endpoint config CRUD; chat persistence; proxy to Nanoclaw.
- [ ] **B** Portal runs in K8s (own namespace); admin + tenant areas; login; manage Nanoclaw instance (config/status).
- [ ] **C** One Nanoclaw agent runs in K8s (tenant namespace); PVC for data; NAI configured as inference endpoint.
- [ ] **D** Chat Web UI runs in K8s; user can send message and see agent response (via API → Nanoclaw → NAI).
- [ ] End-to-end: login → manage agent → chat → response persisted; all deployed via Kubernetes MCP.

---

## 10. References

- [NXClaw-SPECIFICATION.md](NXClaw-SPECIFICATION.md)
- [NXClaw-ARCHITECTURE.md](NXClaw-ARCHITECTURE.md)
- [Nanoclaw](https://github.com/qwibitai/nanoclaw) — containerized agents, Node 20+, Claude Agent SDK, custom endpoint via env.

---

*Next: Phase 4 — Review (after implementation); Phase 5 — Completion (docs, knowledge capture).*
