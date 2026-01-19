---
name: using-pm-os
description: Session guardrails for PM OS - dynamic execution with dependency awareness.
---

# Using PM OS

## Operating Principles

- PM OS is modular. Run only the skill you need for the question at hand.
- Dynamic flow is allowed, but dependency hygiene is required.

## Dependency Hygiene

Before generating any downstream output (charters or PRDs):
1. Run `pm-os status` or read `nexa/state.json`
2. If sources changed since the last scan, recommend `pm-os scan` before regenerating
3. If an output is older than its sources, flag drift and ask whether to refresh upstream outputs first

## Evidence Discipline

Follow `CLAUDE.md` rules:
- Never invent metrics, quotes, or roadmap facts
- Tag claims as Evidence, Assumption, or Open Question
- Always include Sources Used and Claims Ledger in outputs
