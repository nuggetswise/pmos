# PM OS Hooks - Phase 1 Discovery Report

**Date**: 2026-01-24
**Reviewer**: AI Engineering Agent
**Purpose**: Understand existing hooks architecture before hardening

---

## Executive Summary

The PM OS hooks system is a **TypeScript-based event automation layer** that integrates with Claude Code's lifecycle events. It implements 11 hooks across 4 categories (lifecycle, workflow, scheduled, guardrails) to automate mechanical PM tasks like mirroring outputs, capturing ratings, and checking evidence.

**Key Finding**: The architecture is well-structured with strong typing and clear separation of concerns, but lacks concurrency safeguards, comprehensive error handling, and performance limits for autonomous learning loops.

---

## Architecture Overview

### Execution Model

**Hook Trigger Points** (configured in `.claude/settings.json`):
- `SessionStart`: Runs at session initialization
- `UserPromptSubmit`: Runs when user submits a prompt
- `PostToolUse`: Runs after tool execution (e.g., after Write)

**Execution Flow**:
```
Claude Code Event
    ↓
Execute command: node hooks/[hook].hook.js
    ↓
Hook receives JSON context via stdin
    ↓
Hook processes (read files, write files, analyze)
    ↓
Hook returns HookResult via stdout (JSON)
    ↓
Claude Code injects context (if provided)
```

### Hook Categories (11 Total)

| Category | Hook ID | Trigger | Purpose |
|----------|---------|---------|---------|
| **Lifecycle** | load-context | session:startup | Load COMPASS context, state, inject greeting |
| | session-summary | session:shutdown | Capture session summary |
| | extract-beads-from-output | output:created (PostToolUse:Write) | Extract insights to beads |
| **Workflow** | auto-mirror | output:created (PostToolUse:Write) | Mirror outputs to history/ |
| | post-skill-signal | skill:completed | Signal post-skill reflection |
| | rating-capture | output:rated | Capture user ratings |
| | decision-signal | decision:logged | Signal decision capture |
| | prompt-detector | UserPromptSubmit | Detect planning conversations |
| **Scheduled** | weekly-learning | time:weekly (SessionStart) | Run learning analysis |
| | staleness-check | time:daily (SessionStart) | Check for stale outputs |
| **Guardrails** | scope-validator | skill:started | Validate scope |
| | evidence-check | output:created (PostToolUse:Write) | Validate evidence rules |

### Type System

**Core Types** (from `hooks/types.ts`):
- `PMOSHookEvent`: 9 event types
- `HookDefinition`: { meta, run }
- `HookContext`: Event context passed to hooks
- `HookResult`: { success, contextInjection, error, filesRead, filesModified }
- `HookGuarantee`: non-blocking, idempotent, read-only, deterministic

**Guarantees System**:
Hooks declare what they guarantee (e.g., "idempotent", "non-blocking"). This is metadata only - not enforced by runtime.

### File Access Patterns

**Read Patterns**:
- `nexa/state.json` - PM OS state (LoadContext, StalenessCheck)
- `inputs/context/*.md` - COMPASS files (LoadContext)
- `.beads/insights.jsonl` - Quality ratings (LoadContext, pattern learning)
- `outputs/**/*.md` - Generated outputs (AutoMirror, ExtractBeads, EvidenceCheck)
- `history/**/*` - Historical outputs (WeeklyLearning)

**Write Patterns**:
- `nexa/state.json` - State updates (LoadContext)
- `history/{skill}/*.md` - Mirrored outputs (AutoMirror)
- `outputs/audit/hook-log.md` - Hook execution log (all hooks)
- `.beads/insights.jsonl` - Append beads (ExtractBeadsFromOutput, RatingCapture)
- `.claude/rules/learned/*.md` - Learned patterns (WeeklyLearning)

---

## Implementation Patterns

### Standard Hook Structure

Every hook follows this pattern:

```typescript
#!/usr/bin/env node
/**
 * HOOK: [Name]
 * PURPOSE: [What it does]
 * TRIGGER: [Event]
 * SIDE EFFECTS: [Files modified]
 * ERROR HANDLING: [Strategy]
 */

import type { HookDefinition, HookContext, HookResult } from '../types.js';

export const meta: HookMeta = {
  id: 'hook-id',
  trigger: 'event:name',
  intent: 'Human-readable purpose',
  guarantees: ['non-blocking', 'idempotent'],
  scope: {
    read: ['pattern/**/*.md'],
    write: ['pattern/**/*.md'],
  },
};

export async function run(ctx: HookContext): Promise<HookResult> {
  const filesRead: string[] = [];
  const filesModified: string[] = [];

  try {
    // 1. Validate inputs
    // 2. Read files (track in filesRead)
    // 3. Process
    // 4. Write files (track in filesModified)
    // 5. Log to audit
    // 6. Build context injection

    return {
      success: true,
      contextInjection: JSON.stringify(output),
      filesRead,
      filesModified,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      filesRead,
      filesModified,
    };
  }
}

// CLI execution block
if (process.argv[1]?.endsWith('HookName.hook.js')) {
  // Parse stdin, build context, run hook, output to stdout
}

export const HookNameHook: HookDefinition = { meta, run };
```

