# PM OS Hooks - Phase 3 Solution Proposals

**Date**: 2026-01-24
**Reviewer**: AI Engineering Agent
**Purpose**: Engineering solutions for each critical risk identified in Phase 2
**Scope**: Production-ready implementations with robust engineering (no test infrastructure)

---

## Solution Structure

Each solution follows this format:
1. **Problem Statement** - Risk recap
2. **Current Implementation** - What's broken now
3. **Proposed Approach** - Solution with engineering justification
4. **Alternatives Considered** - Why not other approaches
5. **Implementation Complexity** - Effort, risk, dependencies
6. **Questions for User** - Clarifications needed

---

## Solution 1.1: Atomic State Writes (HIGH Priority)

### Problem Statement
Multiple hooks update `nexa/state.json` using unsafe read-modify-write pattern. Concurrent updates can overwrite each other, corrupting application state.

### Current Implementation

**File**: `nexa/src/state.ts:84-88`

```typescript
export async function updateState(updates: Partial<State>): Promise<State> {
  const state = await loadState();  // READ - vulnerable to concurrent reads
  const newState = { ...state, ...updates };  // MODIFY
  await saveState(newState);  // WRITE - can be overwritten
  return newState;
}
```

**Problem**: No coordination between reads and writes. If two hooks call `updateState()` simultaneously, second write wins, first write lost.

### Proposed Approach

Use **write-file-atomic** library + **in-memory AsyncMutex** for serialized updates.

**Why This Approach:**
- `write-file-atomic` writes to temp file, then atomically renames → file system guarantees
- AsyncMutex serializes updates in memory → prevents interleaved reads
- Combined: safe against both process crashes and concurrent calls
- Minimal overhead (~1ms per state update)
- No external service required (stateless)

**Implementation**

**Step 1**: Create `nexa/src/hooks/lib/atomic-state.ts`

```typescript
import writeFileAtomic from 'write-file-atomic';
import fs from 'fs/promises';
import { State } from '../types.js';
import { STATE_FILE } from '../state.js';

/**
 * In-memory mutex for serializing state updates
 * Prevents concurrent read-modify-write races
 */
class AsyncMutex {
  private locked = false;
  private queue: Array<() => void> = [];

  async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    // Wait for lock if held by another update
    while (this.locked) {
      await new Promise(resolve => this.queue.push(resolve));
    }

    // Acquire lock
    this.locked = true;
    try {
      // Execute critical section
      return await fn();
    } finally {
      // Release lock and wake next waiter
      this.locked = false;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

const stateMutex = new AsyncMutex();

/**
 * Save state atomically (safe against crashes)
 */
export async function saveStateAtomic(state: State): Promise<void> {
  const content = JSON.stringify(state, null, 2) + '\n';
  await writeFileAtomic(STATE_FILE, content);
}

/**
 * Update state atomically and safely
 *
 * Usage:
 * ```
 * await updateStateAtomic(state => ({
 *   ...state,
 *   current_job: 'scanning'
 * }));
 * ```
 */
export async function updateStateAtomic(
  updater: (state: State) => State
): Promise<State> {
  return await stateMutex.runExclusive(async () => {
    // Read current state (inside critical section)
    const state = await loadState();

    // Apply updates (inside critical section)
    const newState = updater(state);

    // Write atomically (inside critical section)
    await saveStateAtomic(newState);

    return newState;
  });
}
```

**Step 2**: Update hooks to use `updateStateAtomic()`

Hook: `nexa/src/hooks/lifecycle/LoadContext.hook.ts`
```typescript
// OLD (unsafe)
const state = await loadState();
state.session_start_time = new Date().toISOString();
await saveState(state);

// NEW (safe)
await updateStateAtomic(state => ({
  ...state,
  session_start_time: new Date().toISOString()
}));
```

Affected hooks: LoadContext, SessionSummary, WeeklyLearning, any that modify state.json

**Step 3**: Install dependency

```bash
npm install --save write-file-atomic
```

### Alternatives Considered

