# Algorithm-Driven PM OS: Story-First Plan (10/10 Automation)

## Goal

Make PM OS feel effortless for daily work while keeping quarterly roadmap bets rigorous, traceable, and verifiable.

## What 10/10 Looks Like

- Roadmap initiatives feel like a connected system, not a pile of docs.
- Daily tasks stay fast, but nothing important gets lost or unlinked.
- Phase changes are gated by evidence, not opinions.
- Session start shows only the gaps that matter.
- System upgrades never overwrite personal or company context.

## A Lead PM Story (How It Feels)

You start your day, and PM OS shows two items: one initiative is blocked by missing baseline data, and one decision needs a review date. You spend 10 minutes fixing those. Then you skim Jira, tag two tasks to an initiative, and close a small bug with a quick note. In the weekly review, you move the initiative from OBSERVE to THINK because the evidence is complete. At month end, you measure outcomes and capture what you learned, so next quarter gets smarter.

This is the goal: speed for tasks, discipline for bets.

## Two Loops, One OS

### A) Initiative Loop (Quarterly / Roadmap Bets)

An initiative is a quarterly, outcome-focused workstream (a roadmap or charter-level bet) with a clear goal, measurable criteria, and a lifecycle that moves through phases. It is not a task list. It is the spine that all related artifacts attach to.

In PM OS terms:
- The initiative maps to a charter in `outputs/roadmap/`.
- Execution artifacts (PRDs) live in `outputs/delivery/prds/`.
- Decisions, stakeholders, open questions, and truth base items attach to the same `initiative_id`.

Example initiative:
- Title: "Q2 Initiative: Reduce onboarding cycle time from 6 weeks to 2 weeks"
- Why it matters: revenue velocity, CS load, customer satisfaction
- Success criteria: cycle time 42 days -> 14 days, rework rate 30% -> <10%
- Linked artifacts: truth base claims, stakeholder map, open questions, decision log, charter, PRDs
- Lifecycle: OBSERVE -> THINK -> PLAN -> EXECUTE -> VERIFY -> LEARN

### B) Task Micro-Loop (Daily Work)

A lightweight loop for Jira tasks, user stories, bugs, and small requests. It is optimized for speed, not heavy phase gating.

Micro-loop steps (30-90 seconds):
- CAPTURE: what is it, link, who asked
- CLARIFY: what "done" means, owner, next step
- CLOSE: decision/result, update truth base if it created a fact

Example task:
- Task: "Bug: Catalog sync fails when item has 200+ variants"
- Capture: Jira `BN-1421`, asked by Support lead
- Clarify: done = repro + root cause + ETA, owner = Eng A, next step = gather logs
- Close: fix merged, decision = add variant limit guardrail, update truth base claim about sync limits

## Cadence (User Flow)

### Daily
- Session start shows initiative health (automatic).
- Update the active initiative spine: phase checklist, next actions, open questions.
- Triage Jira tasks using the micro-loop; add `initiative_id` when relevant.

Example (Daily):
- Initiative: "Reduce onboarding cycle time"
- Update OBSERVE checklist: "Pulled timestamps for last 50 onboardings"
- Add open question: "What % of delays come from legal/security?"

### Weekly
- Run `/initiative-review` for active initiatives.
- Clear overdue `review_by` dates.
- Confirm open questions have owners and due dates.

Example (Weekly):
- Move OBSERVE -> THINK after baseline data is complete.
- Add stakeholder note: "Ops lead wants automation before policy change."

### Monthly
- Run `/initiative-audit` (alias for `/initiative-review --deep`).
- Demote stale initiatives to warm/cold.
- Archive closed initiatives to `history/initiatives/`.

Example (Monthly):
- If execution complete, move to VERIFY and measure cycle time.
- If target met, move to LEARN and capture lessons.

### Quarterly
- Tie initiatives to charter updates.
- Close or re-scope initiatives with actual results.
- Feed verified learnings into `.claude/rules/learned/`.

