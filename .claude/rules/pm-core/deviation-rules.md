# Deviation Rules

## Purpose

Provides predictable guidance when unexpected situations arise during skill execution. Prevents flailing when sources conflict, files are missing, or scope shifts mid-run.

## The 4 Rules

| Priority | Situation | Action |
|----------|-----------|--------|
| **1** | Missing source file | Pause, ask user to provide or proceed without |
| **2** | Conflicting data between sources | Flag in Open Questions, proceed with most recent |
| **3** | Scope creep discovered mid-skill | Document as "Out of Scope" in output, continue |
| **4** | Fundamental assumption invalidated | **STOP**, checkpoint with user before proceeding |

## Rule Details

### Rule 1: Missing Source File

**Trigger:** Skill expects a source file that doesn't exist (e.g., VOC synthesis missing, truth base not built).

**Action:**
1. Report: "Expected source `[path]` not found."
2. Ask: "Would you like to: (a) provide the file, (b) proceed without it, or (c) run the upstream skill first?"
3. Log decision in session state
4. If proceeding without: add to Claims Ledger as Assumption with note "Source unavailable"

**Example:**
```
Expected source `outputs/insights/voc-synthesis-2026-01.md` not found.
This charter's customer evidence will be limited without VOC synthesis.
Options: (a) provide VOC file, (b) proceed with KTLO evidence only, (c) run synthesizing-voc first?
```

### Rule 2: Conflicting Data Between Sources

**Trigger:** Two sources contradict each other (e.g., roadmap says X is priority, VOC says customers don't want X).

**Action:**
1. Flag conflict explicitly in output's Open Questions section
2. Note which source is more recent
3. Proceed with most recent source as primary
4. Add to Claims Ledger: "Conflict between [source A] and [source B], used [chosen source]" as Assumption

**Example:**
```
⚠️ Conflict detected:
- roadmap_deck/Q1-priorities.pdf says "Search improvements" is P1
- voc-synthesis-2026-01.md shows 0 customer mentions of search

Proceeding with VOC (more recent: 2026-01-15 vs 2025-10-01).
Added to Open Questions for resolution.
```

### Rule 3: Scope Creep Discovered Mid-Skill

**Trigger:** While executing a skill, discover work that should be done but wasn't in the original scope (e.g., "we should also update the API docs").

**Action:**
1. Document discovered item in "Out of Scope" section of current output
2. Continue with original scope
3. Optionally note as follow-up in Open Questions
4. Do NOT expand scope mid-skill

**Example:**
```
Discovered while writing PRD: API versioning strategy undefined.
Added to Out of Scope: "API versioning strategy - requires separate decision"
Continuing with current PRD scope.
```

### Rule 4: Fundamental Assumption Invalidated (STOP)

**Trigger:** A core assumption that the entire skill relies on turns out to be false.

**Action:**
1. **STOP immediately** - do not proceed
2. Checkpoint with user: explain what was assumed and what invalidated it
3. Wait for user direction before continuing
4. Log in session state as blocker

**STOP Trigger Examples:**
- Truth base says "Product X deprecated" but charter bets on it
- VOC says "customers want feature Y" but KTLO shows Y causes 80% of tickets
- Stakeholder priority changed mid-skill (user informs you)
- Required dependency team no longer exists
- Compliance/legal constraint discovered that blocks approach

**Example:**
```
🛑 STOP - Fundamental assumption invalidated

Assumption: "AI extraction feature is feasible this quarter"
Invalidated by: KTLO ticket #4521 shows AI service has 6-week waitlist

This charter bet relies on AI extraction. Cannot proceed without resolution.

Options:
1. Remove AI extraction from charter scope
2. Extend timeline to Q2
3. Find alternative to AI service

Which direction should I take?
```

## Logging Deviations

All deviations must be logged in two places:

1. **Session state** (`outputs/session-state.md`) - Decisions section
2. **Output Claims Ledger** - As Assumption with deviation note

**Claims Ledger format:**
| Claim | Type | Source |
|-------|------|--------|
| [Claim affected by deviation] | Assumption | Deviation Rule [1-4]: [brief explanation] |

## Integration with Session State

When a deviation occurs:
1. Log in session state decisions section immediately
2. If Rule 4 (STOP), also log as blocker
3. Continue logging ensures resume can see what happened

## Decision Tree

```
Unexpected situation encountered
           │
           ▼
   Is a source file missing?
      │           │
     YES         NO
      │           │
      ▼           ▼
   Rule 1    Do sources conflict?
                  │           │
                 YES         NO
                  │           │
                  ▼           ▼
               Rule 2    Is this scope creep?
                              │           │
                             YES         NO
                              │           │
                              ▼           ▼
                           Rule 3    Is core assumption broken?
                                          │           │
                                         YES         NO
                                          │           │
                                          ▼           ▼
                                       Rule 4    Continue normally
                                       (STOP)
```

## What Deviations Are NOT

These are **not** deviations - handle normally:
- User asks clarifying question → Answer and continue
- Output section is optional and N/A → Mark as N/A, continue
- Minor data gap (e.g., exact metric unknown) → Mark as "Unknown" in output
- User changes mind about scope → This is a new instruction, restart or adjust