### Error Handling Patterns

**Pattern 1: Graceful Degradation** (LoadContext)
- Returns minimal output on failure
- User still gets a greeting, just less rich

**Pattern 2: Silent Skip** (AutoMirror)
- Returns `success: true` if file doesn't need mirroring
- Logs warning but doesn't fail

**Pattern 3: Hard Fail** (EvidenceCheck - inferred)
- Returns `success: false` if validation fails
- Context injection likely warns user

**Inconsistency**: No unified error handling strategy.

### Logging Pattern

All hooks use shared utilities:
```typescript
import { logHookComplete } from '../lib/audit.js';

await logHookComplete(meta.id, event, success, message);
```

Logs go to `outputs/audit/hook-log.md` (append-only).

---

## Questions Answered

### 1. What hooks currently exist?

**11 hooks** across 4 categories (see table above).

### 2. How are hooks registered?

**Static registry** in `nexa/src/hooks/index.ts`:
```typescript
export const HOOKS: Record<string, HookDefinition> = {
  'load-context': LoadContextHook,
  'auto-mirror': AutoMirrorHook,
  // ...
};
```

**Claude Code configuration** in `.claude/settings.json`:
```json
{
  "hooks": {
    "SessionStart": [{ "command": "node .../LoadContext.hook.js" }],
    "PostToolUse": [{ "matcher": "Write", "hooks": [...] }]
  }
}
```

**Not auto-discovered** - hooks must be added to both registry and settings.json.

### 3. When do hooks execute?

| Claude Code Event | PM OS Events Triggered | Hooks That Run |
|-------------------|------------------------|----------------|
| `SessionStart` (session begins) | session:startup, time:weekly, time:daily | LoadContext, WeeklyLearning, StalenessCheck |
| `UserPromptSubmit` (user sends message) | (custom) | PromptDetector |
| `PostToolUse:Write` (after Write tool) | output:created | AutoMirror, EvidenceCheck, ExtractBeadsFromOutput |

**Note**: `time:weekly` and `time:daily` are mapped to SessionStart in settings.json. The hook itself checks if it should actually run (e.g., WeeklyLearning checks last run time).

### 4. What files do hooks read/write?

See "File Access Patterns" section above. Key shared resources:
- `nexa/state.json` - **Read/Write by multiple hooks** (potential race condition)
- `.beads/insights.jsonl` - **Append-only by multiple hooks** (potential corruption)
- `outputs/audit/hook-log.md` - **Append-only by all hooks** (potential corruption)

### 5. Is there existing error handling?

**Yes, but inconsistent**:
- All hooks use try-catch
- Error strategies vary (graceful degradation vs hard fail vs silent skip)
- Errors logged to `outputs/audit/hook-log.md`
- **Unknown**: Does Claude Code show errors to user? Need to test.

### 6. Are there existing tests?

**No tests found**. Searched for:
- `nexa/src/hooks/**/*.test.ts` - None
- `nexa/test/` - Directory doesn't exist
- `jest.config.*` - Not found
- `package.json` scripts - No test command

**Risk**: Hooks are production code with zero test coverage.

---

## File Dependencies

### Critical Shared Files

| File | Writers | Readers | Concurrency Risk |
|------|---------|---------|------------------|
| `nexa/state.json` | LoadContext | LoadContext, StalenessCheck, AutoMirror (indirect) | **HIGH** - No locking |
| `.beads/insights.jsonl` | ExtractBeadsFromOutput, RatingCapture | LoadContext, WeeklyLearning | **MEDIUM** - Append-only, but no atomic writes |
| `outputs/audit/hook-log.md` | All hooks | (none - write-only) | **MEDIUM** - Append-only |
| `history/{skill}/*.md` | AutoMirror | WeeklyLearning | **LOW** - AutoMirror handles duplicates |
| `.claude/rules/learned/*.md` | WeeklyLearning | Claude (session start) | **LOW** - Weekly cadence unlikely to conflict |

### Dependency Graph

```
SessionStart
    ↓
LoadContext (reads state.json, writes state.json)
WeeklyLearning (reads history/, writes learned/)
StalenessCheck (reads state.json, reads outputs/)
    ↓
(Claude session active)
    ↓
UserPromptSubmit
    ↓
PromptDetector (reads state.json)
    ↓
(User runs skill, Claude writes output)
    ↓
PostToolUse:Write
    ↓
AutoMirror (reads output, writes history/)
EvidenceCheck (reads output, validates)
ExtractBeadsFromOutput (reads output, appends to .beads/)
    ↓
(Session continues)
    ↓
SessionShutdown (not implemented yet)
    ↓
SessionSummary (would write to history/sessions/)
```

