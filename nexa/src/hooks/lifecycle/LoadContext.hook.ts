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
import * as fs from 'fs';
import { spawn } from 'child_process';
import type { HookDefinition, HookContext, HookResult, HookMeta } from '../types.js';
import {
  loadStateSync,
  getStatusSummary,
  setSessionStartTime,
  readAllCompassFiles,
  extractActiveWork,
  extractBlockers,
  buildGreetingBlock,
  buildSessionProtocol,
  formatSessionStartOutput,
} from '../lib/index.js';
import {
  calculateQualityTrend,
  formatQualityTrend,
} from '../../beads/index.js';
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

    // 8. Check for pending summary from previous session
    let pendingSummaryBlock = '';
    if (state.pending_summary) {
      pendingSummaryBlock = `Pending summary from previous session: ${state.pending_summary}`;
      filesRead.push(state.pending_summary);
    }

    // 9. Combine context (no XML wrappers - plain content)
    const fullContext = `${greetingBlock}${pendingSummaryBlock ? '\n\n' + pendingSummaryBlock : ''}`;

    // 9. Start background scan
    triggerBackgroundScan();

    // 10. Format output (SessionStart hooks use systemMessage format)
    const output = formatSessionStartOutput(fullContext);

    return {
      success: true,
      contextInjection: JSON.stringify(output, null, 2),
      filesRead,
      filesModified,
    };
  } catch (error) {
    // Graceful degradation - return minimal greeting
    const minimalContext = `PM OS is ready. Run 'pm-os status' for current state.`;

    const output = formatSessionStartOutput(minimalContext);

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
 * Find the most recent incomplete session summary
 */
async function findIncompleteSummary(): Promise<string | null> {
  const root = getProjectRoot();
  const sessionsDir = path.join(root, 'history', 'sessions');

  try {
    const files = await fs.promises.readdir(sessionsDir);
    // Sort by name descending (newest first since filenames are date-based)
    const summaryFiles = files
      .filter(f => f.endsWith('-summary.md'))
      .sort()
      .reverse();

    // Check the most recent one for incomplete markers
    if (summaryFiles.length > 0) {
      const mostRecent = path.join(sessionsDir, summaryFiles[0]);
      const content = await fs.promises.readFile(mostRecent, 'utf-8');
      if (content.includes('<!-- AI:')) {
        return `history/sessions/${summaryFiles[0]}`;
      }
    }
  } catch {
    // Directory doesn't exist or other error - ignore
  }
  return null;
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
