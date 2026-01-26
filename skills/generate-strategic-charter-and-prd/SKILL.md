---
name: generate-strategic-charter-and-prd
description: Creates strategic charters for quarterly planning or PRDs for feature execution.
trigger_phrases:
  - "create strategic charter"
  - "generate quarterly charters"
  - "define initiative strategy"
  - "create prd"
  - "write requirements"
---

# Skill: Generate Strategic Charter and/or PRD

## Overview
This skill produces either quarterly strategic charters (3-5 bets) or detailed PRDs (feature specifications). Charters include transparent Strategic Reasoning showing why certain initiatives were chosen. PRDs include clear requirements with success gates.

## When to Use
- **Charter:** Quarterly planning - convert VOC/KTLO/truth base into strategic bets
- **PRD:** Feature execution - translate charter into engineering requirements
- **Formats:** `--format exec` (1-page), `--format eng` (technical only), `--format full` (complete)

## Output Formats

By default, produces full documents. Use `--format` for audience-specific outputs:

| Format | Command | Audience | Content |
|--------|---------|----------|---------|
| `full` (default) | `/charters` or `/prd` | Planning team | Complete document with all sections |
| `exec` | `/charters --format exec` | Executives | 1-page summary with bets, metrics, risks |
| `eng` | `/charters --format eng` or `/prd --format eng` | Engineering | Scope, dependencies, technical constraints only |

## Core Logic for Charters

**Step 1: Gather Context**

Follow `.claude/rules/pm-core/context-gathering.md`:
1. Detect inputs: truth base, VOC synthesis, KTLO triage, KB gaps
2. Present options to user
3. Read `.beads/insights.jsonl` for learned charter patterns
4. Proceed with selected context

**Step 2: Synthesize Signals**

Extract from each source:
- **Truth base:** Roadmap themes, constraints, open questions
- **VOC:** Top themes, opportunities, customer pain
- **KTLO:** Critical issues, patterns, tech debt
- **KB gaps:** User struggle points, AI opportunities

**Step 3: Identify Charter Candidates**

Look for convergence:
- VOC + KTLO cluster = strong signal
- Roadmap theme + customer evidence = validated bet
- Gap + customer complaints = opportunity

Aim for 5-7 candidates, narrow to 3-5.

**Step 4: Strategic Reasoning (Meta-Prompt)**

Before the main charter, create Strategic Reasoning section per `.claude/rules/pm-core/meta-prompt-reasoning.md`:

- **Problem & Goals:** What makes a high-quality charter? (Stakeholders understand bets, engineering can scope)
- **Context & Constraints:** Available evidence and resource limits
- **Options Evaluated:** Candidates considered with evidence scoring (High/Med/Low)
- **Selection Rationale:** Why chosen beat alternatives

**Step 5: Draft Each Charter**

For each charter:

| Section | Content | Source |
|---------|---------|--------|
| Problem | Specific user pain | VOC/KTLO evidence |
| Target Users | Who feels this pain | Explicit segment |
| Success Metrics | How we'll know it worked | Measurable KPIs |
| Scope | What's in | Clear boundaries |
| Non-Scope | What's out | Explicit exclusions |
| Dependencies | What we need | Named teams/systems |
| Risks & Mitigations | What could go wrong | Risk + mitigation pairs |
| Why Now | Why this quarter | Business/competitive reason |

**Step 6: Generate Output**

Write to `outputs/roadmap/Qx-YYYY-charters.md`:

```markdown
---
generated: YYYY-MM-DD HH:MM
skill: generating-quarterly-charters
sources:
  - outputs/truth_base/truth-base.md (modified: YYYY-MM-DD)
  - outputs/insights/voc-synthesis-*.md (modified: YYYY-MM-DD)
  - outputs/ktlo/ktlo-triage-*.md (modified: YYYY-MM-DD)
downstream:
  - outputs/delivery/prds/*.md
---

# Q[X] [YYYY] Charters

## Strategic Reasoning

### Problem & Goals
**Problem:** Choose [N] strategic bets from [M] possible initiatives for Q[X].
**Success Criteria:** [What makes these charters high-quality]

### Context & Constraints
**Available Evidence:**
- VOC: [Key findings]
- KTLO: [Key patterns]
- Truth base: [Relevant context]

**Constraints:**
- [Resource/capacity limitations]
- [Timeline constraints]

**Gaps:**
- [What we don't know that matters]

### Charter Candidates Evaluated

| Candidate | VOC Signal | KTLO Signal | Evidence Score | Decision |
|-----------|------------|-------------|----------------|----------|
| [Initiative A] | High/Med/Low | High/Med/Low | High/Med/Low | ✅ Charter 1 |
| [Initiative D] | High/Med/Low | High/Med/Low | High/Med/Low | ❌ Deferred |

### Selection Rationale
**Why chosen beat alternatives:**
1. [Reason 1 with evidence]
2. [Reason 2 with evidence]

**What would change these priorities:**
- [Specific trigger that would shift priorities]

---

## Charter 1: [Name]

### Problem Statement
[2-3 sentences with evidence citations]

### Success Metrics

| Criterion | Baseline | Target | Owner |
|-----------|----------|--------|-------|
| [User outcome] | [Current] | [Goal] | [Name/TBD] |

### Scope
**In:** [Feature/capability 1]
**Out:** [Explicitly excluded]

### Dependencies
| Dependency | Team/System | Status |
|------------|-------------|--------|
| [What we need] | [Who owns it] | [Known/Unknown] |

### Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk] | High/Med/Low | [Action] |

---

## What We're NOT Doing This Quarter
| Item | Reason |
|------|--------|
| [Deferred item] | [Why not now] |

## Sources Used
- [file paths with dates]

## Claims Ledger
| Claim | Type | Source |
|-------|------|--------|
| [Problem affects X users] | Evidence | [VOC/KTLO] |
```