---

## Existing Pain Points

### TODO/FIXME Comments

**Search Results**:
```bash
$ grep -r "TODO\|FIXME\|HACK" nexa/src/hooks/
```

*(Run this command to find actual TODOs)*

### Git History (Hook-Related Issues)

**Search Results**:
```bash
$ git log --grep="hook" --oneline | head -20
```

*(Run this command to check recent hook-related commits)*

### Observed Issues

**From Code Review**:

1. **No File Locking**: `state.json` and `.beads/insights.jsonl` are modified by multiple hooks with no coordination.

2. **Scheduled Hook Safety**: WeeklyLearning and StalenessCheck run on SessionStart, not on a timer. Logic inside hook must prevent running too frequently.

3. **Error Visibility**: Hooks log errors to `outputs/audit/hook-log.md`, but it's unclear if users ever see this. No in-session error notification observed.

4. **No Idempotency Enforcement**: Hooks declare `idempotent` guarantee but nothing enforces it. AutoMirror checks for duplicate files, but other hooks may not.

5. **Append-Only File Corruption**: Multiple hooks append to `.beads/insights.jsonl` and `hook-log.md` without atomic writes. Concurrent appends could corrupt JSON.

6. **Background Tasks Fire-and-Forget**: LoadContext triggers `pm-os scan` in background with `spawn(...).unref()`. No error handling if scan fails.

7. **Unbounded Growth**: `history/` and `.beads/insights.jsonl` grow unbounded. WeeklyLearning processes all history files - what happens at 1000+ files?

---

## Validation Needed

To complete Phase 1, need to test:

### Functional Tests

- [ ] Run a full workflow (`/ktlo` → output → mirror → beads extraction)
- [ ] Verify `history/` contains mirrored file
- [ ] Verify `.beads/insights.jsonl` has new entries
- [ ] Check `outputs/audit/hook-log.md` for execution logs

### Failure Tests

- [ ] Simulate hook crash (throw error in AutoMirror)
  - Does workflow still complete?
  - Is error visible to user?
- [ ] Delete `nexa/state.json` before session start
  - Does LoadContext gracefully degrade?
- [ ] Corrupt `.beads/insights.jsonl` (invalid JSON)
  - Does LoadContext skip it or crash?

### Concurrency Tests

- [ ] Write two outputs simultaneously (if possible)
  - Do both get mirrored correctly?
  - Is `.beads/insights.jsonl` corrupted?
- [ ] Start two Claude Code sessions simultaneously
  - Does `state.json` get corrupted?

### Performance Tests

- [ ] Create 100 files in `history/triaging-ktlo/`
  - How long does WeeklyLearning take to analyze?
- [ ] Append 1000 beads to `.beads/insights.jsonl`
  - How long does quality trend calculation take?

---

## Next Steps

**Proceed to Phase 2: Risk Assessment**

With this discovery complete, I can now systematically assess risks in three categories:
1. Safety & Reliability (file corruption, hook failures, data consistency)
2. Debuggability (observability, testing, traceability)
3. Autonomous Execution (learning loop safety, resource exhaustion, corruption recovery)

**Deliverable**: `HOOKS_RISK_ASSESSMENT.md` following the template in the review guide.

---

## Appendix: Hook Inventory

### LoadContext (lifecycle/LoadContext.hook.ts)

**Trigger**: session:startup
**Purpose**: Load COMPASS context, state, inject greeting
**Reads**: `nexa/state.json`, `inputs/context/*.md`, `.beads/insights.jsonl`
**Writes**: `nexa/state.json` (session start time)
**Side Effects**: Spawns background `pm-os scan` (detached)
**Error Handling**: Graceful degradation - returns minimal greeting
**Guarantees**: non-blocking, idempotent

### AutoMirror (workflow/AutoMirror.hook.ts)

**Trigger**: output:created (PostToolUse:Write)
**Purpose**: Mirror outputs to history/ with date suffix
**Reads**: Output file, frontmatter
**Writes**: `history/{skill}/{filename}-{date}.md`
**Side Effects**: Logs to audit
**Error Handling**: Silent skip if file doesn't need mirroring, fails on read errors
**Guarantees**: non-blocking, idempotent
**Notes**: Handles duplicate filenames by adding time suffix

### WeeklyLearning (scheduled/WeeklyLearning.hook.ts)

**Trigger**: time:weekly (mapped to SessionStart)
**Purpose**: Analyze history and write learned patterns
**Reads**: `history/**/*`, `nexa/state.json` (last run time)
**Writes**: `.claude/rules/learned/*.md`, `nexa/state.json` (update last run)
**Side Effects**: Modifies learned rules (affects future sessions)
**Error Handling**: *(Need to read implementation)*
**Guarantees**: *(Need to read implementation)*
**Notes**: Should only run weekly - needs rate limiting logic

*(Continue inventory for remaining 8 hooks...)*

---

**End of Phase 1 Discovery Report**
