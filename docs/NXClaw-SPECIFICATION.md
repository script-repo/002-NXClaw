# NXClaw — SPARC Specification (Phase 1)

**Artifact:** Specification — requirements and constraints  
**Project:** NXClaw (002-NXClaw)  
**Phase:** 1 — Specification  
**Status:** Approved — ready for Architecture phase

---

## 1. Product identity (from stakeholder)

**What is NXClaw?**  
An autonomous agent fleet based on Nanoclaw. A centralized portal for managing agents in a multi-tenant environment.

**Target users:**  
Admins (tenant management, portal); tenants (agent management, chat with agents); agents run isolated in Kubernetes.

---

## 2. Goals

### Primary outcome
- **Full production-ready code in the next 2 days.**

### Must-have features / use cases (full product)
- Isolated agent environment running in Kubernetes, based on Nanoclaw.
- Ability to configure communication paths between agents for collaboration.
- Ability to designate resources, tools, MCP servers, and skills to agents.
- Configuration of inference endpoints for agents — **OpenAI-compatible; Nutanix Enterprise AI (NAI) is critical.**
- Centralized portal for admin to manage tenants; tenant view to manage agents.

---

## 3. Version 1 scope (first “done” release)

Version 1 will have:

1. **A single Nanoclaw agent deployed** (one agent, Kubernetes-based, isolated).
2. **A portal to manage the Nanoclaw instance** (deploy, configure, view status).
3. **Ability to communicate with the agent via a Web UI**, with the agent responding via an **NAI (Nutanix AI) inferencing engine.**

**Success =** One nanoclaw agent live in K8s + portal to manage it + Web UI chat that uses NAI for inference.

---

## 4. Technical constraints (from stakeholder)

### Stack and platform
- **Web-based application** (portal + Web UI for chat).
- **Run on Kubernetes** with **PVC-backed storage** for persistent data.
- **Base OS:** Rocky Linux or Ubuntu (for images/containers).
- **SQL:** PostgreSQL.
- **Vector DB:** pgVector.

### Hard limits
- Must run in Kubernetes (no “local only” as production path).
- No substitute for PostgreSQL for relational data or pgVector for vectors (per spec).

---

## 5. Requirements (structured)

### 5.1 Functional — V1

| ID   | Requirement |
|------|--------------|
| V1-1 | Deploy and run a single Nanoclaw-based agent in Kubernetes (isolated environment). |
| V1-2 | Portal (web) to manage that Nanoclaw instance (deploy, config, status). |
| V1-3 | Web UI for users to send messages to the agent and receive responses. |
| V1-4 | Agent inference via NAI (Nutanix Enterprise AI), OpenAI-compatible API. |

### 5.2 Functional — Post–V1 (must-haves for full product)

| ID   | Requirement |
|------|--------------|
| F-1  | Multi-tenant: admin manages tenants; each tenant has own view. |
| F-2  | Tenant view to manage agents (create, configure, list, remove). |
| F-3  | Configure communication paths between agents for collaboration. |
| F-4  | Designate resources, tools, MCP servers, and skills per agent. |
| F-5  | Configure inference endpoints per agent (OpenAI-compatible; NAI critical). |

### 5.3 Non-functional (project rules)

| ID  | Requirement |
|-----|-------------|
| NF1 | Files under 500 lines. |
| NF2 | Domain-Driven Design; typed interfaces for public APIs. |
| NF3 | Input validation at boundaries; path sanitization. |
| NF4 | No hardcoded secrets; no committed .env or secret files. |
| NF5 | Code under src/, tests/, docs/, config/, scripts/, examples/ — not project root. |

---

## 6. Constraints summary

| Area        | Constraint |
|------------|------------|
| Platform   | Kubernetes; PVC for persistence; Rocky or Ubuntu base. |
| Data       | PostgreSQL (SQL); pgVector (vectors). |
| App        | Web-based portal + Web UI; NAI for agent inference (OpenAI-compatible). |
| Security   | No secrets in repo; validate/sanitize at boundaries. |
| Timeline   | Production-ready code in 2 days (drives V1 scope above). |

---

## 7. Success criteria (Phase 1)

- [x] Product definition: NXClaw = Nanoclaw-based agent fleet + centralized multi-tenant portal.
- [x] Primary goal: production-ready in 2 days.
- [x] Must-have features and V1 scope recorded.
- [x] Tech stack and hard limits (K8s, Postgres, pgVector, web, NAI) documented.
- [x] Specification persisted in docs/ for Architecture phase.

---

## 8. Out of scope (this spec)

- Lab host / SSH details (see AGENTS.md).
- Claude Flow internals; only use of tooling and adherence to project rules.

---

## 9. References

- [CLAUDE.md](../CLAUDE.md) — project rules, file layout, security  
- [docs/SPARC-INTERACTIVE-PIPELINE.md](SPARC-INTERACTIVE-PIPELINE.md) — SPARC phases  

---

*Next: Phase 2 — Architecture (design system structure, components, interfaces for V1).*