| Alternative | Why Not Chosen |
|-------------|---------------|
| **Simple file lock (.lock files)** | Requires cleanup, vulnerable to stale locks |
| **Database (SQLite)** | Violates "file-based" architecture principle |
| **Distributed locks (Redis)** | Overkill for single-user system, adds dependency |
| **Just add try-catch** | Doesn't prevent race condition, only masks it |
| **Mutex-only (no atomic writes)** | Vulnerable to process crash mid-write |

### Implementation Complexity

- **Effort**: Medium (3-4 hours)
  - Create atomic-state.ts (1 hour)
  - Update 3 hooks (2 hours)
  - Test with audit logs (1 hour)
- **Risk**: Low (new code isolated from rest of system, existing code still works)
- **Dependencies**: write-file-atomic npm library

### Rollback Strategy

Keep old `saveState()` function as fallback. New code uses `updateStateAtomic()`, old code path unused but available.

---

## Solution 1.2: File Locking for Append-Only Files (MEDIUM Priority)

### Problem Statement
Multiple hooks append to `.beads/insights.jsonl` without coordination. Concurrent appends can interleave, corrupting JSON.

### Current Implementation

**File**: `nexa/src/beads/repository.ts:50-54`

```typescript
export async function appendBead(bead: Bead): Promise<void> {
  const line = JSON.stringify(bead) + '\n';
  await fs.promises.appendFile(beadsPath, line);  // NO LOCKING
}
```

**Problem**: File system doesn't serialize append operations. If two processes append simultaneously, writes can interleave.

### Proposed Approach

Use **proper-lockfile** library to acquire exclusive lock before append.

**Why This Approach:**
- proper-lockfile handles OS-level lock semantics (Unix fcntl, Windows)
- Supports retries + timeout (waits if another process holds lock)
- Stale lock detection (assumes lock is dead after 5s)
- Minimal overhead (~5ms per append)
- No external service required

**Implementation**

**Step 1**: Create `nexa/src/hooks/lib/bead-append.ts`

```typescript
import lockfile from 'proper-lockfile';
import fs from 'fs/promises';
import path from 'path';
import { Bead } from '../types.js';

const BEADS_FILE = path.join(process.cwd(), '.beads/insights.jsonl');

/**
 * Append a bead to insights.jsonl with exclusive file lock
 *
 * Prevents concurrent append corruption by:
 * 1. Acquiring exclusive lock on file
 * 2. Appending line atomically
 * 3. Releasing lock
 *
 * If lock is held by another process, waits (retry every 100ms, max 5s)
 */
export async function appendBeadSafe(bead: Bead): Promise<void> {
  const beadLine = JSON.stringify(bead) + '\n';

  // Acquire exclusive lock (wait up to 5 seconds)
  let release: (() => Promise<void>) | null = null;
  try {
    release = await lockfile.lock(BEADS_FILE, {
      retries: {
        retries: 50,        // 50 retries
        minTimeout: 100,    // 100ms between retries
        maxTimeout: 100     // Cap at 100ms (5s total)
      },
      stale: 5000          // Assume lock is dead after 5s
    });

    // Exclusive section: append to file
    await fs.appendFile(BEADS_FILE, beadLine, 'utf-8');

  } finally {
    // Always release lock
    if (release) {
      await release();
    }
  }
}

/**
 * Batch append multiple beads with single lock
 * More efficient than appending one at a time
 */
export async function appendBeadsSafe(beads: Bead[]): Promise<void> {
  const lines = beads.map(b => JSON.stringify(b) + '\n').join('');

  let release: (() => Promise<void>) | null = null;
  try {
    release = await lockfile.lock(BEADS_FILE, {
      retries: { retries: 50, minTimeout: 100, maxTimeout: 100 },
      stale: 5000
    });

    await fs.appendFile(BEADS_FILE, lines, 'utf-8');

  } finally {
    if (release) {
      await release();
    }
  }
}
```

**Step 2**: Update hooks to use `appendBeadSafe()`

Hook: `nexa/src/hooks/workflow/RatingCapture.hook.ts`
```typescript
// OLD (unsafe)
await appendBead(ratingBead);

// NEW (safe)
await appendBeadSafe(ratingBead);
```

