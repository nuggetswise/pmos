# Commands Directory

## Purpose

The `commands/` directory contains **quick shortcuts to PM skills** - simple command files that make invoking workflows as easy as typing `/ktlo` or `/voc`.

**Why this matters:** Commands provide a convenient, memorable interface to PM OS. Instead of typing "Run triaging-ktlo", just type `/ktlo`.

## Directory Structure

```
commands/
├── ktlo.md           # /ktlo → triaging-ktlo skill
├── voc.md            # /voc → synthesizing-voc skill
├── charters.md       # /charters → generating-quarterly-charters skill
├── exec-update.md    # /exec-update → generating-exec-update skill
├── stakeholders.md   # /stakeholders → stakeholder-management skill
├── gtm.md            # /gtm → planning-gtm-launch skill
├── strategy.md       # /strategy → writing-product-strategy skill
├── review.md         # /review → reviewing-launch-outcomes skill
├── brainstorm.md     # /brainstorm → brainstorming skill
├── execute-plan.md   # /execute-plan → executing-plans skill
└── write-plan.md     # /write-plan → writing-plans skill
```

## Available Commands

### Daily Commands

| Command | Skill | Purpose | Time |
|---------|-------|---------|------|
| `/ktlo` | triaging-ktlo | Triage support backlog | ~10 min |
| `/voc` | synthesizing-voc | Synthesize customer feedback | ~10 min |
| `/exec-update` | generating-exec-update | Generate 1-page exec update | ~10 min |

### Weekly Commands

| Command | Skill | Purpose | Time |
|---------|-------|---------|------|
| `/charters` | generating-quarterly-charters | Generate strategic bets | ~20 min |

### Senior PM Commands

| Command | Skill | Purpose | Time |
|---------|-------|---------|------|
| `/stakeholders` | stakeholder-management | Map stakeholders | ~30 min |
| `/gtm` | planning-gtm-launch | Create GTM launch plan | ~60 min |
| `/strategy` | writing-product-strategy | Write product strategy | ~90 min |
| `/review` | reviewing-launch-outcomes | Post-launch retrospective | ~45 min |

### Planning Commands

| Command | Skill | Purpose |
|---------|-------|---------|
| `/brainstorm` | brainstorming | Brainstorm ideas |
| `/write-plan` | writing-plans | Write implementation plan |
| `/execute-plan` | executing-plans | Execute an existing plan |

## How Commands Work

### Command File Structure

Every command file is extremely simple:

```markdown
---
description: "Brief description of what this does"
disable-model-invocation: true
---

Read and follow skills/[skill-name]/SKILL.md exactly as presented.
```

**That's it!** The command just tells Claude Code to invoke a skill.

### Example: /ktlo Command

File: `commands/ktlo.md`

```markdown
---
description: "Triage KTLO backlog into prioritized buckets"
disable-model-invocation: true
---

Read and follow skills/triaging-ktlo/SKILL.md exactly as presented.
```

When you type `/ktlo`:
1. Claude Code reads `commands/ktlo.md`
2. Sees instruction to invoke `skills/triaging-ktlo/SKILL.md`
3. Loads and follows that skill exactly

### disable-model-invocation: true

This flag tells Claude Code:
- Don't interpret the command as a user message
- Just load and follow the referenced skill file
- No extra processing, just execute the pattern

## Usage

### Running Commands

**In Claude Code:**
```
/ktlo
/voc
/charters
/exec-update
```

**Effect:**
- Loads corresponding skill
- Follows skill pattern step-by-step
- Generates output in `outputs/`
- Copies to `history/`
- Updates `alerts/stale-outputs.md`

### Commands vs Direct Invocation

**Two ways to run a skill:**

1. **Via command** (shortcut):
   ```
   /ktlo
   ```

2. **Direct invocation**:
   ```
   "Run triaging-ktlo"
   ```

**Both work identically** - commands are just shorter to type.

**Note:** Not all skills have commands. Skills without commands can still be invoked directly.

## Creating New Commands

Want to add a shortcut for a skill?

### Step 1: Create Command File

```bash
touch commands/my-command.md
```

### Step 2: Add Content

```markdown
---
description: "Brief description of what this does"
disable-model-invocation: true
---

Read and follow skills/my-skill-name/SKILL.md exactly as presented.
```

### Step 3: Test

```
/my-command
```

Should invoke your skill!

### Example: Add /prds Command

File: `commands/prds.md`

```markdown
---
description: "Write PRDs from quarterly charters"
disable-model-invocation: true
---

Read and follow skills/writing-prds-from-charters/SKILL.md exactly as presented.
```