**Step 7: Copy to History & Update Tracker**

- Run `pm-os mirror --quiet` to copy to `history/generating-quarterly-charters/`
- Update `nexa/state.json` and append to `outputs/audit/auto-run-log.md`

## Core Logic for PRDs

**Step 1: Gather Charter Context**

Process charter, user stories, or problem description.

**Step 2: Break Down Requirements**

Define:
- **Functional Requirements:** What the system must do (SHALL/SHOULD/MAY)
- **Non-Functional Requirements:** Performance, security, reliability
- **Edge Cases:** Error handling, unexpected inputs
- **Telemetry:** Success measurement
- **Acceptance Criteria:** Clear pass/fail tests

**Step 3: Define Rollout Plan**

Include phases with success gates:
- Alpha: [criteria]
- Beta: [criteria]
- GA: [criteria]

**Step 4: Generate Output**

Write to `outputs/delivery/prds/[feature-name]-prd-[YYYY-MM-DD].md` with same metadata structure.

## Post-Execution Protocol

After completing this skill, follow `.claude/rules/pm-core/post-skill-reflection.md`:

**Step 8: Post-Skill Reflection**

1. Extract 3-5 key learnings (bet rationale, evidence quality, trade-offs)
2. Create learning entry in `history/learnings/YYYY-MM-DD-generating-quarterly-charters.md`
3. Create insight beads in `.beads/insights.jsonl`
4. Request output rating (1-5 or skip)
5. Auto-log charter completion as high-confidence decision
6. Report capture completion to user

## Goal-Backward Verification (MANDATORY)

Before marking complete, run checklist from `.claude/rules/pm-core/goal-backward-verification.md`:

**Charter Goal:** Stakeholders can explain the quarter's bets and why they matter.

**Observable Truths (ALL must pass):**
- [ ] Stakeholder can explain bets in 2 minutes
- [ ] Each bet has clear "we'll know it worked if..." statement
- [ ] Risks section survives "what could kill this?" challenge
- [ ] Dependencies name actual teams (not all "TBD")

**On failure:** Do not mark complete. Note failed checks in Open Questions.

## Verification Checklist

**Charters:**
- [ ] All upstream outputs read (truth base, VOC, KTLO)
- [ ] Source dates checked (not stale)
- [ ] 3-5 charters (not more)
- [ ] Every problem has VOC/KTLO evidence
- [ ] Success metrics are measurable
- [ ] "What we're NOT doing" section included
- [ ] Strategic Reasoning section complete
- [ ] Goal-backward verification passed

**PRDs:**
- [ ] Problem statement backed by charter
- [ ] Requirements use SHALL/SHOULD/MAY
- [ ] Edge cases realistic and complete
- [ ] Telemetry plan defined
- [ ] Rollout phases with success gates
- [ ] Acceptance criteria clear

## Quick Reference

| Item | Value |
|------|-------|
| Charter candidates to evaluate | 5-7 initial, narrow to 3-5 |
| Evidence scoring options | High / Medium / Low |
| Max charters per quarter | 5 |
| Format options | full (default) / exec / eng |
| Must-have sections | Problem, Success Metrics, Scope, Risks |
| Goal-backward gate | Pass all 4 observable truths |

## Common Mistakes

- **No evidence:** "Users want X" → Must cite VOC/KTLO
- **Too many charters:** 8 charters = no focus → Max 5
- **Missing scope:** "Build feature X" → What's in AND out
- **Vague metrics:** "Improve satisfaction" → "NPS +10 points"
- **Ignoring Strategic Reasoning:** Stakeholders don't understand why bets chosen
- **Not goal-backward verifying:** "Completed but wrong" output
