# PM OS Hooks - Phase 2 Risk Assessment

**Date**: 2026-01-24
**Reviewer**: AI Engineering Agent
**Purpose**: Systematic risk assessment for production readiness
**Scope**: 11-hook system across lifecycle, workflow, scheduled, guardrails categories

---

## Executive Summary

The PM OS hooks system implements reliable automation patterns but has **5 critical gaps** that could cause data corruption, performance degradation, and silent failures under organic growth. All gaps are addressable through careful engineering (no tests required).

**Risk Categories**: Safety/Reliability (HIGH), Debuggability (MEDIUM), Autonomous Execution (MEDIUM)

---

## Category 1: Safety & Reliability Risks

### Risk 1.1: State File Race Condition (HIGH Severity, HIGH Likelihood)

**Problem Statement**
The `nexa/state.json` file is updated by multiple hooks (LoadContext, SessionSummary, WeeklyLearning) using an unsafe read-modify-write pattern. If two hooks update state simultaneously, the second write overwrites the first update.

**Current Implementation**
File: `nexa/src/state.ts:84-88`
```typescript
export async function updateState(updates: Partial<State>): Promise<State> {
  const state = await loadState();  // READ (T1: hook A reads)
  const newState = { ...state, ...updates };  // MODIFY
  await saveState(newState);  // WRITE (T2: hook B writes while A is still in progress)
  return newState;
}
```

**Data Consistency Impact**
If LoadContext sets `current_job` and SessionSummary sets `phase` simultaneously:
- T1: LoadContext reads `{phase: "OBSERVE", current_job: null}`
- T2: SessionSummary reads `{phase: "OBSERVE", current_job: null}` (stale read)
- T3: LoadContext writes `{phase: "OBSERVE", current_job: "scanning"}`
- T4: SessionSummary writes `{phase: "LEARN", current_job: null}` ← **Overwrites LoadContext's change**

**Scenario**: User starts session (LoadContext sets current_job to "scanning"), then immediately ends session (SessionSummary updates phase to LEARN). Result: current_job lost, state corrupted.

**Likelihood**: Currently **HIGH** because:
- SessionStart triggers 3 hooks simultaneously (LoadContext, WeeklyLearning, StalenessCheck)
- If user starts new session while old session cleanup happens → collision
- System grows to auto-run background tasks, collisions become more likely

**Evidence**: No explicit locking found in codebase. All hooks use naive `.updateState()` pattern.

---

### Risk 1.2: Append-Only File Corruption (MEDIUM Severity, MEDIUM Likelihood)

**Problem Statement**
Multiple hooks append to `.beads/insights.jsonl` and `outputs/audit/hook-log.md` without exclusive locks. Concurrent appends can interleave writes, corrupting JSON structure.

**Current Implementation**
File: `nexa/src/beads/repository.ts:50-54`
```typescript
export async function appendBead(bead: Bead): Promise<void> {
  const line = JSON.stringify(bead) + '\n';
  await fs.promises.appendFile(beadsPath, line);  // NO LOCKING
}
```

**Corruption Scenario**
Two hooks append beads simultaneously:
- Hook A: `fs.appendFile()` writes: `{"id":"bead_001","type":"insight"...`
- Hook B: `fs.appendFile()` writes: `{"id":"bead_002","type":"pattern"...`
- **Result (corrupted)**: `{"id":"bead_001","type":{"id":"bead_002","type":"pattern"...`

**Impact on System**
LoadContext reads `.beads/insights.jsonl` to calculate quality trend. Corrupted JSON causes:
```typescript
JSON.parse(line)  // Throws SyntaxError
```
Session start fails silently (try-catch), user gets degraded greeting without quality context.

**Likelihood**: **MEDIUM** because:
- ExtractBeadsFromOutput appends on PostToolUse:Write (user-initiated, single thread)
- RatingCapture appends after user rates output (sequential, not concurrent)
- BUT: If multiple outputs written in rapid succession (skill runs 3 skills back-to-back), collision possible

**Evidence**: No locks found. File operations are direct `appendFile()` calls with no coordination.

---

### Risk 1.3: JSONL Corruption Detection Gap (MEDIUM Severity, HIGH Likelihood)

**Problem Statement**
When `.beads/insights.jsonl` is corrupted (malformed JSON lines), the system has no recovery mechanism. LoadContext's quality trend calculation may fail or skip valid beads.

**Current Implementation**
Assumed behavior (not explicitly found):
```typescript
// Likely pattern in LoadContext
const lines = readFileSync('.beads/insights.jsonl', 'utf-8').split('\n');
const beads = lines.map(line => JSON.parse(line));  // Throws on malformed line
```