Now `/prds` invokes the PRD writing skill.

## Naming Conventions

### Best Practices

**Good command names:**
- `/ktlo` - Short, memorable
- `/voc` - Acronym everyone knows
- `/charters` - Clear what it does
- `/exec-update` - Descriptive

**Avoid:**
- `/pm-ktlo` - Don't prefix with "pm-"
- `/pm:ktlo` - Don't use special characters
- `/triage-keep-the-lights-on` - Too long
- `/k` - Too cryptic

**Rules:**
- Use hyphens for multi-word: `/exec-update`
- Keep it short (1-2 words max)
- Make it memorable
- Match common PM vocabulary

## Common Workflows

### Morning Routine

```
/ktlo              # Triage overnight support tickets
/voc               # Synthesize recent feedback
/exec-update       # Generate update for stakeholders
```

**Time:** 30 minutes total

### Weekly Planning

```
/charters          # Generate/update quarterly charters
```

**Time:** 20-30 minutes

### Before a Launch

```
/stakeholders      # Map key players
/gtm               # Create launch plan
```

**Time:** 90 minutes total

### After a Launch

```
/review            # 30-day retrospective
```

**Time:** 45 minutes

## Common Issues

### Issue: "Command not found"

**Problem:** Typed `/my-command` but nothing happened.

**Solution:**
1. Check command exists: `ls commands/ | grep my-command`
2. Verify filename matches: `commands/my-command.md`
3. Try direct invocation instead: "Run skill-name"

### Issue: "Command runs but wrong skill"

**Problem:** Command invokes unexpected skill.

**Solution:**
1. Read command file: `cat commands/my-command.md`
2. Check which skill it references
3. Update skill reference if wrong
4. Re-run command

### Issue: "Want shorter command name"

**Problem:** `/exec-update` is too long, want `/exec`.

**Solution:**
1. Create new command: `cp commands/exec-update.md commands/exec.md`
2. Keep both or delete longer one
3. Test: `/exec`

### Issue: "Command description unclear"

**Problem:** Don't remember what `/gtm` does.

**Solution:**
1. Read command file: `cat commands/gtm.md`
2. Description is in YAML header
3. Or check this README for reference

## Commands vs Slash Commands

**Claude Code has two types of "slash commands":**

1. **Stored prompts** (PM OS commands)
   - Defined in `commands/*.md`
   - Invoke PM skills
   - Domain-specific (PM work)
   - Examples: `/ktlo`, `/voc`, `/charters`

2. **Built-in commands** (Claude Code system)
   - Part of Claude Code itself
   - System functions
   - Examples: `/help`, `/clear`, `/memory`

**PM OS commands** are the ones in this directory. They're custom to your PM workflow.

## Integration with PM OS

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     │ Types /ktlo
     ▼
┌──────────────────┐
│ commands/ktlo.md │ ← Simple wrapper
└────┬─────────────┘
     │
     │ Invokes
     ▼
┌───────────────────────────┐
│ skills/triaging-ktlo/SKILL.md │ ← Full workflow
└────┬──────────────────────────┘
     │
     ├──► Read inputs/jira/
     │
     ├──► Generate outputs/ktlo/
     │
     └──► Copy to history/triaging-ktlo/
```

**Commands are thin wrappers** - the real logic is in skills.

## Customization

### Adding Description

Make command descriptions more helpful:

```markdown
---
description: "Triage KTLO backlog: categorize by theme, prioritize by impact, identify top 3 patterns"
disable-model-invocation: true
---
```

### Adding Aliases

Create multiple commands for same skill:

```bash
cp commands/ktlo.md commands/triage.md
```

Now both `/ktlo` and `/triage` work!

### Organizing by Frequency

You might want to separate:

```
commands/
├── daily/
│   ├── ktlo.md
│   ├── voc.md
│   └── exec-update.md
├── weekly/
│   └── charters.md
└── senior-pm/
    ├── stakeholders.md
    ├── gtm.md
    ├── strategy.md
    └── review.md
```

But current flat structure is simpler and easier to navigate.

## Best Practices

1. **Use commands for daily work** - Saves typing
2. **Keep names short** - `/ktlo` not `/ktlo-triage-backlog`
3. **Add clear descriptions** - Help future you remember what it does
4. **Create aliases** - Multiple commands can point to same skill
5. **Version control** - Commit command changes to track evolution

## See Also

- [skills/README.md](../skills/README.md) - Full skill documentation
- [Main README](../README.md) - Getting started guide
- Claude Code docs on stored prompts: https://code.claude.com/docs/en/stored-prompts
