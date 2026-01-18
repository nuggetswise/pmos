# Decision Detection Protocol

## Purpose

Automatically detect decision moments during PM work and either auto-log or ask the user, based on confidence level. Prevents missed decisions without creating admin burden.

## When Decisions Happen

Decisions occur when:
- Choosing between 2+ explicit options
- Completing significant implementation work
- Making strategic or architectural changes
- Prioritizing one thing over another
- Committing to an approach after exploration

## Detection Heuristics

### High Confidence (Auto-Log)

These are obvious decisions - log automatically and notify user:

| Trigger | Example |
|---------|---------|
| Completed charter or PRD | "Q1 charters complete with 3 bets" |
| Major architectural change | "Renamed TELOS to COMPASS across system" |
| Explicit prioritization | "Deprioritized Feature X in favor of Y" |
| Strategic bet made | "Decided to focus on AI extraction for Q1" |
| Scope cut or deferral | "Cut feature Z from MVP" |

**Behavior:** Auto-create decision record, notify user:
```
📝 Logged decision: [short title]
   → outputs/decisions/YYYY-MM-DD-[title].md
```

### Medium Confidence (Ask User)

These might be decisions - ask before logging:

| Trigger | Example |
|---------|---------|
| Significant code/config changes | "Updated 10+ files for branding cleanup" |
| Chose implementation approach | "Using local skill instead of plugin" |
| User language suggests choice | "let's go with", "I think we should" |
| Completed multi-step task | "Finished implementing Option D" |
| Changed direction mid-task | "Actually, let's do X instead" |

**Behavior:** Ask user with simple prompt:
```
This looks like a trackable decision: [brief description]
Log it for future learning? [Yes / No / Skip this time]
```

### Low Confidence (Don't Ask)

These are routine work - don't interrupt:

| Trigger | Example |
|---------|---------|
| Single file edits | "Fixed typo in README" |
| Information gathering | "Read 5 files to understand codebase" |
| Answering questions | "Explained how VOC synthesis works" |
| Running existing skills | "Ran /ktlo triage" |
| Minor refactoring | "Renamed variable for clarity" |

**Behavior:** No prompt, no logging.

## Decision Record Format

When logging (auto or after user confirms), create:

**File:** `outputs/decisions/YYYY-MM-DD-[short-title].md`

**Content:** Use template from `outputs/decisions/TEMPLATE.md`

Minimum fields to capture:
- Decision statement (what was decided)
- Context (why this came up)
- Options considered (if applicable)
- Rationale (why this choice)
- Expected outcome (what we think will happen)

## Integration Points

### After Skill Completion

When any skill completes successfully:
1. Check: Was this a PLAN or BUILD phase skill?
2. If yes → High confidence, auto-log
3. If no → Check other heuristics

### After Significant Implementation

When implementation involves:
- 5+ files modified, OR
- New skill/rule created, OR
- Architecture change (renamed concepts, restructured)

→ Medium confidence, ask user

### During Conversation

Watch for decision language:
- "Let's go with X"
- "I've decided to..."
- "We're doing X instead of Y"
- "The approach will be..."
- "Prioritizing X over Y"

→ Medium confidence, ask user

## User Preferences

Respect user's decision tracking preferences:

| Preference | Behavior |
|------------|----------|
| `track_all_decisions: true` | Lower threshold, ask more often |
| `track_all_decisions: false` | Higher threshold, only obvious ones |
| `decision_prompts: minimal` | Only auto-log, never ask |
| `decision_prompts: normal` | Default behavior (ask when uncertain) |

Store preferences in `CLAUDE.local.md` or `inputs/context/preferences.md`.

## Example Flows

### Flow 1: Auto-Log (High Confidence)

```
User: Implement the PM OS branding cleanup plan
Nexa: [Completes implementation - 11 files changed, new skill created,
       concept renamed across system]

Nexa: Implementation complete.

📝 Logged decision: PM OS branding cleanup
   - Removed superpowers plugin dependency
   - Created native brainstorming skill
   - Renamed TELOS → COMPASS
   → outputs/decisions/2026-01-18-pm-os-branding-cleanup.md
```

### Flow 2: Ask User (Medium Confidence)

```
User: Let's use Redis for caching instead of in-memory
Nexa: [Makes the change]

Nexa: Done. This looks like a trackable decision:
      "Chose Redis over in-memory caching"

      Log it for future learning? [Yes / No]

User: Yes

Nexa: 📝 Logged decision: Redis caching approach
      → outputs/decisions/2026-01-18-redis-caching.md
```

### Flow 3: No Prompt (Low Confidence)

```
User: What files handle session state?
Nexa: [Searches and explains]

Nexa: Session state is handled in outputs/session-state.md...
      [No decision prompt - this was just information gathering]
```

## Avoiding Prompt Fatigue

- Max 1 decision prompt per conversation turn
- If multiple potential decisions in one turn, batch into single prompt
- If user says "No" to a prompt, don't ask again for similar items in same session
- Never prompt during active skill execution (wait until completion)

## Quality Over Quantity

Better to miss a minor decision than to annoy the user with prompts.

**Log these:** Strategic choices, architectural changes, prioritization calls, scope decisions

**Skip these:** Implementation details, routine maintenance, minor preferences
