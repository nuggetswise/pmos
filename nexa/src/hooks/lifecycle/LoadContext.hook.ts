#!/usr/bin/env node
/**
 * ============================================================
 * HOOK: LoadContext
 * ============================================================
 * PURPOSE: Load context files and state at session start,
 *          inject greeting context into Claude.
 * TRIGGER: session:startup (SessionStart)
 *
 * INPUT:
 *   - nexa/state.json: PM OS state
 *   - inputs/context/*.md: COMPASS files
 *   - .beads/insights.jsonl: Quality ratings
 *
 * OUTPUT:
 *   - hookSpecificOutput: Session greeting and context injection
 *
 * SIDE EFFECTS:
 *   - Updates session_start_time in state.json
 *   - Triggers background scan (pm-os scan)
 *
 * ERROR HANDLING:
 *   - Gracefully handles missing files
 *   - Returns minimal greeting on errors
 *
 * INTER-HOOK RELATIONSHIPS:
 *   - Runs before any other session hooks
 *   - Sets up context for all subsequent hooks
 * ============================================================
 */

import * as path from 'path';
import { spawn } from 'child_process';
import type { HookDefinition, HookContext, HookResult, HookMeta } from '../types.js';
import {
  loadStateSync,
  getStatusSummary,
  setSessionStartTime,
  readAllCompassFiles,
  extractActiveWork,
  extractBlockers,
  calculateQualityTrend,
  formatQualityTrend,
  buildGreetingBlock,
  buildSessionProtocol,
  formatImportantContext,
} from '../lib/index.js';
import { getProjectRoot } from '../../utils.js';

export const meta: HookMeta = {
  id: 'load-context',
  trigger: 'session:startup',
  intent: 'Load COMPASS context and state, inject session greeting',
  guarantees: ['non-blocking', 'idempotent'],
  scope: {
    read: [
      'nexa/state.json',
      'inputs/context/**/*.md',
      '.beads/insights.jsonl',
    ],
    write: ['nexa/state.json'],
  },
  userMessage: '👋 PM OS context loaded',
};

export async function run(ctx: HookContext): Promise<HookResult> {
  const filesRead: string[] = [];
  const filesModified: string[] = [];

  try {
    // 1. Update session start time
    await setSessionStartTime();
    filesModified.push('nexa/state.json');

    // 2. Load state
    const state = loadStateSync();
    filesRead.push('nexa/state.json');
    const status = getStatusSummary(state);

    // 3. Load COMPASS files
    const compass = await readAllCompassFiles();
    let compassLoaded = 0;
    if (compass.compass) { filesRead.push('inputs/context/compass.md'); compassLoaded++; }
    if (compass.projects) { filesRead.push('inputs/context/projects.md'); compassLoaded++; }
    if (compass.challenges) { filesRead.push('inputs/context/challenges.md'); compassLoaded++; }
    if (compass.preferences) { filesRead.push('inputs/context/preferences.md'); compassLoaded++; }

    // 4. Extract active work and blockers
    const activeWork = extractActiveWork(compass.projects);
    const blockers = extractBlockers(compass.challenges);

    // 5. Calculate quality trend
    const qualityTrend = await calculateQualityTrend();
    filesRead.push('.beads/insights.jsonl');
    const qualityTrendStr = formatQualityTrend(qualityTrend);

    // 6. Build greeting block
    const greetingBlock = buildGreetingBlock({
      phase: status.phase,
      nextAction: status.nextAction,
      lastJobId: status.lastJobId,
      lastJobResult: status.lastJobResult,
      lastJobFinished: status.lastJobFinished,
      ingestCount: status.ingestCount,
      errorCount: status.errorCount,
      recentSource: status.recentSource,
      qualityTrend: qualityTrendStr,
      activeWork,
      blockers,
      compassLoaded,
    });

    // 7. Build session protocol
    const sessionProtocol = buildSessionProtocol();

    // 8. Combine context
    const fullContext = `You have PM OS.

<session-greeting>
${greetingBlock}
</session-greeting>

<session-protocol>
${sessionProtocol}
</session-protocol>`;

    // 9. Start background scan
    triggerBackgroundScan();

    // 10. Format output
    const output = formatImportantContext('SessionStart', fullContext);

    return {
      success: true,
      contextInjection: JSON.stringify(output, null, 2),
      filesRead,
      filesModified,
    };
  } catch (error) {
    // Graceful degradation - return minimal greeting
    const minimalContext = `You have PM OS.

<session-greeting>
PM OS is ready. Run 'pm-os status' for current state.
</session-greeting>`;

    const output = formatImportantContext('SessionStart', minimalContext);

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
 * Trigger background scan without blocking
 */
function triggerBackgroundScan(): void {
  const root = getProjectRoot();
  const indexPath = path.join(root, 'nexa', 'dist', 'index.js');

  try {
    // Run session-start and scan in background
    spawn('node', [indexPath, 'session-start'], {
      cwd: root,
      detached: true,
      stdio: 'ignore',
    }).unref();

    spawn('node', [indexPath, 'scan'], {
      cwd: root,
      detached: true,
      stdio: 'ignore',
    }).unref();
  } catch {
    // Ignore errors - background tasks are best-effort
  }
}

// CLI execution
if (process.argv[1]?.endsWith('LoadContext.hook.js')) {
  import('../lib/context.js').then(({ buildHookContext, createSessionStartupPayload }) => {
    const ctx = buildHookContext('session:startup', createSessionStartupPayload());
    run(ctx).then(result => {
      if (result.contextInjection) {
        console.log(result.contextInjection);
      }
    });
  });
}

export const LoadContextHook: HookDefinition = { meta, run };
export default LoadContextHook;
