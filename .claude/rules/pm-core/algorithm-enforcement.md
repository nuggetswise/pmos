# PM Decision Algorithm (Mental Model)

## Purpose

Describes the iterative PM workflow as a mental model. This is a **conceptual framework**, not an enforcement system.

**Key change (2026-01-21):** Phases are no longer tracked or enforced. Skills use conversational context-gathering instead. See `.claude/rules/pm-core/context-gathering.md`.

## The Loop (Conceptual)

```
┌─────────────────────────────────────────────────────────────┐
│                    ITERATE until ideal state               │
│                                                             │
│    OBSERVE ──▶ THINK ──▶ PLAN ──▶ BUILD ──▶ EXECUTE        │
│        ▲                                        │          │
│        │                                        ▼          │
│    LEARN ◀────────────── VERIFY ◀──────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

This loop represents how PM work typically flows, but:
- Work is often non-linear
- You may skip or repeat phases
- Context matters more than phase order

## Skill Categories (Reference Only)

These categories help users understand what skills do, not to enforce order:

| Category | Skills | Typical Use |
|----------|--------|-------------|
| **Discovery** | discovery, building-truth-base, synthesizing-voc, triaging-ktlo | Understanding product/customers |
| **Analysis** | analyze --kb, brainstorming, competitive-analysis | Generating insights |
| **Planning** | generating-quarterly-charters, prioritizing-work | Defining what to build |
| **Execution** | writing-prds-from-charters | Specifying how to build |
| **Learning** | learn --decision, learn --launch, learn --patterns | Capturing knowledge |

## Context Suggestions (Not Requirements)

Skills work better with certain context, but users decide what's relevant:

| Skill | Suggested Context | Why |
|-------|-------------------|-----|
| `/prd` | Charters, VOC, truth base | PRDs benefit from strategic context |
| `/charters` | VOC, KTLO, truth base | Charters synthesize multiple inputs |
| `/voc` | Raw interview notes | VOC needs customer voice |
| `/compete` | Truth base, market research | Needs product baseline |
| `/strategy` | Everything available | Strategy builds on all context |

**Nexa asks what context to use** via the context-gathering protocol. Users are not blocked.

## What Changed

### Old Model (Removed)
- Phase field tracked in `nexa/state.json`
- Hard blocks: "Cannot run /prd without charter"
- Soft blocks: "Missing VOC, continue anyway?"
- Phase transitions: "Advance to THINK?"

### New Model (Current)
- No phase tracking
- No blocking
- Skills ask: "What context should I use?"
- User decides what's relevant

See `.claude/rules/pm-core/context-gathering.md` for the new protocol.

## Why This Changed

> "VOC or truth base might not always be OBSERVE. This conversation doesn't fall into either. How would Nexa know which phase we're in?" - User

The phase system assumed:
1. Work fits neatly into phases (it doesn't)
2. Nexa can detect what phase you're in (it can't)
3. Blocking helps quality (it frustrates users)

The new model:
1. Recognizes work is non-linear
2. Asks users what context they want
3. Respects user agency

## When to Reference This

Use this document when:
- Explaining the PM workflow to new users
- Understanding how skills relate to each other
- Thinking about what context might help a skill

**Do NOT use this document for:**
- Blocking skill execution
- Tracking phase in state
- Automated phase transitions
