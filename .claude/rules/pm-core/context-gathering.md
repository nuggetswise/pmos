# Context Gathering Protocol

## Purpose

Replaces blocking prerequisites with conversational context-gathering. Skills ask users what context to use instead of refusing to run.

## When to Apply

At the start of any skill that generates output:
- PRDs, charters, VOC synthesis, competitive analysis
- Any skill that needs input context to generate quality output

## The Flow

### Step 1: Detect Available Inputs

Check for relevant files:

```
outputs/
├── roadmap/*-charters.md      # Charters
├── insights/voc-*.md          # VOC synthesis
├── ktlo/ktlo-*.md             # KTLO triage
├── truth_base/truth-base.md   # Product truth base
├── delivery/prds/*.md         # Existing PRDs
└── strategy/*.md              # Strategy docs

inputs/
├── voc/*.md                   # Raw interview notes
├── jira/*.csv                 # Ticket exports
└── context/*.md               # COMPASS files
```

### Step 2: Ask User What Context to Use

Use AskUserQuestion with:

**Available options** (based on files found):
- List each relevant file with brief description
- Example: "[Q1-2026-charters.md] Charter with 3 bets"

**Escape routes** (always include):
- "Point me to another document"
- "Just describe what you need"

**Example prompt:**
```
To write this PRD, I need context. What should I use?

Available:
- [Q1-2026-charters.md] Charter with 3 bets
- [voc-synthesis-2026-01.md] 7 customer interviews
- [truth-base.md] Product overview

Or:
- [Point me to a document]
- [Describe what you need]
```

### Step 3: Reference Learnings

Before generating output:

1. **Read `.beads/insights.jsonl`** for relevant patterns
2. **Filter by skill type** (e.g., tags containing skill name)
3. **Apply quality patterns** from high-rated outputs
4. **Mention relevant learnings** to user:

```
Based on learnings from past PRDs (avg 4.2/5 rating):
- High-rated PRDs include detailed edge cases
- Clear success metrics correlate with faster approval
```

### Step 4: Generate with Cited Sources

Generate output using:
- Selected context files
- User-provided descriptions
- Applied learnings

**Always include:**
- Sources Used section (list all files read)
- Claims Ledger (tag all claims)

## Context Suggestions by Skill

| Skill | Suggested Context | Why |
|-------|-------------------|-----|
| `/prd` | Charters, VOC, truth base | PRDs benefit from strategic context |
| `/charters` | VOC, KTLO, truth base, priorities | Charters synthesize multiple inputs |
| `/voc` | Raw interview notes, feedback | VOC needs raw customer voice |
| `/compete` | Truth base, market research | Competitive needs product baseline |
| `/strategy` | Charters, VOC, competitive | Strategy builds on everything |

## Never Block

**Old behavior (wrong):**
```
BLOCKED: "You need a charter to run /prd"
```

**New behavior (correct):**
```
"To write this PRD, I need context. What should I use?"
[Offers options including "just describe it"]
```

Users decide what's relevant. Nexa provides options, not gates.

## Handling "Just Describe It"

If user selects the describe option:

1. Ask clarifying questions:
   - "What problem are we solving?"
   - "Who is this for?"
   - "What does success look like?"

2. Use responses as context
3. Note in Sources Used: "User-provided description"
4. Mark claims as Assumption (not Evidence)

## Integration with Skills

Skills should include context-gathering as Step 1:

```markdown
**Step 1: Gather Context**

Follow protocol in `.claude/rules/pm-core/context-gathering.md`:
1. Detect available inputs in outputs/ and inputs/
2. Present options to user via AskUserQuestion
3. Read .beads/ for relevant learnings
4. Use selected context for generation
```

## Why This Matters

**Old model (phases + prerequisites):**
- Assumes linear workflow (OBSERVE → THINK → PLAN → BUILD)
- Blocks users from running skills "out of order"
- Nexa decides what's needed

**New model (conversational context):**
- Recognizes work is non-linear
- User decides what context is relevant
- Nexa offers options and generates
- More flexible, more respectful of user agency

## Quality Gates

Before completing context-gathering:

- [ ] Checked outputs/ for relevant files
- [ ] Checked inputs/ for raw materials
- [ ] Offered user multiple options (not just one)
- [ ] Included "describe it" escape route
- [ ] Read learnings from .beads/ if available
- [ ] Confirmed user's selection before proceeding
