---
description: "Show PM OS status - active work, hot outputs, stale items, blockers"
---

Compute and display PM OS status dynamically from source files.

**Steps:**

1. Read these source files:
   - `inputs/context/projects.md` → Extract Active Initiatives table
   - `inputs/context/challenges.md` → Extract Active Blockers table
   - `outputs/session-state.md` → Extract Algorithm Phase (if exists)
   - `alerts/stale-outputs.md` → Extract Stale Outputs section

2. Compute next actions based on current algorithm phase:
   - OBSERVE: building-truth-base, synthesizing-voc, triaging-ktlo
   - THINK: analyzing-kb-gaps, competitive-analysis
   - PLAN: generating-quarterly-charters
   - BUILD: writing-prds-from-charters

3. Display status in this format:

```
📊 PM OS Status

🔄 Algorithm Phase: [Current] → Recommended: [next skill]

🔥 Active Work:
[table rows from projects.md Active Initiatives]

⚠️ Blockers:
[table rows from challenges.md Active Blockers]

📋 Stale Outputs:
[table rows from alerts/stale-outputs.md, or "none"]

📌 Next Actions:
[computed based on algorithm phase]
```

4. If any source file is missing, report it and continue with available data.

**Fallback defaults:**
- Algorithm Phase: OBSERVE
- Recommended: building-truth-base
- Stale Outputs: *(none)*

**Note:** This command computes status dynamically from source files. Status is always current - no stale data.
