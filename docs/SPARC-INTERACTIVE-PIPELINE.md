# Interactive SPARC Development Pipeline

Use this as your running checklist. Work through each phase in order; in Cursor chat you can say which phase you're on and what you're building so the assistant can run the right SPARC mode (when Ruflo MCP is available) or guide CLI steps.

---

## Session status

- **Swarm**: Initialized (hierarchical, max 8 agents, strategy: development).
- **Agent**: One coder agent spawned for implementation.
- **Config**: [.claude-flow/config.yaml](../.claude-flow/config.yaml) — memory, neural, and hooks enabled.

---

## Phase 1 — Specification

**Goal:** Define requirements, constraints, and success criteria.

**In Cursor chat (with Ruflo MCP):**  
*"Run SPARC specification phase for [your feature or goal]. Use researcher/analyzer to gather requirements and constraints."*

**MCP (if available):**
```javascript
mcp__claude-flow__sparc_mode {
  mode: "researcher",
  task_description: "Gather requirements and constraints for [YOUR FEATURE]",
  options: { depth: "comprehensive", citations: true }
}
```

**CLI fallback:**
```bash
npx @claude-flow/cli@latest memory store "sparc/spec/<feature>" "Requirements: ..." --namespace sparc
```
(Or describe requirements in chat and ask the assistant to store them in memory.)

**Done when:** Requirements and success criteria are written (e.g. in `docs/` or memory).

---

## Phase 2 — Architecture

**Goal:** Design system structure, components, and interfaces.

**In Cursor chat:**  
*"Run SPARC architecture phase for [your feature]. Design components and interfaces."*

**MCP:**
```javascript
mcp__claude-flow__sparc_mode {
  mode: "architect",
  task_description: "Design architecture for [YOUR FEATURE]",
  options: { memory_enabled: true, detailed: true }
}
```

**CLI fallback:**  
Describe the design in chat; ask the assistant to store it (e.g. `memory store "sparc/arch/<feature>" "..."`) and to keep files under 500 lines and under `src/`, `tests/`, `docs/`, etc.

**Done when:** You have a clear design (modules, APIs, boundaries) and it’s stored in memory or in `docs/`.

---

## Phase 3 — Refinement (TDD)

**Goal:** Implement with test-first: failing test → minimal code → pass → refactor.

**In Cursor chat:**  
*"Run SPARC refinement/TDD for [your feature]. Write tests first, then implement in src/ and tests/."*

**MCP:**
```javascript
mcp__claude-flow__sparc_mode {
  mode: "tdd",
  task_description: "Implement [YOUR FEATURE] with tests in tests/, code in src/",
  options: { coverage_target: 90, test_framework: "jest" }
}
```

**CLI:**  
Coder agent is already spawned. Use chat to request concrete edits (new files, tests, refactors) so the assistant applies changes in this repo.

**Done when:** Feature is implemented, tests exist and pass, and refactor step is done.

---

## Phase 4 — Review

**Goal:** Code quality, security, and performance review.

**In Cursor chat:**  
*"Run SPARC review phase for [your feature]. Check security, performance, and quality."*

**MCP:**
```javascript
mcp__claude-flow__sparc_mode {
  mode: "reviewer",
  task_description: "Review [YOUR FEATURE] implementation",
  options: { security_check: true, performance_check: true, test_coverage_check: true }
}
```

**CLI:**
```bash
npm test
npm run lint
npx @claude-flow/cli@latest security scan
```

**Done when:** Review feedback is addressed and builds/tests/lint pass.

---

## Phase 5 — Completion

**Goal:** Integrate, document, and capture knowledge.

**In Cursor chat:**  
*"Run SPARC completion phase for [your feature]. Document API and update docs."*

**MCP:**
```javascript
mcp__claude-flow__sparc_mode {
  mode: "documenter",
  task_description: "Document [YOUR FEATURE] API and usage in docs/"
}
mcp__claude-flow__memory_usage {
  action: "store",
  key: "sparc/completed/<feature>",
  value: "Summary of what was built and where",
  namespace: "sparc"
}
```

**Done when:** Docs are updated, memory has a short summary, and the feature is ready to ship.

---

## Quick reference

| Phase        | Modes (pick one or combine) | Cursor prompt idea |
|-------------|------------------------------|--------------------|
| Specification | researcher, analyzer         | "SPARC spec phase for X" |
| Architecture  | architect, designer          | "SPARC arch phase for X" |
| Refinement    | tdd, coder, tester           | "SPARC TDD for X" |
| Review        | reviewer, optimizer, debugger | "SPARC review for X" |
| Completion   | documenter, memory-manager  | "SPARC completion for X" |

---

## Notes

- **One message = batch ops:** When using MCP, batch `swarm_init`, `agent_spawn`, `sparc_mode`, and `TodoWrite` in a single message where possible.
- **File layout:** Use `src/`, `tests/`, `docs/`, `config/`, `scripts/`, `examples/`; never write to project root.
- **Swarm:** To spawn more agents: `npx @claude-flow/cli@latest agent spawn --type <type>`. Types include coder, coordinator, researcher, etc. (see `agent spawn --help`).
- **Swarm status:** `npx @claude-flow/cli@latest swarm status` or `agent list`.