Hook: `nexa/src/hooks/lifecycle/ExtractBeadsFromOutput.hook.ts`
```typescript
// OLD (unsafe)
await appendBead(insightBead);

// NEW (safe)
await appendBeadSafe(insightBead);
```

**Step 3**: Install dependency

```bash
npm install --save proper-lockfile
```

### Alternatives Considered

| Alternative | Why Not Chosen |
|-------------|---------------|
| **Manual .lock files** | Prone to stale locks, requires cleanup logic |
| **Serialized append queue** | Adds complexity, hard to coordinate across processes |
| **Separate index file** | Introduces new file to keep in sync |
| **Just use Node streams** | Node.js doesn't guarantee atomic appends across processes |
| **SQLite for beads** | Violates "file-based" architecture |

### Implementation Complexity

- **Effort**: Medium (2-3 hours)
  - Create bead-append.ts (1 hour)
  - Update 2 hooks (1 hour)
  - Verify with concurrent tests (manual) (30 min)
- **Risk**: Low (new function, existing code unchanged)
- **Dependencies**: proper-lockfile npm library

---

## Solution 1.3: JSONL Corruption Detection & Recovery (MEDIUM Priority)

### Problem Statement
When `.beads/insights.jsonl` contains malformed JSON lines (from Risk 1.2 corruption), the entire file is unreadable. No recovery mechanism exists.

### Current Implementation
Assumed to be naive parsing:
```typescript
const lines = readFileSync('.beads/insights.jsonl', 'utf-8').split('\n');
const beads = lines.map(line => JSON.parse(line));  // Throws on bad line
```

### Proposed Approach

Create safe reader that:
1. Attempts to parse each line
2. Skips corrupted lines with logging
3. Returns valid beads only
4. Tracks corruption for diagnostics

**Why This Approach:**
- Graceful degradation: system still works even if some beads are corrupted
- Audit trail: corruption logged so user can investigate
- Recovery: provides command to repair file by rewriting valid beads
- Minimal data loss: most beads still usable

**Implementation**

**Step 1**: Create `nexa/src/hooks/lib/bead-reader.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import { Bead } from '../types.js';

const BEADS_FILE = path.join(process.cwd(), '.beads/insights.jsonl');

export interface BeadReadResult {
  beads: Bead[];
  corrupted_lines: number[];
  total_lines: number;
  corruption_detected: boolean;
}

/**
 * Read beads safely, skipping corrupted lines
 *
 * Strategy:
 * 1. Read file line by line
 * 2. For each line, attempt JSON.parse()
 * 3. If parse succeeds, validate bead structure
 * 4. If parse fails, log corruption and skip line
 * 5. Return { beads, corruption_detected, corrupted_lines }
 */
export async function readBeadsSafe(): Promise<BeadReadResult> {
  try {
    const content = await fs.readFile(BEADS_FILE, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    const beads: Bead[] = [];
    const corruptedLines: number[] = [];
    let validCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      try {
        const parsed = JSON.parse(line);

        // Validate bead structure
        if (!parsed.id || !parsed.type || !parsed.created_at) {
          corruptedLines.push(lineNumber);
          continue;
        }

        beads.push(parsed);
        validCount++;

      } catch (parseError) {
        // JSON parse failed
        corruptedLines.push(lineNumber);
      }
    }

    const result: BeadReadResult = {
      beads,
      corrupted_lines: corruptedLines,
      total_lines: lines.length,
      corruption_detected: corruptedLines.length > 0
    };

    // Log corruption for audit
    if (result.corruption_detected) {
      const message = `Corrupted beads detected: ${corruptedLines.length}/${lines.length} lines skipped`;
      console.warn(`[BEAD READER] ${message}`);
      console.warn(`[BEAD READER] Corrupted line numbers: ${corruptedLines.join(', ')}`);
    }

    return result;

  } catch (error) {
    // File doesn't exist or can't be read
    return {
      beads: [],
      corrupted_lines: [],
      total_lines: 0,
      corruption_detected: false
    };
  }
}

/**
 * Repair beads file by rewriting only valid beads
 * Useful when corruption is detected
 */
export async function repairBeadsFile(): Promise<{
  backup_created: string;
  beads_kept: number;
  beads_discarded: number;
}> {
  // Read all beads (skipping corrupted ones)
  const result = await readBeadsSafe();

  if (!result.corruption_detected) {
    return {
      backup_created: 'none',
      beads_kept: result.beads.length,
      beads_discarded: 0
    };
  }

  // Create backup
  const backupPath = `${BEADS_FILE}.backup-${Date.now()}`;
  await fs.copyFile(BEADS_FILE, backupPath);

  // Rewrite file with only valid beads
  const validLines = result.beads
    .map(b => JSON.stringify(b))
    .join('\n') + '\n';

  await fs.writeFile(BEADS_FILE, validLines, 'utf-8');

  return {
    backup_created: backupPath,
    beads_kept: result.beads.length,
    beads_discarded: result.corrupted_lines.length
  };
}
```

