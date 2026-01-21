# Session Guardrails

## Purpose

Automatic guardrails for PM OS sessions. These rules apply implicitly at session start and throughout - no skill invocation required.

**Note:** This replaces the former `using-pm-os` skill. Guardrails should be automatic, not invoked.

## Operating Principles

- PM OS is modular. Run only the skill you need for the question at hand.
- Dynamic flow is allowed, but dependency hygiene is required.
- Prefer conversational invocation over slash commands when intent is clear.

## Dependency Hygiene

Before generating any downstream output (charters or PRDs):

1. Read `nexa/state.json` for current state
2. If sources changed since the last scan, recommend `pm-os scan` before regenerating
3. If an output is older than its sources, flag drift and ask whether to refresh upstream outputs first

## Evidence Discipline

Follow `CLAUDE.md` rules:

- Never invent metrics, quotes, or roadmap facts
- Tag claims as Evidence, Assumption, or Open Question
- Always include Sources Used and Claims Ledger in outputs

## Conversational Routing

When user expresses intent conversationally, route to the appropriate skill automatically:

| User Intent | Routes To |
|-------------|-----------|
| "What are customers saying?" | synthesizing-voc |
| "Help me understand these docs" | discovery --analyze-docs |
| "Prep me for my sales interview" | discovery --prep sales |
| "What should we focus on this quarter?" | generating-quarterly-charters |
| "Log this decision" | learn --decision |
| "How did the launch go?" | learn --launch |
| "What patterns have we learned?" | learn --patterns |
| "Analyze this data/CSV" | analyze --data |
| "What's missing from our KB?" | analyze --kb |
| "Who are our competitors?" | competitive-analysis |
| "What's on fire in support?" | triaging-ktlo |
| "Write me a PRD" | writing-prds-from-charters |
| "Plan the GTM launch" | planning-gtm-launch |
| "Map the stakeholders" | stakeholder-management |
| "Generate an exec update" | generating-exec-update |
| "Help me brainstorm" | brainstorming |
| "What's the product truth base?" | building-truth-base |
| "What's our 3-year strategy?" | writing-product-strategy |
| "Prioritize this backlog" | prioritizing-work |

If intent is ambiguous, ask: "Are you looking to [option A] or [option B]?"

## Auto-Mirror Rule

After generating ANY output to `outputs/`:

1. Run `pm-os mirror --quiet` automatically
2. Verify output copied to `history/<skill>/`
3. Report: "Mirrored to history/<skill>/<filename>-<date>.md"

This is NON-NEGOTIABLE. Every output flows to history for learning.

## State Updates

After completing any skill:

1. Update `nexa/state.json` with phase and next_action
2. Append to `outputs/audit/auto-run-log.md`
3. Flag any downstream outputs that may now be stale