## User vs System Boundary (High Value)

System (Upgradeable): `skills/`, `commands/`, `.claude/rules/`, `hooks/`, `scripts/`, templates.
User (Protected): `inputs/context/`, `outputs/` (non-templates), `history/`, any `private/`.

Add a **User vs System** section to `inputs/README.md` to keep upgrades safe and personal context protected.

## How the System Works (High Level)

- Every initiative has a spine file with required fields and links.
- Every output that belongs to a roadmap bet includes `initiative_id`.
- Automation scripts keep a registry and flag missing links.
- Phase gates prevent advancing without evidence.
- Session start shows a short, actionable health summary.

## Implementation Plan (Phased)

### Phase 0: Boundary and Rules
- Add User vs System section to `inputs/README.md`.
- Add initiative metadata fields to `.claude/rules/pm-core/output-metadata.md`.

### Phase 1: Spine and Registry
- Create `outputs/initiatives/TEMPLATE.md`.
- Create `outputs/initiatives/index.md` (auto-managed registry).

### Phase 2: Automation
- Add `scripts/initiative-sync.sh`.
- Add `scripts/initiative-gate.sh`.
- Generate `alerts/initiative-health.md`.

### Phase 3: Hook Integration
- Update `hooks/session-start.sh` to run sync and surface alerts.

### Phase 4: Skill Integration
- Require `initiative_id` in:
  - `skills/generating-quarterly-charters/SKILL.md`
  - `skills/tracking-decisions/SKILL.md`
  - `skills/writing-plans/SKILL.md`
  - `skills/executing-plans/SKILL.md`

### Phase 5: Commands
- Add `/new-initiative`, `/advance-initiative`, `/initiative-review`, `/initiative-close`.

## Appendix A: File and Script Roles

### Files
- `outputs/initiatives/TEMPLATE.md`: initiative spine definition (phase checklist + required fields).
- `outputs/initiatives/index.md`: registry generated by `initiative-sync` for review.
- `alerts/initiative-health.md`: output of `initiative-sync`; list of gaps and stale items.
- `.claude/rules/pm-core/output-metadata.md`: enforces required frontmatter fields.
- `inputs/context/my-context.md`: role/priorities that anchor OBSERVE/THINK.
- `outputs/roadmap/*.md`: quarterly charters mapped to `initiative_id`.
- `outputs/delivery/prds/*.md`: PRDs that execute the initiative.
- `outputs/open-questions.md`: initiative-linked unknowns and dependencies.
- `outputs/decisions/*.md`: phase-based decisions tied to `initiative_id`.
- `outputs/stakeholders/*.md`: stakeholder context tied to `initiative_id`.

### Scripts
- `scripts/initiative-sync.sh`: scans outputs, updates registry, generates health alerts.
- `scripts/initiative-gate.sh`: enforces phase readiness before transitions.

### Hooks and Commands
- `hooks/session-start.sh`: runs `initiative-sync` and surfaces alerts.
- `/new-initiative`: create a spine file from `TEMPLATE.md`.
- `/advance-initiative`: run gate checks, then update phase.
- `/initiative-review`: weekly review to update `review_by` and status.
- `/initiative-close`: close initiative and move to history.

## Appendix B: Phase Gates (Minimum)

- OBSERVE -> THINK requires baseline evidence and open questions logged.
- THINK -> PLAN requires success criteria defined and stakeholders linked.
- PLAN -> EXECUTE requires a decision log entry and risks noted.
- EXECUTE -> VERIFY requires completion evidence and metric sources.
- VERIFY -> LEARN requires results captured and a lesson noted.

## Appendix C: Task Micro-Loop Prompts (Optional)

- CAPTURE: "What is it? Link? Who asked?"
- CLARIFY: "What does done mean? Who owns it? Next step?"
- CLOSE: "What happened? What decision/result? Any new fact for truth base?"
