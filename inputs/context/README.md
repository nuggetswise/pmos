# Context Directory - 5-Dimension Model

## Overview

This directory contains your personal context that shapes every Nexa interaction. Based on the "Context First, Every Request" principle:

> **context loads once, informs everything**
> **your goals drive every response**

## The 5 Dimensions

| Dimension | File | What It Contains | How Nexa Uses It |
|-----------|------|------------------|------------------|
| **COMPASS** | `compass.md` | Mission, Goals, Beliefs, Values | Aligns recommendations to your north star |
| **PROJECTS** | `projects.md` | Current initiatives, active work, in-flight items | Tailors responses to what you're working on |
| **CHALLENGES** | `challenges.md` | Obstacles, blockers, constraints, risks | Shapes solutions around known barriers |
| **PREFERENCES** | `preferences.md` | Communication style, output formats, working style | Adapts how Nexa communicates with you |
| **HISTORY** | *(auto-loaded)* | Past decisions, learned patterns, outcomes | Grounds suggestions in past experience |

## File Structure

```
inputs/context/
├── README.md           # This file
├── compass.md            # Mission, goals, beliefs
├── projects.md         # Current work
├── challenges.md       # Obstacles and constraints
├── preferences.md      # Your style
└── archive/
    └── my-context.md   # Legacy combined context (archived 2026-01-18)
```

## How Context Loads

At session start, Nexa's hook loads all 5 dimensions:

```
Session Start
     │
     ▼
┌────────────────────┐
│  SessionStart Hook │
└────────┬───────────┘
         │
         ▼
    ┌────────────────────────────────────┐
    │      CORE Context Loads            │
    │                                    │
    │  ┌─────────┐  ┌──────────┐         │
    │  │  COMPASS  │  │ PROJECTS │         │
    │  └─────────┘  └──────────┘         │
    │                                    │
    │  ┌───────────┐ ┌─────────────┐     │
    │  │CHALLENGES │ │ PREFERENCES │     │
    │  └───────────┘ └─────────────┘     │
    │                                    │
    │  ┌─────────┐                       │
    │  │ HISTORY │ (from outputs/)       │
    │  └─────────┘                       │
    └────────────────────────────────────┘
         │
         ▼
    Every Request Informed
    - "Draft email..." → Uses PREFERENCES for style
    - "What's next?" → Uses COMPASS + PROJECTS for priorities
    - "Solve problem..." → Uses CHALLENGES + HISTORY for context
```

## Updating Your Context

### When to Update

| Dimension | Update When |
|-----------|-------------|
| COMPASS | Goals change, new quarter, new role |
| PROJECTS | Start/finish initiatives, priorities shift |
| CHALLENGES | New blockers emerge, old ones resolved |
| PREFERENCES | You notice Nexa getting it wrong |

### How to Update

Edit the relevant file directly. Nexa will pick up changes at next session.

Or ask Nexa:
- "Update my COMPASS - add goal: launch AI extraction by Q2"
- "Remove Project: Customer discovery - completed"
- "My challenge with data quality is resolved"

## Migration from my-context.md (Complete)

The legacy `my-context.md` has been migrated to the 5-dimension model and archived.

**Migration mapping (completed 2026-01-18):**
| my-context.md Section | Now In |
|----------------------|--------|
| Role, Domain Knowledge | compass.md |
| Key Stakeholders | compass.md |
| Current Priorities | projects.md |
| Constraints | challenges.md |
| Operating Cadence | preferences.md |
| Primary Metrics | compass.md |
| Decision Principles | compass.md |
| Strategic Context | compass.md |

The archived file is preserved at `archive/my-context.md` for reference.

## Context File Templates

See each file for its template structure.

## Why 5 Dimensions?

This model ensures Nexa can:

1. **Answer "What's next?"** → COMPASS (goals) + PROJECTS (current work) = prioritized actions
2. **Draft contextually** → PREFERENCES (style) + PROJECTS (topic) = tailored content
3. **Solve problems** → CHALLENGES (constraints) + HISTORY (what worked) = feasible solutions
4. **Stay aligned** → COMPASS (mission) = recommendations that serve your actual goals

Without structured context, Nexa treats each request in isolation. With it, every response builds on understanding of who you are and what you're trying to achieve.
