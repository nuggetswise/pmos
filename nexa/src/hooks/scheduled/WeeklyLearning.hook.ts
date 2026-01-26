#!/usr/bin/env node
/**
 * ============================================================
 * HOOK: WeeklyLearning
 * ============================================================
 * PURPOSE: Run automated learning analysis on a weekly cadence
 *          to extract patterns from history/.
 * TRIGGER: time:weekly (SessionStart with 7+ day gap)
 *
 * INPUT:
 *   - history/: All historical outputs
 *   - .beads/insights.jsonl: Rating and insight beads
 *   - Last learning timestamp
 *
 * OUTPUT:
 *   - .claude/rules/learned/: Updated learned patterns
 *   - hookSpecificOutput: Learning summary
 *
 * SIDE EFFECTS:
 *   - Runs pm-os learn --auto
 *   - Updates last_learning_run in state
 *
 * ERROR HANDLING:
 *   - Skips if insufficient history
 *   - Non-blocking (runs in background)
 *
 * INTER-HOOK RELATIONSHIPS:
 *   - Runs at session start if conditions met
 *   - Depends on RatingCapture for quality data
 * ============================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import type { HookDefinition, HookContext, HookResult, HookMeta, ScheduledPayload } from '../types.js';
import { formatContextInjection, logHookComplete } from '../lib/index.js';
import { getProjectRoot, isoNow } from '../../utils.js';
import { glob } from 'glob';
import { loadState } from '../../state.js';
import { updateStateAtomic } from '../lib/atomic-state.js';

export const meta: HookMeta = {
  id: 'weekly-learning',
  trigger: 'time:weekly',
  intent: 'Run automated learning to extract patterns from history',
  guarantees: ['non-blocking'],
  scope: {
    read: ['history/**/*.md', '.beads/insights.jsonl', 'nexa/state.json'],
    write: ['.claude/rules/learned/**/*.md', 'outputs/audit/hook-log.md'],
  },
  userMessage: '🧠 Running weekly learning analysis',
};

// Minimum days between learning runs
const LEARNING_INTERVAL_DAYS = 7;

// Minimum history files to make learning worthwhile
const MIN_HISTORY_FILES = 5;

// Auto-archive files older than this (days)
const AUTO_ARCHIVE_DAYS = 90;

// Maximum files to analyze per skill (for performance)
const MAX_FILES_PER_SKILL = 100;

export async function run(ctx: HookContext): Promise<HookResult> {
  const filesRead: string[] = [];
  const filesModified: string[] = [];

  try {
    const root = getProjectRoot();

    // 1. Check if learning should run (atomic check-and-set)
    const wonLock = await claimLearningLock();
    if (!wonLock.success) {
      await logHookComplete(meta.id, 'time:weekly', true, `Skipped: ${wonLock.reason}`);
      return {
        success: true,
        filesRead,
        filesModified,
      };
    }

    // 2. Auto-archive old history files FIRST (before analysis)
    const archivedCount = await autoArchiveOldHistory(root);
    if (archivedCount > 0) {
      filesModified.push('history/archive/');
    }

    // 3. Count history files for context
    const historyPattern = path.join(root, 'history', '**', '*.md');
    const historyFiles = await glob(historyPattern, { nodir: true, ignore: ['**/archive/**'] });
    filesRead.push('history/**/*.md');

    // 4. Run pm-os learn --auto in background (with sampling applied inside learning code)
    const indexPath = path.join(root, 'nexa', 'dist', 'index.js');
    const learningPromise = runLearningCommand(root, indexPath);

    // 5. Build notification
    const archiveNote = archivedCount > 0 ? `\n📦 Auto-archived ${archivedCount} files >90 days old` : '';
    const notification = `🧠 Weekly learning triggered

History files analyzed: ${historyFiles.length}${archiveNote}
Last run: ${wonLock.lastRun || 'never'}

Learning is running in the background. Patterns will be extracted to:
- .claude/rules/learned/quality-patterns.md
- .claude/rules/learned/vocabulary-updates.md

These patterns will inform future outputs.`;

    const output = formatContextInjection('time:weekly', notification, 'weekly-learning');

    await logHookComplete(
      meta.id,
      'time:weekly',
      true,
      `Triggered learning for ${historyFiles.length} files`
    );

    return {
      success: true,
      contextInjection: JSON.stringify(output, null, 2),
      filesRead,
      filesModified,
    };
  } catch (error) {
    await logHookComplete(meta.id, 'time:weekly', false, String(error));

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      filesRead,
      filesModified,
    };
  }
}

/**
 * Atomic check-and-set for learning trigger lock
 * Prevents duplicate learning jobs in concurrent sessions
 */