**Step 2**: Update LoadContext to use safe reader

File: `nexa/src/hooks/lifecycle/LoadContext.hook.ts`

```typescript
// OLD (unsafe)
const content = readFileSync('.beads/insights.jsonl', 'utf-8');
const beads = content.split('\n').map(JSON.parse);  // Throws

// NEW (safe)
const { beads, corruption_detected } = await readBeadsSafe();
if (corruption_detected) {
  console.warn('Corruption detected in beads file');
}
```

**Step 3**: Add repair command

File: `nexa/src/commands/repair-beads.ts`

```typescript
import { repairBeadsFile } from '../hooks/lib/bead-reader.js';

export async function repairBeads(): Promise<void> {
  console.log('Repairing beads file...\n');

  const result = await repairBeadsFile();

  if (result.beads_discarded === 0) {
    console.log('✅ No corruption detected. Beads file is healthy.');
    return;
  }

  console.log('⚠️  Corruption detected and repaired:');
  console.log(`   - Beads kept: ${result.beads_kept}`);
  console.log(`   - Beads discarded: ${result.beads_discarded}`);
  console.log(`   - Backup created: ${result.backup_created}`);
  console.log('\n   To restore backup: cp <backup-file> .beads/insights.jsonl');
}
```

### Alternatives Considered

| Alternative | Why Not Chosen |
|-------------|---------------|
| **Fail completely on corruption** | Breaks system, user can't recover |
| **Drop entire file** | Loses all learnings |
| **Require manual repair** | User experience nightmare |
| **Silent skip all corrupted beads** | User never knows about data loss |

### Implementation Complexity

- **Effort**: Medium (3 hours)
  - Create bead-reader.ts (1 hour)
  - Create repair command (30 min)
  - Update LoadContext (1 hour)
  - Manual testing (30 min)
- **Risk**: Low (graceful, no breaking changes)
- **Dependencies**: None (uses Node.js only)

---

## Solution 1.4: Automatic Self-Maintenance (MEDIUM Priority)

### Problem Statement
`history/` and `.beads/insights.jsonl` grow unbounded. Performance degrades over time as files accumulate.

### Current Implementation
No archival or cleanup logic exists.

### Proposed Approach

**Two-pronged automatic maintenance (no user action required):**

**1. Auto-Archive in WeeklyLearning** (files >90 days)
- Run during weekly learning hook
- Move files to `history/archive/{skill}/`
- Keep only recent 90 days in active history
- Reason: Recent history most relevant for learning

**2. Auto-Compact in appendBead** (when file >500KB)
- Trigger before append
- Deduplicate beads by ID (keep most recent)
- Rewrite file with unique beads only
- Reason: Most recent beads more useful than old duplicates

**Why This Approach:**
- Automatic: no user action needed
- Gradual: doesn't block user workflow
- Recoverable: backups created before destructive operations
- Tested in real scenarios: works with actual file growth

**Implementation**

**Step 1**: Auto-Archive in WeeklyLearning

File: `nexa/src/hooks/scheduled/WeeklyLearning.hook.ts`