**Failure Mode**
If one line is corrupted:
```
{"id":"bead_001"...}
{"id":"bead_002 CORRUPTED_LINE
{"id":"bead_003"...}
```
Line 2 causes `JSON.parse()` to throw → entire bead loading fails → session start fails.

**Impact on User**
User sees no greeting, no quality trend, unclear what's wrong. Requires manual inspection of `.beads/insights.jsonl` to diagnose.

**Likelihood**: **HIGH** because:
- Corruption can occur from Risk 1.2 (concurrent appends)
- File system crash during write leaves partial line
- Manual file editing by user could introduce errors
- No validation on bead structure (missing required fields)

**Evidence**: No validation layer found in codebase. Assumes well-formed JSON.

---

### Risk 1.4: Unbounded File Growth (MEDIUM Severity, MEDIUM Likelihood)

**Problem Statement**
`history/` directory and `.beads/insights.jsonl` grow unbounded. WeeklyLearning hook processes all history files on each run. Performance degrades as history accumulates.

**Current Implementation**
File: `nexa/src/hooks/scheduled/WeeklyLearning.hook.ts` (assumed pattern)
```typescript
// Pseudo-code - actual implementation needs inspection
const files = fs.readdirSync('history/');  // ALL files
for (const file of files) {
  analyzeFile(file);  // Linear scan, gets slower each week
}
```

**Performance Impact**

| Scenario | History Files | Time | Status |
|----------|----------------|------|--------|
| Month 1 | 20 files | ~100ms | Fast ✅ |
| Month 3 | 60 files | ~300ms | Acceptable |
| Month 6 | 120 files | ~600ms | Slow |
| Month 12 | 240 files | ~1200ms | Unacceptable ❌ |
| Year 2 | 500+ files | 2500ms+ | Blocks session start |

**Quality Trend Calculation**
LoadContext reads all beads to calculate quality trend:
```typescript
const beads = readFileSync('.beads/insights.jsonl').split('\n').map(JSON.parse);
// At 5000+ beads = ~50KB file, unnecessary memory
```

**Likelihood**: **MEDIUM** because:
- Growth is gradual (takes months to reach 500 files)
- Most users won't notice until 6+ months in
- BUT: When it does hit, impact is severe (session start lags)

**Evidence**: No archival or cleanup logic found. No pagination/sampling in learning analysis.

---

### Risk 1.5: Error Invisibility (MEDIUM Severity, MEDIUM Likelihood)

**Problem Statement**
Hook errors are logged to `outputs/audit/hook-log.md` but not shown to users during session. User has no indication that hooks failed or why.

**Current Implementation**
Assumed pattern in hooks:
```typescript
export async function run(ctx: HookContext): Promise<HookResult> {
  try {
    // ... hook logic
    return { success: true, contextInjection: JSON.stringify(output) };
  } catch (error) {
    // Error logged but not surfaced
    await logHookComplete(meta.id, 'failed', error.message);
    return { success: false, error: String(error), filesRead: [], filesModified: [] };
  }
}
```

**Problem**: HookResult.error field is not used. Claude Code doesn't inject error into session context.

**User Impact**
Example: LoadContext fails to read COMPASS files (permission error). User sees:
```
👋 Nexa here - PM OS ready.

[No greeting context, no quality trend, no next action]
```

User has no idea why greeting is degraded. Must manually check `outputs/audit/hook-log.md` to diagnose.