async function claimLearningLock(): Promise<{
  success: boolean;
  reason: string;
  lastRun: string | null;
}> {
  const root = getProjectRoot();
  const now = new Date();

  // Check if we have enough history first (fast check before atomic operation)
  const historyPattern = path.join(root, 'history', '**', '*.md');
  const historyFiles = await glob(historyPattern, { nodir: true, ignore: ['**/archive/**'] });

  if (historyFiles.length < MIN_HISTORY_FILES) {
    return {
      success: false,
      reason: `Only ${historyFiles.length} history files (need ${MIN_HISTORY_FILES})`,
      lastRun: null,
    };
  }

  // Atomic check-and-set using state.json
  let lastRun: string | null = null;
  let won = false;

  await updateStateAtomic((state) => {
    lastRun = state.last_learning_run || null;

    // Check if enough time has passed
    if (lastRun) {
      const lastRunDate = new Date(lastRun);
      const daysSinceLastRun = (now.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastRun < LEARNING_INTERVAL_DAYS) {
        // Too soon - don't update state
        return state;
      }
    }

    // Claim the lock by updating timestamp
    won = true;
    return { ...state, last_learning_run: now.toISOString() };
  });

  if (!won) {
    const lastRunDate = lastRun ? new Date(lastRun) : null;
    const daysSince = lastRunDate
      ? Math.floor((now.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      success: false,
      reason: `Only ${daysSince} days since last run (need ${LEARNING_INTERVAL_DAYS})`,
      lastRun,
    };
  }

  return {
    success: true,
    reason: 'Lock claimed',
    lastRun,
  };
}

/**
 * Run pm-os learn --auto command
 */
function runLearningCommand(root: string, indexPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const proc = spawn('node', [indexPath, 'learn', '--auto'], {
        cwd: root,
        detached: true,
        stdio: 'ignore',
      });

      proc.unref();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Auto-archive history files older than AUTO_ARCHIVE_DAYS
 * Runs BEFORE learning analysis to keep working set small
 */
async function autoArchiveOldHistory(root: string): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - AUTO_ARCHIVE_DAYS);

  let movedCount = 0;
  const historyDir = path.join(root, 'history');

  try {
    const skills = await fs.promises.readdir(historyDir);

    for (const skill of skills) {
      if (skill === 'archive' || skill.startsWith('.')) continue;

      const skillPath = path.join(historyDir, skill);
      const stats = await fs.promises.stat(skillPath);

      if (!stats.isDirectory()) continue;

      const files = await fs.promises.readdir(skillPath);

      for (const file of files) {
        const filePath = path.join(skillPath, file);
        const fileStats = await fs.promises.stat(filePath);

        if (fileStats.isFile() && fileStats.mtime < cutoffDate) {
          // Move to archive
          const archivePath = path.join(historyDir, 'archive', skill, file);
          await fs.promises.mkdir(path.dirname(archivePath), { recursive: true });
          await fs.promises.rename(filePath, archivePath);
          movedCount++;
        }
      }
    }

    return movedCount;
  } catch (error) {
    // Non-fatal - just log and continue
    console.error('Auto-archive error:', error);
    return 0;
  }
}

/**
 * Check if learning should trigger at session start (read-only check)
 */
export async function shouldTriggerAtSessionStart(): Promise<boolean> {
  const root = getProjectRoot();

  // Check history count
  const historyPattern = path.join(root, 'history', '**', '*.md');
  const historyFiles = await glob(historyPattern, { nodir: true, ignore: ['**/archive/**'] });

  if (historyFiles.length < MIN_HISTORY_FILES) {
    return false;
  }

  // Check last run date
  const state = await loadState();
  const lastRun = state.last_learning_run;

  if (!lastRun) {
    return true; // Never run
  }

  const lastRunDate = new Date(lastRun);
  const now = new Date();
  const daysSinceLastRun = (now.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceLastRun >= LEARNING_INTERVAL_DAYS;
}

// CLI execution
if (process.argv[1]?.endsWith('WeeklyLearning.hook.js')) {
  import('../lib/context.js').then(async ({ buildHookContext, createScheduledPayload }) => {
    // Check if we should run first
    const shouldRun = await shouldTriggerAtSessionStart();
    if (!shouldRun) {
      console.log('{}');
      return;
    }

    const ctx = buildHookContext('time:weekly', createScheduledPayload('time:weekly'));
    const result = await run(ctx);
    if (result.contextInjection) {
      console.log(result.contextInjection);
    }
  });
}

export const WeeklyLearningHook: HookDefinition = { meta, run };
export default WeeklyLearningHook;