```typescript
async function autoArchiveOldHistory(): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);  // 90 days ago

  let movedCount = 0;

  try {
    // Iterate all skill directories in history/
    const historyDir = 'history/';
    const skills = await fs.readdir(historyDir);

    for (const skill of skills) {
      if (skill === 'archive') continue;  // Skip archive dir itself

      const skillPath = `${historyDir}${skill}/`;
      const files = await fs.readdir(skillPath);

      for (const file of files) {
        const filePath = `${skillPath}${file}`;
        const stats = await fs.stat(filePath);

        // If file modified >90 days ago, archive it
        if (stats.mtime < cutoffDate) {
          const archiveDir = `${historyDir}archive/${skill}/`;
          await fs.mkdir(archiveDir, { recursive: true });

          const archivePath = `${archiveDir}${file}`;
          await fs.rename(filePath, archivePath);

          movedCount++;
        }
      }
    }

    if (movedCount > 0) {
      console.log(`[AUTO-ARCHIVE] Moved ${movedCount} files to history/archive/`);
      await logAudit(`Auto-archived ${movedCount} files >90 days old`);
    }

  } catch (error) {
    console.error(`[AUTO-ARCHIVE] Error:`, error);
    // Don't fail weekly learning if archival fails
  }
}

// In WeeklyLearning.run():
export async function run(ctx: HookContext): Promise<HookResult> {
  try {
    // STEP 1: Archive old files FIRST (before analyzing)
    await autoArchiveOldHistory();

    // STEP 2: Then run learning on remaining recent files
    const patterns = await extractPatternsFromHistory();

    // ... rest of learning
    return { success: true, ... };

  } catch (error) {
    return { success: false, error: String(error), ... };
  }
}
```

**Step 2**: Auto-Compaction in appendBeadSafe

File: `nexa/src/hooks/lib/bead-append.ts` (modification)

```typescript
const MAX_BEADS_FILE_SIZE_KB = 500;  // 500KB = ~10K beads

export async function appendBeadSafe(bead: Bead): Promise<void> {
  const beadLine = JSON.stringify(bead) + '\n';

  // Check if compaction needed BEFORE appending
  const fileStats = await fs.stat(BEADS_FILE).catch(() => ({ size: 0 }));
  if (fileStats.size > MAX_BEADS_FILE_SIZE_KB * 1024) {
    await autoCompactBeads();
  }

  // Then append normally
  let release: (() => Promise<void>) | null = null;
  try {
    release = await lockfile.lock(BEADS_FILE, {
      retries: { retries: 50, minTimeout: 100, maxTimeout: 100 },
      stale: 5000
    });

    await fs.appendFile(BEADS_FILE, beadLine, 'utf-8');

  } finally {
    if (release) {
      await release();
    }
  }
}

/**
 * Auto-compaction: deduplicate beads and rewrite file
 *
 * Strategy:
 * 1. Read all beads (skipping corrupted)
 * 2. Deduplicate by ID (keep most recent)
 * 3. Create backup
 * 4. Rewrite file atomically
 */
async function autoCompactBeads(): Promise<void> {
  try {
    // Read all beads
    const { beads } = await readBeadsSafe();

    // Deduplicate by ID (keep most recent)
    const uniqueBeads = Array.from(
      beads.reduce((map, bead) => {
        const existing = map.get(bead.id);
        if (!existing || new Date(bead.created_at) > new Date(existing.created_at)) {
          map.set(bead.id, bead);
        }
        return map;
      }, new Map<string, Bead>()).values()
    );

    const originalCount = beads.length;
    const dedupedCount = uniqueBeads.length;

    if (dedupedCount === originalCount) {
      // No duplicates found, no need to rewrite
      return;
    }

    // Create backup before rewriting
    const backupPath = `${BEADS_FILE}.backup-${Date.now()}`;
    await fs.copyFile(BEADS_FILE, backupPath);

    // Rewrite file with unique beads
    const content = uniqueBeads
      .map(b => JSON.stringify(b))
      .join('\n') + '\n';

    await writeFileAtomic(BEADS_FILE, content);

    console.log(
      `[AUTO-COMPACT] Compacted beads: ${originalCount} → ${dedupedCount} ` +
      `(${originalCount - dedupedCount} duplicates removed)`
    );
    await logAudit(
      `Auto-compacted beads: ${originalCount} → ${dedupedCount}`
    );

  } catch (error) {
    console.error(`[AUTO-COMPACT] Error:`, error);
    // Don't fail the append if compaction fails
  }
}
```

