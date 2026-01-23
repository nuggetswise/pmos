Below is a **PM_OS Hooks Design Spec v1**, written the way a senior AI / platform engineer would expect to see it in-repo.
It is intentionally *boring, explicit, and reviewable*. That’s a feature.

You can drop this almost verbatim into `docs/hooks-design-spec.md` if you want.

---

# PM_OS Hooks Design Spec v1

## Status

**Draft – v1**

## Audience

PM_OS maintainers and contributors
(Assumes familiarity with PM_OS skills, workflows, and history concepts)

---

## 1. Purpose

Hooks in PM_OS exist to **reduce cognitive load through deterministic automation**, not to perform reasoning or decision-making.

They provide:

* lifecycle-driven automation
* hygiene and maintenance tasks
* observability and signaling
* guardrails against silent drift

Hooks are a **supporting subsystem**, not a core intelligence layer.

---

## 2. Non-Goals (Explicit)

Hooks MUST NOT:

* make product or strategy decisions
* rewrite user-authored artifacts (PRDs, decisions, conclusions)
* call LLMs for reasoning or synthesis
* block user workflows
* run implicitly without traceability

If a task requires judgment, synthesis, or creativity, it belongs in a **skill**, not a hook.

---

## 3. Design Principles

### 3.1 Determinism over cleverness

Hooks must run based on **explicit lifecycle events**, never on probabilistic or LLM-driven triggers.

### 3.2 Separation of concerns

* **Skills**: deliberate, user-invoked reasoning
* **Hooks**: ambient, automatic maintenance

Hooks may *invoke* skills, but skills must never auto-register hooks.

---

### 3.3 Explainability

A hook must be understandable **without executing it**.

At minimum, a reader should be able to answer:

* When does this hook run?
* Why does it exist?
* What does it read?
* What does it write?
* What happens if it fails?

---

### 3.4 Non-blocking by default

Hooks must be:

* asynchronous
* best-effort
* failure-tolerant

A hook failure must never block a user workflow.

---

## 4. Hook Taxonomy

PM_OS hooks are categorized by **trigger type**, not by implementation.

### 4.1 Lifecycle Hooks

Triggered by PM_OS workflow events.

Examples:

* `workflow:started`
* `workflow:completed`
* `session:startup`
* `session:shutdown`

Use cases:

* indexing
* summaries
* state capture
* cleanup

---

### 4.2 Time-based Hooks

Triggered on a schedule.

Examples:

* `time:daily`
* `time:weekly`

Use cases:

* staleness detection
* drift checks
* reminders

---

### 4.3 Guardrail Hooks

Triggered on invariant checks.

Examples:

* missing evidence
* incomplete outputs
* malformed artifacts

Use cases:

* signaling issues (not fixing them)
* surfacing warnings

---

## 5. Event Model

All hooks subscribe to a **finite, typed event set**.

### 5.1 Canonical Events (v1)

```ts
type HookEvent =
  | "session:startup"
  | "session:shutdown"
  | "workflow:started"
  | "workflow:completed"
  | "output:created"
  | "history:written"
  | "time:daily"
  | "time:weekly"
```

New events require explicit review and documentation.

---

## 6. Hook Structure

Hooks are implemented as **TypeScript modules** with explicit metadata.

### 6.1 File Structure

```
hooks/
├─ lifecycle/
│  └─ afterVoc.ts
├─ time/
│  └─ weeklyStaleness.ts
├─ guardrails/
│  └─ missingEvidence.ts
```

---

### 6.2 Required Hook Interface

```ts
export const meta = {
  id: string,
  trigger: HookEvent,
  intent: string,
  guarantees: string[],
  scope: {
    read: string[],
    write: string[]
  }
}

export async function run(ctx: HookContext): Promise<void>
```

---

### 6.3 Metadata Requirements

* **id**: globally unique
* **trigger**: one of the canonical events
* **intent**: human-readable explanation
* **guarantees**: e.g. `non-blocking`, `idempotent`
* **scope**: declared read/write boundaries

Hooks without metadata are invalid.

---

## 7. Scope & Safety

Hooks must declare **what they touch**.

### 7.1 Scope Rules

* Hooks may only read/write declared paths
* Violations must be logged
* Enforcement may start as soft (warnings), hard later

This enables:

* auditability
* trust
* future sandboxing

---

## 8. Execution Model

### 8.1 Invocation

Hooks are invoked by a central hook runner:

```ts
runHooks(event, context)
```

### 8.2 Failure Handling

* Errors are caught
* Failures are logged
* Execution continues

Hooks must be **idempotent** whenever possible.

---

## 9. Observability

Every hook execution must record:

* hook id
* trigger event
* timestamp
* status (success / failure)
* error summary (if any)

This aligns with the **daemon writes, startup reads** pattern.

---

## 10. Comparison to External Systems

### Claude Code Hooks

* synchronous
* blocking
* tool-intercepting
* shell-based

PM_OS hooks intentionally **do not** adopt these traits.

### Personal AI Infrastructure (PAI)

* TS-first
* lifecycle-driven
* explicit orchestration

PM_OS aligns closely with PAI, with additional constraints for safety and explainability.

---

## 11. v1 Constraints (Intentional)

In v1:

* No YAML / JSON config files
* No UI-based hook editing
* No hook chaining
* No LLM calls inside hooks

These may be revisited only after hooks prove stable and trustworthy.

---

## 12. Success Criteria

Hooks are successful if:

* they are boring
* they are predictable
* they reduce cognitive load
* they never surprise the user

A hook that causes a user to ask

> “Why did this run?”
> is considered a failure.

---

## 13. Future Considerations (Out of Scope for v1)

* declarative hook registries
* permission enforcement
* hook dry-runs
* visualization of automation graph

---

**End of Spec – PM_OS Hooks Design v1**


