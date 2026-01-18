# Decision Algorithm Enforcement

## Purpose

Enforces the OBSERVE → THINK → PLAN → BUILD → EXECUTE → VERIFY → LEARN loop by:
1. Tracking current phase in session state
2. Checking prerequisites before running skills
3. Recommending next skills based on current phase

## Phase Definitions

| Phase | Skills | Prerequisites | Outputs |
|-------|--------|---------------|---------|
| **OBSERVE** | building-truth-base, synthesizing-voc, triaging-ktlo | None (entry point) | truth-base.md, voc-synthesis.md, ktlo-triage.md |
| **THINK** | analyzing-kb-gaps, brainstorming, competitive-analysis | At least 1 OBSERVE output | insights/*.md |
| **PLAN** | generating-quarterly-charters, prioritizing-work | Truth base OR VOC synthesis | charters.md, priorities.md |
| **BUILD** | writing-prds-from-charters | Charter exists | prds/*.md |
| **EXECUTE** | *(Engineering handoff - not PM OS controlled)* | PRD exists | - |
| **VERIFY** | verification-before-completion | Output to verify | Verified output |
| **LEARN** | tracking-decisions, learning-from-history | Completed work to learn from | decisions/*.md, learned/*.md |

## Prerequisite Checks

Before running any skill, check prerequisites:

### THINK Phase Skills
```
analyzing-kb-gaps:
  REQUIRES: outputs/truth_base/truth-base.md OR outputs/insights/voc-synthesis-*.md
  IF MISSING: "Run building-truth-base or synthesizing-voc first (OBSERVE phase)"

brainstorming:
  REQUIRES: None (can brainstorm anytime, but better with context)
  RECOMMEND: "Consider running synthesizing-voc first for customer grounding"

competitive-analysis:
  REQUIRES: outputs/truth_base/truth-base.md
  IF MISSING: "Run building-truth-base first to understand your product before comparing"
```

### PLAN Phase Skills
```
generating-quarterly-charters:
  REQUIRES:
    - outputs/truth_base/truth-base.md (OBSERVE)
    - OR outputs/insights/voc-synthesis-*.md (OBSERVE)
    - OR outputs/ktlo/ktlo-triage-*.md (OBSERVE)
  IF ALL MISSING: "Run at least one OBSERVE skill first: building-truth-base, synthesizing-voc, or triaging-ktlo"
  RECOMMEND: "Best results with all three OBSERVE outputs"

prioritizing-work:
  REQUIRES: Work items to prioritize (KTLO triage or charters)
  IF MISSING: "Run triaging-ktlo or generating-quarterly-charters first"
```

### BUILD Phase Skills
```
writing-prds-from-charters:
  REQUIRES: outputs/roadmap/*-charters.md
  IF MISSING: "Run generating-quarterly-charters first (PLAN phase). PRDs must trace to charters."
  HARD BLOCK: Cannot proceed without charter
```

### LEARN Phase Skills
```
tracking-decisions:
  REQUIRES: Decision to track (none - can run anytime)
  RECOMMEND: "Document decisions as they happen, not retroactively"

learning-from-history:
  REQUIRES: 5+ outputs in history/ for the skill being analyzed
  IF MISSING: "Not enough history to extract patterns. Keep using PM OS and try again later."
```

## Phase Tracking in Session State

Update `outputs/session-state.md` to include algorithm phase:

```yaml
## Algorithm Phase
| Field | Value |
|-------|-------|
| Current Phase | OBSERVE / THINK / PLAN / BUILD / VERIFY / LEARN |
| Phase Entry | YYYY-MM-DD HH:MM |
| Completed Phases | [list of phases completed this cycle] |
| Recommended Next | [skill name] |
```

## Enforcement Behavior

### Before Running Any Skill

1. Check prerequisites for the skill
2. If prerequisites not met:
   - **Soft block (THINK, LEARN):** Warn but allow override: "Missing [output]. Recommended to run [skill] first. Continue anyway?"
   - **Hard block (BUILD):** Refuse: "Cannot run writing-prds-from-charters without a charter. Run generating-quarterly-charters first."
3. Update session state with current phase

### After Running Any Skill

1. Update session state:
   - Current Phase: [new phase based on skill completed]
   - Completed Phases: [add to list]
   - Recommended Next: [suggest next skill in loop]
2. Show phase progress:
   ```
   ✅ OBSERVE complete (truth base, VOC, KTLO)
   ✅ THINK complete (competitive analysis)
   ▶️ PLAN in progress (charters: 2 of 3 bets defined)
   ⏳ BUILD waiting (PRDs pending charters)
   ```

## Recommended Skill by Phase

When user asks "What's next?" or runs `/status`:

| Current Phase | Recommended Next | Why |
|---------------|------------------|-----|
| None | OBSERVE: building-truth-base | Start with product understanding |
| OBSERVE done | THINK: analyzing-kb-gaps | Generate insights from observations |
| THINK done | PLAN: generating-quarterly-charters | Define strategic bets |
| PLAN done | BUILD: writing-prds-from-charters | Turn bets into specs |
| BUILD done | VERIFY: verification-before-completion | Validate the PRD |
| VERIFY done | LEARN: tracking-decisions | Document what you learned |
| LEARN done | OBSERVE: (new cycle) | Start fresh with new data |

## Phase Transitions

```
               ┌────────────────────────────────────────────┐
               │                                            │
               ▼                                            │
    ┌──────────────────┐                                    │
    │     OBSERVE      │ ◀── Entry point (building-truth-base, VOC, KTLO)
    └────────┬─────────┘                                    │
             │                                              │
             ▼                                              │
    ┌──────────────────┐                                    │
    │      THINK       │ ◀── Requires OBSERVE output        │
    └────────┬─────────┘                                    │
             │                                              │
             ▼                                              │
    ┌──────────────────┐                                    │
    │      PLAN        │ ◀── Requires OBSERVE or THINK      │
    └────────┬─────────┘                                    │
             │                                              │
             ▼                                              │
    ┌──────────────────┐                                    │
    │      BUILD       │ ◀── HARD REQUIRES charter (PLAN)   │
    └────────┬─────────┘                                    │
             │                                              │
             ▼                                              │
    ┌──────────────────┐                                    │
    │     VERIFY       │ ◀── Requires output to verify      │
    └────────┬─────────┘                                    │
             │                                              │
             ▼                                              │
    ┌──────────────────┐                                    │
    │      LEARN       │────────────────────────────────────┘
    └──────────────────┘     (feeds back to OBSERVE)
```

## Integration with Session Greeting

In the Nexa greeting, show algorithm phase:

```
👋 Nexa here - PM OS ready.

📚 Loaded: 12 rules, 17 skills, 12 commands

🔄 Algorithm Phase: PLAN
   ✅ OBSERVE: truth base, VOC synthesis, KTLO triage
   ✅ THINK: competitive analysis
   ▶️ PLAN: Q1 charters (2/3 bets defined)
   ⏳ BUILD: waiting for charters

   Recommended: Finish charters, then run writing-prds-from-charters

🔥 Active: Q1-2026-charters.md (hot, review by 2026-01-24)
⚠️ Needs attention: None

Ready for your request.
```

## Override Protocol

User can override soft blocks by saying:
- "Run [skill] anyway"
- "Skip prerequisites"
- "I understand the risk"

Hard blocks (BUILD without PLAN) cannot be overridden - the output wouldn't make sense without prerequisites.

## Why This Matters

Without enforcement:
- PRDs get written without charters → scope creep, no traceability
- Charters get written without VOC → bets disconnected from customer reality
- Analysis happens without truth base → insights based on assumptions

With enforcement:
- Every output traces back to evidence
- PM loop is verifiable end-to-end
- "How did we get here?" is always answerable