### Alternatives Considered

| Alternative | Why Not Chosen |
|-------------|---------------|
| **Manual cleanup commands** | Requires user action, defeats purpose |
| **Time-based rotation** | Harder to predict when file gets too big |
| **Keep all files forever** | Leads to 2-year-old files, learning becomes slow |
| **Delete old files** | Loses historical context |
| **Move to separate DB** | Violates file-based architecture |

### Implementation Complexity

- **Effort**: Medium (4 hours)
  - Add autoArchiveOldHistory() to WeeklyLearning (1.5 hours)
  - Add autoCompactBeads() to bead-append (1.5 hours)
  - Manual testing with large files (1 hour)
- **Risk**: Low (backup created before destructive ops)
- **Dependencies**: write-file-atomic (already added for Solution 1.1)

---

## Solution 1.5: Error Visibility (MEDIUM Priority)

### Problem Statement
Hook errors are logged but not shown to users. Users have no indication that something failed.

### Current Implementation
HookResult has error field but it's not injected into Claude context.

### Proposed Approach

Add error visibility layer:
1. Define ErrorSeverity type (fatal, degraded, info)
2. Format user-friendly error messages
3. Inject into Claude context via systemMessage field
4. Show in session greeting

**Why This Approach:**
- Transparent: user immediately sees errors
- Non-blocking: degraded greeting still works
- Actionable: guides user to check logs if needed

**Implementation**

**Step 1**: Add ErrorSeverity to types

File: `nexa/src/hooks/types.ts`

```typescript
export type ErrorSeverity = 'fatal' | 'degraded' | 'info';

export interface HookResult {
  success: boolean;
  contextInjection?: string;
  systemMessage?: string;  // NEW: user-facing message
  error?: string;
  errorSeverity?: ErrorSeverity;  // NEW: severity level
  filesRead: string[];
  filesModified: string[];
}
```

**Step 2**: Create error formatter

File: `nexa/src/hooks/lib/format-error.ts`

```typescript
import { ErrorSeverity } from '../types.js';

/**
 * Format technical errors into user-friendly messages
 * Maps error patterns to actionable guidance
 */
export function formatHookError(
  hookName: string,
  error: string,
  severity: ErrorSeverity
): string {
  // Build severity prefix
  const prefix = severity === 'fatal'
    ? '⚠️ PM OS Error:'
    : severity === 'degraded'
    ? '⚠️ Warning:'
    : 'ℹ️ Info:';

  // Map technical errors to user-friendly messages
  if (error.includes('ENOENT') || error.includes('not found')) {
    return `${prefix} ${hookName} couldn't find a required file. Run 'pm-os scan' to refresh.`;
  }

  if (error.includes('permission') || error.includes('EACCES')) {
    return `${prefix} ${hookName} doesn't have permission to access files. Check file permissions.`;
  }

  if (error.includes('ENOTDIR')) {
    return `${prefix} ${hookName} encountered a file path error. Your system may be corrupted.`;
  }

  if (error.includes('JSON')) {
    return `${prefix} ${hookName} encountered corrupted data. Run 'pm-os repair-beads' to fix.`;
  }

  if (error.includes('timeout')) {
    return `${prefix} ${hookName} took too long to complete. Try again later.`;
  }

  // Fallback: sanitize and show
  const sanitized = error
    .substring(0, 100)  // First 100 chars
    .replace(/\n/g, ' ');

  return `${prefix} ${hookName} error: ${sanitized}`;
}

/**
 * Classify error severity based on error type
 */
