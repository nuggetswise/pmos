#!/usr/bin/env node
/**
 * ============================================================
 * HOOK: SessionSummary
 * ============================================================
 * PURPOSE: Generate session summary template and signal Claude
 *          to complete it when session ends.
 * TRIGGER: session:shutdown (Stop, UserPromptSubmit with goodbye)
 *
 * INPUT:
 *   - nexa/state.json: Session start time, job history
 *   - User prompt (if triggered by goodbye phrase)
 *
 * OUTPUT:
 *   - history/sessions/YYYY-MM-DD-HH-MM-summary.md: Draft summary
 *   - hookSpecificOutput: Instructions for Claude to complete summary
 *
 * SIDE EFFECTS:
 *   - Creates draft summary file
 *   - Clears session_start_time in state.json
 *
 * ERROR HANDLING:
 *   - Creates summary even if state is incomplete
 *   - Graceful degradation on file errors
 *
 * INTER-HOOK RELATIONSHIPS:
 *   - Runs after all other session hooks
 *   - Depends on LoadContext having set session_start_time
 * ============================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import type { HookDefinition, HookContext, HookResult, HookMeta } from '../types.js';
import {
  loadState,
  getSessionDuration,
  clearSessionStartTime,
  buildSessionEndSignal,
  formatContextInjection,
} from '../lib/index.js';
import { getProjectRoot, ensureDir, isoNow } from '../../utils.js';

export const meta: HookMeta = {
  id: 'session-summary',
  trigger: 'session:shutdown',
  intent: 'Generate session summary template for Claude to complete',
  guarantees: ['non-blocking', 'idempotent'],
  scope: {
    read: ['nexa/state.json'],
    write: ['nexa/state.json', 'history/sessions/**/*.md'],
  },
  userMessage: '📝 Session summary draft created',
};

export async function run(ctx: HookContext): Promise<HookResult> {
  const filesRead: string[] = [];
  const filesModified: string[] = [];

  try {
    // 1. Load state
    const state = await loadState();
    filesRead.push('nexa/state.json');

    // 2. Calculate session duration
    const duration = getSessionDuration(state);
    const startTime = state.session_start_time || isoNow();

    // 3. Generate summary file path
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const timePart = now.toISOString().slice(11, 16).replace(':', '-'); // HH-MM
    const summaryFileName = `${datePart}-${timePart}-summary.md`;

    const root = getProjectRoot();
    const sessionsDir = path.join(root, 'history', 'sessions');
    await ensureDir(sessionsDir);
    const summaryPath = path.join(sessionsDir, summaryFileName);

    // 4. Generate draft summary content
    const summaryContent = generateDraftSummary(startTime, now.toISOString(), duration);

    // 5. Write draft summary
    await fs.promises.writeFile(summaryPath, summaryContent);
    filesModified.push(`history/sessions/${summaryFileName}`);

    // 6. Clear session start time
    await clearSessionStartTime();
    filesModified.push('nexa/state.json');

    // 7. Build context injection
    const relativePath = `history/sessions/${summaryFileName}`;
    const signal = buildSessionEndSignal(relativePath);
    const output = formatContextInjection('session:shutdown', signal, 'session-end-detected');

    return {
      success: true,
      contextInjection: JSON.stringify(output, null, 2),
      filesRead,
      filesModified,
    };
  } catch (error) {
    // Graceful degradation
    const signal = buildSessionEndSignal(null);
    const output = formatContextInjection('session:shutdown', signal, 'session-end-detected');

    return {
      success: false,
      contextInjection: JSON.stringify(output, null, 2),
      error: error instanceof Error ? error.message : String(error),
      filesRead,
      filesModified,
    };
  }
}

/**
 * Generate draft session summary content
 */
function generateDraftSummary(
  startTime: string,
  endTime: string,
  duration: number | null
): string {
  const durationStr = duration !== null ? `${duration} minutes` : 'unknown';

  return `---
session_start: ${startTime}
session_end: ${endTime}
duration: ${durationStr}
---

# Session Summary: ${endTime.slice(0, 16).replace('T', ' ')}

## What Was Accomplished

### Skills Executed
<!-- AI: List skills run this session with brief outcomes -->

### Outputs Created
<!-- AI: List file paths of outputs created -->

### Non-Skill Work
<!-- AI: Note any implementation/investigation done without formal skills -->

## Key Decisions Made

| Decision | Rationale | Location |
|----------|-----------|----------|
<!-- AI: Fill in decisions made this session -->

## Insights Captured

**Learnings:**
<!-- AI: Count learning entries created this session -->

**Key Patterns:**
<!-- AI: List patterns observed this session -->

**Connections:**
<!-- AI: How this session connected to past work -->

## Output Ratings

<!-- AI: ONLY include ratings explicitly provided by user this session -->
<!-- NEVER self-assign ratings. Nexa does not rate its own work. -->

| Output | Rating | Feedback |
|--------|--------|----------|
<!-- AI: Fill in user-provided ratings if any -->

## Open Items for Next Session

### Follow-Up Actions
<!-- AI: List actions to take next session -->

### Blocked/Waiting
<!-- AI: Items waiting on external input -->

### Questions Raised
<!-- AI: Open questions from this session -->

## Session Metadata

**Next Recommended Action:** <!-- AI: Based on work done -->

**Files Modified:** <!-- AI: Count -->

**Skills Used:** <!-- AI: Count -->

**Capture Stats:**
- Learning entries: <!-- AI: Count -->
- Insight beads: <!-- AI: Count -->
- Decision logs: <!-- AI: Count -->
- Output ratings: <!-- AI: Count -->

## User Satisfaction Signal

<!-- AI: Note any explicit satisfaction/frustration signals -->
`;
}

/**
 * Check if user prompt contains goodbye phrase
 */
export function isGoodbyePhrase(prompt: string): boolean {
  const goodbyePatterns = [
    /\b(goodbye|bye|see you)\b/i,
    /\bdone for (today|now)\b/i,
    /\bthat'?s (all|it)\b/i,
    /\b(end session|log off|sign off)\b/i,
  ];

  return goodbyePatterns.some(pattern => pattern.test(prompt));
}

// CLI execution
if (process.argv[1]?.endsWith('SessionSummary.hook.js')) {
  import('../lib/context.js').then(({ buildHookContext, createSessionShutdownPayload }) => {
    const ctx = buildHookContext('session:shutdown', createSessionShutdownPayload());
    run(ctx).then(result => {
      if (result.contextInjection) {
        console.log(result.contextInjection);
      }
    });
  });
}

export const SessionSummaryHook: HookDefinition = { meta, run };
export default SessionSummaryHook;
