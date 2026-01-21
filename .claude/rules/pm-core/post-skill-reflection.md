# Post-Skill Reflection (Mandatory)

## Purpose

Ensures every PLAN and BUILD phase skill execution captures learnings, insights, and ratings. Closes the "nothing is ever forgotten" execution gap by making capture non-optional.

## When to Apply

**MANDATORY for:**
- All PLAN phase skills (generating-quarterly-charters, prioritizing-work)
- All BUILD phase skills (writing-prds-from-charters)
- Strategic skills (writing-product-strategy, competitive-analysis)

**OPTIONAL for:**
- OBSERVE skills with significant insights (synthesizing-voc, building-truth-base)
- THINK skills that generate strategic insights (analyze --kb)

**SKIP for:**
- Routine information requests
- File reads without analysis
- Clarifying questions
- Status checks

## The Protocol

After executing ANY skill in the mandatory list, before responding to user:

### Step 1: Pause

Do not immediately return to user with "done" message. Take a moment to reflect on what was just learned.

### Step 2: Extract Learnings

Identify 3-5 key insights from this skill execution:

**Questions to ask yourself:**
- What was the main challenge in this work?
- What patterns emerged from the sources?
- What surprised you or contradicted expectations?
- What would you do differently next time?
- What connections exist to past work?

### Step 3: Create Learning Entry

Write to `history/learnings/YYYY-MM-DD-[skill-name].md` using this template:

```markdown
## Learnings from [Skill Name] - YYYY-MM-DD

### Context
[Brief description of what was done - 2-3 sentences]

### Key Insights
1. [Insight 1 - specific, actionable]
2. [Insight 2 - pattern observed]
3. [Insight 3 - connection to other work]

### Patterns Observed
- [Pattern that might apply to future work]
- [Recurring theme across sources]

### Connections to Past Work
- Links to: [previous learnings if any]
- Builds on: [prior decisions or outputs]

### Open Questions Raised
- [Question 1 - what's still unknown]
- [Question 2 - what needs validation]

### Application to Future Work
- [How this learning should inform next session]
- [What to remember when running this skill again]
```

### Step 4: Create Insight Beads

For each significant, reusable insight, append a bead to `.beads/insights.jsonl`:

**Bead types:**
- `insight` - Atomic learning or discovery
- `pattern` - Recurring theme across multiple sources
- `question` - Open question raised by this work
- `decision` - Choice made during execution (if applicable)

**Schema:**
```json
{
  "id": "bead_YYYYMMDD_HHMMSS_XXX",
  "type": "insight|pattern|question|decision",
  "content": "The atomic insight (1-2 sentences)",
  "source": "skill-name",
  "created_at": "ISO timestamp",
  "tags": ["tag1", "tag2"],
  "confidence": "high|medium|low",
  "connections": ["bead_id_1", "bead_id_2"]
}
```

**Quality gates for beads:**
- [ ] Is this genuinely new or useful?
- [ ] Would future sessions benefit from knowing this?
- [ ] Is it specific enough to be actionable?
- [ ] Does it have clear source/context?

**Don't create beads for:**
- Obvious information
- Duplicates of existing learnings
- Temporary/session-specific notes
- Implementation details without broader insight

### Step 5: Request Rating (PLAN/BUILD only)

If this was a PLAN or BUILD phase skill, ask for user rating:

```
✅ [Output type] complete → [file path]
   Mirrored to history/[skill]/[filename]-[date].md

Rate this output (1-5, or 'skip'):
1 - Needs major revision
2 - Below expectations
3 - Meets expectations
4 - Exceeds expectations
5 - Outstanding, exactly what I needed

Your rating:
```

**If user provides rating:**
- Create output-rating bead (see `.claude/rules/system/output-rating-capture.md`)
- Capture any qualitative feedback in bead `content` field
- Confirm: "📊 Recorded rating: [N]/5 → .beads/insights.jsonl"

**If user skips:**
- Confirm: "No problem. If you'd like to rate it later after review, just let me know."

### Step 6: Detect Decisions (if applicable)

Check decision detection heuristics from `.claude/rules/pm-core/decision-detection.md`:

**High confidence (auto-log):**
- Completed charter or PRD
- Made strategic or architectural choice
- Explicit prioritization (chose A over B)

**Medium confidence (ask):**
- Significant work with multiple implementation choices
- User language: "let's go with", "I think we should"

**If decision detected:**
- High confidence: Auto-create decision log, notify user
- Medium confidence: Ask "This looks like a trackable decision: [brief]. Log it? [Yes/No]"