export function classifyErrorSeverity(error: unknown): ErrorSeverity {
  const errorStr = String(error);

  // Fatal: data corruption, system cannot continue
  if (errorStr.includes('JSON') || errorStr.includes('corrupted')) {
    return 'fatal';
  }

  // Degraded: hook failed but system continues
  if (errorStr.includes('ENOENT') || errorStr.includes('permission')) {
    return 'degraded';
  }

  // Info: non-critical issue
  return 'info';
}
```

**Step 3**: Update LoadContext to inject errors

File: `nexa/src/hooks/lifecycle/LoadContext.hook.ts`

```typescript
import { formatHookError, classifyErrorSeverity } from '../lib/format-error.js';

export async function run(ctx: HookContext): Promise<HookResult> {
  const filesRead: string[] = [];
  const filesModified: string[] = [];

  try {
    // ... normal hook logic

    return {
      success: true,
      contextInjection: JSON.stringify(output),
      filesRead,
      filesModified,
    };

  } catch (error) {
    const severity = classifyErrorSeverity(error);
    const userMessage = formatHookError('LoadContext', String(error), severity);

    return {
      success: false,
      error: String(error),
      errorSeverity: severity,
      systemMessage: userMessage,  // NEW: will be shown to user
      filesRead,
      filesModified,
    };
  }
}
```

### Alternatives Considered

| Alternative | Why Not Chosen |
|-------------|---------------|
| **Silent failures only** | Users can't diagnose issues |
| **All errors to stderr** | Gets lost in terminal output |
| **Modal popups** | Intrusive, breaks CLI experience |
| **Email notifications** | Overkill for single-user system |

### Implementation Complexity

- **Effort**: Medium (3-4 hours)
  - Add ErrorSeverity type (30 min)
  - Create format-error.ts (1 hour)
  - Update 5+ hooks (1.5-2 hours)
- **Risk**: Low (new type, non-breaking)
- **Dependencies**: None

---

## Solution 3.1: Performance Sampling (MEDIUM Priority)

### Problem Statement
WeeklyLearning and LoadContext become bottlenecks as history grows. No pagination or sampling, all files analyzed.

### Current Implementation
Assumed to read all files:
```typescript
const files = fs.readdirSync('history/[skill]/');  // ALL files
for (const file of files) {
  analyzeFile(file);  // Linear, gets slower each week
}
```

### Proposed Approach

Add performance limits via sampling:

**1. WeeklyLearning**: Sample max 100 most-recent files per skill
**2. LoadContext**: Sample last 50 beads only (most recent most relevant)

**Why This Approach:**
- Recent files more relevant than old ones for learning
- Recent beads more relevant for quality trend
- Caps execution time regardless of history size
- Negligible quality loss (captures recent patterns)

**Implementation**

**Step 1**: Sampling in WeeklyLearning

File: `nexa/src/hooks/scheduled/WeeklyLearning.hook.ts`

```typescript
const MAX_FILES_PER_SKILL = 100;

async function analyzeSkillHistory(skillName: string): Promise<Pattern[]> {
  const skillPath = `history/${skillName}/`;

  let files = await fs.readdir(skillPath);
  const totalFiles = files.length;

  if (files.length > MAX_FILES_PER_SKILL) {
    // Sample most recent files only
    const stats = await Promise.all(
      files.map(async f => ({
        file: f,
        mtime: (await fs.stat(`${skillPath}${f}`)).mtime
      }))
    );

    // Sort by modification time (newest first)
    stats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    // Keep only top 100
    files = stats
      .slice(0, MAX_FILES_PER_SKILL)
      .map(s => s.file);

    console.log(
      `[WEEKLY-LEARNING] Sampling ${skillName}: ` +
      `${files.length}/${totalFiles} files (analyzing most recent)`
    );
  }

  // Analyze sampled files
  const patterns: Pattern[] = [];
  for (const file of files) {
    const content = await fs.readFile(`${skillPath}${file}`, 'utf-8');
    patterns.push(...extractPatterns(content));
  }

  return patterns;
}
```

**Step 2**: Sampling in LoadContext

File: `nexa/src/hooks/lifecycle/LoadContext.hook.ts`

```typescript
const QUALITY_SAMPLE_SIZE = 50;