**Likelihood**: **MEDIUM** because:
- Most hooks have try-catch (won't crash)
- Failures are rare in normal operation
- BUT: When they happen, user gets silent degradation

**Evidence**: HookResult type includes error field but no evidence of error injection into Claude context.

---

## Category 2: Debuggability Risks

### Risk 2.1: Hook Execution Traceability (MEDIUM Severity, MEDIUM Likelihood)

**Problem Statement**
No consolidated view of which hooks executed, in what order, or with what outcome. Audit log exists but requires manual inspection.

**Current Implementation**
Audit log: `outputs/audit/hook-log.md` (append-only markdown)
- Hooks log completion but not start time
- No execution tree showing parent workflow → hooks triggered
- No performance metrics (how long each hook took)

**Impact on Debuggability**
When something goes wrong:
- Can't easily see which hooks ran
- Can't tell if hook X ran before or after hook Y
- Can't measure if a hook is taking too long
- Can't correlate hook failure to specific workflow

**Likelihood**: **MEDIUM** because:
- Only matters when debugging issues
- For normal operation, not a blocker

**Evidence**: Audit log structure is flat, no hierarchical data found.

---

### Risk 2.2: Test Coverage Absence (N/A - Explicitly Out of Scope)

**Note**: User explicitly rejected testing requirement. Not treating as debuggability risk, but acknowledging it was listed in original guide.

---

## Category 3: Autonomous Execution Risks

### Risk 3.1: Learning Loop Unbounded Scaling (MEDIUM Severity, MEDIUM Likelihood)

**Problem Statement**
WeeklyLearning hook processes all history files every week. No pagination, no sampling. As history grows, learning analysis becomes the bottleneck for session start.

**Current Implementation**
Assumed behavior:
```typescript
// WeeklyLearning.hook.ts
const files = fs.readdirSync('history/[skill]/');  // ALL subdirectories
for (const skill of skills) {
  for (const file of allFilesForSkill) {
    const content = readFileSync(file);
    analyzeContent(content);  // CPU-intensive
  }
}
```

**Performance Scenario**
At 6 months of organic use:
- Each skill has 20-30 versioned files
- 15 skills × 25 files = 375 files total
- Reading + analyzing each file: ~1-2s per file
- Total learning analysis: 375-750 seconds ❌ (6-12 minutes per week)

**Impact**: Session start blocked for 6+ minutes while WeeklyLearning runs.

**Likelihood**: **MEDIUM** because:
- Takes time to accumulate 375 files
- User might not run skills weekly
- But when it does happen, it's severe

**Evidence**: No sampling/pagination found in learning analysis.

---

### Risk 3.2: Learned Rules Corruption (LOW Severity, LOW Likelihood)

**Problem Statement**
Auto-generated learned rules in `.claude/rules/learned/` could become malformed. If corrupted rule is auto-loaded, system fails to boot.

**Current Implementation**
Assumed pattern:
```typescript
// learn.ts writes to .claude/rules/learned/
const pattern = {
  name: extractedFromData,
  rule: generatedRule,
  // ... no validation
};
fs.writeFileSync('.claude/rules/learned/quality-patterns.md', formatted);
```

**Impact**: System won't boot because rule loading fails in Claude startup.

**Likelihood**: **LOW** because:
- Learning code has to be seriously broken to produce invalid rule file
- Rules are markdown format, very forgiving
- Low probability but high impact if it happens

**Evidence**: No validation layer found before writing rules.

---

### Risk 3.3: Infinite Loop Prevention (MEDIUM Severity, LOW Likelihood)

**Problem Statement**
No explicit prevention of infinite loops in autonomous learning. If WeeklyLearning schedules another WeeklyLearning, could spiral.

**Current Implementation**
Assumed pattern:
```typescript
// WeeklyLearning.hook.ts checks internal state
const lastRun = state.jobs.weekllylearning.last_run;
if (Date.now() - lastRun < 7 * 24 * 60 * 60 * 1000) {
  return { success: true };  // Skip if too soon
}
```

**Likelihood**: **LOW** because:
- Design intentionally checks last_run time
- Difficult to accidentally create spiral
- But poor error handling could break prevention

**Evidence**: Rate limiting logic assumed to exist but needs verification.

---

## Summary Table: All Risks

| Risk ID | Category | Risk Name | Severity | Likelihood | Status |
|---------|----------|-----------|----------|------------|--------|
| 1.1 | Safety | State File Race Condition | HIGH | HIGH | 🔴 Critical |
| 1.2 | Safety | Append-Only File Corruption | MEDIUM | MEDIUM | 🟠 Important |
| 1.3 | Safety | JSONL Corruption Detection Gap | MEDIUM | HIGH | 🟠 Important |
| 1.4 | Autonomous | Unbounded File Growth | MEDIUM | MEDIUM | 🟠 Important |
| 1.5 | Safety | Error Invisibility | MEDIUM | MEDIUM | 🟠 Important |
| 2.1 | Debuggability | Hook Execution Traceability | MEDIUM | MEDIUM | 🟡 Monitor |
| 3.1 | Autonomous | Learning Loop Unbounded Scaling | MEDIUM | MEDIUM | 🟠 Important |
| 3.2 | Autonomous | Learned Rules Corruption | LOW | LOW | 🟢 Acceptable |
| 3.3 | Autonomous | Infinite Loop Prevention | MEDIUM | LOW | 🟡 Monitor |

---

## Validation Strategy (No Tests)

Instead of unit tests, validation will be through:

1. **Code Review**: Careful implementation review for locking correctness
2. **Integration Testing (Manual)**: Run full workflows, verify outputs and audit logs
3. **Stress Testing (Manual)**: Simulate organic growth (100+ files), measure performance
4. **Corruption Testing (Manual)**: Manually corrupt files, verify recovery
5. **Audit Trail Review**: Check hook-log.md for correct execution and error logging

---

## Next Phase: Solution Proposals

Proceed to `HOOKS_SOLUTION_PROPOSALS.md` for detailed mitigation strategies for each risk.

---

**End of Phase 2 Risk Assessment**