### Step 7: Resume

Return to user with completion message including capture confirmation:

```
✅ [Output] complete → [file path]
   Mirrored to history/[skill]/[filename]-[date].md

📝 Captured learnings: 3 insights, 2 beads → history/learnings/YYYY-MM-DD-[skill].md

[Your normal completion message with recommendations]
```

## Integration with Skills

Skills should reference this protocol in their final step:

```markdown
**Step N: Post-Skill Reflection**

Follow protocol in `.claude/rules/pm-core/post-skill-reflection.md`:
1. Extract 3-5 key learnings
2. Create learning entry in `history/learnings/`
3. Create insight beads in `.beads/insights.jsonl`
4. Request rating (if PLAN/BUILD phase)
5. Detect and log decisions
6. Report capture completion to user
```

## Why This Matters

**Without post-skill reflection:**
- Same insights re-discovered session after session
- Patterns across time invisible
- Rating feedback never collected
- Learning loop incomplete

**With post-skill reflection:**
- Knowledge compounds over time
- Patterns emerge across sessions
- Quality trends become visible
- Future decisions informed by past learnings

**The transformation:**
- From: "Helpful AI that resets every session"
- To: "Collaborative PM that remembers everything we've learned together"

This is what makes Nexa a 2nd brain, not just a chatbot.

## Quality Gates

Before marking skill execution complete:

- [ ] Learning entry created in `history/learnings/`
- [ ] 3-5 key insights documented
- [ ] At least 1-2 insight beads created (if applicable)
- [ ] Rating requested (if PLAN/BUILD skill)
- [ ] Decisions detected and logged (if applicable)
- [ ] User notified of capture completion

## Anti-Patterns

| Anti-Pattern | Why It Fails | Instead |
|--------------|--------------|---------|
| **Generic learnings** | "This was useful" | Specific: "3/5 charters with <3 bets had higher ratings" |
| **Too many beads** | Dilutes signal | Only truly reusable insights |
| **Pressuring for rating** | User fatigue | Always offer "skip" option |
| **Verbose capture** | Takes too long | Keep it crisp - 2-3 min max |
| **Skipping for "quick" work** | Execution gap persists | Even quick skills have patterns |

## Example Flow

```
User: /charters

Nexa: [Executes generating-quarterly-charters skill]
      [Generates Q1-2026-charters.md]
      [Runs pm-os mirror --quiet]

      --- POST-SKILL REFLECTION (internal) ---
      Key insights:
      1. All 3 charters had VOC+KTLO convergence - strong signal
      2. Risk sections were easier with specific mitigations
      3. "What we're NOT doing" section helped scope clarity

      Creating: history/learnings/2026-01-20-generating-quarterly-charters.md
      Creating beads:
      - bead_20260120_160500_001: "VOC+KTLO convergence = strong charter signal"
      - bead_20260120_160500_002: "Explicit non-scope prevents charter creep"
      --- END REFLECTION ---

Nexa: ✅ Quarterly charters complete → outputs/roadmap/Q1-2026-charters.md
      Mirrored to history/generating-quarterly-charters/Q1-2026-charters-2026-01-20.md

      📝 Captured learnings: 3 insights, 2 beads → history/learnings/2026-01-20-generating-quarterly-charters.md

      Rate this charter (1-5, or 'skip'):
      1 - Needs major revision
      2 - Below expectations
      3 - Meets expectations
      4 - Exceeds expectations
      5 - Outstanding, exactly what I needed

      Your rating:

User: 5

Nexa: 📊 Recorded rating: 5/5 → .beads/insights.jsonl

      Great! This charter's evidence-backed approach with clear success metrics
      aligns with high-quality patterns. The VOC+KTLO convergence for all 3 bets
      gave strong signal for prioritization.

      Recommended next step: Run /prd to turn Charter 1 into an execution spec.
```

## Relationship to Other Rules

| Rule | Relationship |
|------|-------------|
| `.claude/rules/system/auto-capture.md` | This implements the capture protocol |
| `.claude/rules/system/output-rating-capture.md` | Integrated in Step 5 |
| `.claude/rules/pm-core/decision-detection.md` | Integrated in Step 6 |
| `.claude/rules/pm-core/output-metadata.md` | Mirroring already handled by skill |
| `.claude/rules/pm-core/pm-collaborative-style.md` | This is the execution mechanism |

This rule makes the capture protocols operationally real, not just architecturally designed.