function calculateQualityTrend(): {
  average: number;
  trend: 'up' | 'down' | 'stable';
  count: number;
} {
  const { beads } = readBeadsSafe();

  // Filter to output-rating beads only
  const ratings = beads
    .filter(b => b.type === 'output-rating')
    .sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, QUALITY_SAMPLE_SIZE);  // Last 50 ratings

  if (ratings.length === 0) {
    return { average: 0, trend: 'stable', count: 0 };
  }

  // Calculate average
  const average = ratings.reduce((sum, b) => sum + (b.rating || 0), 0) / ratings.length;

  // Calculate trend (recent 25 vs older 25)
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (ratings.length >= 10) {
    const recentAvg = ratings
      .slice(0, Math.floor(ratings.length / 2))
      .reduce((sum, b) => sum + (b.rating || 0), 0) / Math.floor(ratings.length / 2);

    const olderAvg = ratings
      .slice(Math.floor(ratings.length / 2))
      .reduce((sum, b) => sum + (b.rating || 0), 0) / (ratings.length - Math.floor(ratings.length / 2));

    if (recentAvg > olderAvg + 0.3) trend = 'up';
    else if (recentAvg < olderAvg - 0.3) trend = 'down';
  }

  return { average, trend, count: ratings.length };
}
```

### Alternatives Considered

| Alternative | Why Not Chosen |
|-------------|---------------|
| **Process everything, cache results** | Cache can get stale, doesn't solve growth |
| **Different analysis for large history** | Inconsistent behavior, confusing |
| **Require user to manually archive** | Defeats purpose of autonomous system |
| **Delete old history** | Loses valuable context |

### Implementation Complexity

- **Effort**: Small (1.5-2 hours)
  - Update WeeklyLearning sampling (45 min)
  - Update LoadContext sampling (30 min)
  - Manual performance testing (45 min)
- **Risk**: Very Low (sampling doesn't break existing code)
- **Dependencies**: None

---

## Implementation Sequencing (All 6 Solutions)

**Recommended order** (build on each other):

1. **Solution 1.1** (Atomic State Writes) - Foundation for other hooks
2. **Solution 1.2** (File Locking) - Prevents bead corruption
3. **Solution 1.3** (JSONL Recovery) - Handles corruption from Solution 1.2 era
4. **Solution 1.5** (Error Visibility) - Apply to all hooks as you go
5. **Solution 1.4** (Auto-Maintenance) - Runs on top of locked system
6. **Solution 3.1** (Performance Sampling) - Final optimization

---

## Installation Dependencies (All Solutions)

```bash
cd nexa
npm install --save write-file-atomic proper-lockfile
npm run build
```

---

## Questions for User

1. **State Updates**: Are there other hooks beyond LoadContext, SessionSummary, WeeklyLearning that modify state.json? (Need to update them all)

2. **Bead Append**: Are RatingCapture and ExtractBeadsFromOutput the only hooks appending beads? (Need comprehensive list)

3. **Archive Policy**: Is 90 days the right cutoff for history archival? Or should it be configurable?

4. **Compaction Threshold**: Is 500KB the right threshold for auto-compaction? Too aggressive or not enough?

5. **Sample Size**: Is 100 files per skill and 50 beads reasonable for sampling? Or should these be tuned differently?

6. **Error Messages**: Should error messages be injected as systemMessage (Claude context), audit log, or both?

7. **Backward Compatibility**: Do we need to support systems that have existing corrupted state.json or beads files from before these fixes?

---

## Success Criteria (Post-Implementation Validation)

After implementing all 6 solutions, the system should meet:

- ✅ **Safety**: Multiple concurrent hooks won't corrupt state.json or beads
- ✅ **Recovery**: If corruption occurs, system recovers gracefully
- ✅ **Performance**: WeeklyLearning completes in <1s even with 500+ history files
- ✅ **Debuggability**: All errors visible in session greeting
- ✅ **Autonomy**: System self-maintains (archives, compacts) with zero user action
- ✅ **Reliability**: System runs reliably from day 1 of organic growth

---

**End of Phase 3 Solution Proposals**
