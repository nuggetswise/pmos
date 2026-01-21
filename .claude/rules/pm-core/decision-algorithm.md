# PM Decision Algorithm

This PM OS follows an iterative refinement loop for all PM work.

## The Algorithm

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

## Mapping to PM OS Skills

| Phase | PM OS Skills | What Happens |
|-------|--------------|--------------|
| **Observe** | building-truth-base, synthesizing-voc, triaging-ktlo | Gather context from inputs |
| **Think** | analyze --kb, brainstorming, competitive-analysis | Generate insights |
| **Plan** | generating-quarterly-charters, prioritizing-work | Sequence work |
| **Build** | writing-prds-from-charters | Define execution |
| **Execute** | *(Engineering handoff)* | Deliver the work |
| **Verify** | verification-before-completion | Validate claims |
| **Learn** | learn --decision, learn --patterns | Calibrate judgment |

## Key Principle

**Verifiability is everything.** Each cycle should be verifiable. Evidence before claims, always.

## Closing the Loop

The "Learn" phase feeds back into "Observe":
- Decision outcomes inform future prioritization
- Learned patterns update skills via `.claude/rules/learned/`
- Personal preferences persist in `CLAUDE.local.md`
