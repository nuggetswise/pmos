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

// State key for last learning run
const LEARNING_STATE_FILE = '.claude/rules/learned/.last-learning-run';

export async function run(ctx: HookContext): Promise<HookResult> {
  const filesRead: string[] = [];
  const filesModified: string[] = [];

  try {
    const root = getProjectRoot();

    // 1. Check if learning should run
    const shouldRun = await shouldRunLearning(root);
    if (!shouldRun.run) {
      await logHookComplete(meta.id, 'time:weekly', true, `Skipped: ${shouldRun.reason}`);
      return {
        success: true,
        filesRead,
        filesModified,
      };
    }

    // 2. Count history files for context
    const historyPattern = path.join(root, 'history', '**', '*.md');
    const historyFiles = await glob(historyPattern, { nodir: true });
    filesRead.push('history/**/*.md');

    // 3. Run pm-os learn --auto in background
    const indexPath = path.join(root, 'nexa', 'dist', 'index.js');
    const learningPromise = runLearningCommand(root, indexPath);

    // 4. Update last learning run timestamp
    await updateLastLearningRun(root);
    filesModified.push(LEARNING_STATE_FILE);

    // 5. Build notification
    const notification = `🧠 Weekly learning triggered

History files analyzed: ${historyFiles.length}
Last run: ${shouldRun.lastRun || 'never'}

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
 * Check if learning should run
 */
async function shouldRunLearning(root: string): Promise<{
  run: boolean;
  reason: string;
  lastRun: string | null;
}> {
  // Check last learning run
  const lastRunFile = path.join(root, LEARNING_STATE_FILE);
  let lastRun: string | null = null;

  try {
    const content = await fs.promises.readFile(lastRunFile, 'utf-8');
    lastRun = content.trim();

    const lastRunDate = new Date(lastRun);
    const now = new Date();
    const daysSinceLastRun = (now.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastRun < LEARNING_INTERVAL_DAYS) {
      return {
        run: false,
        reason: `Only ${Math.floor(daysSinceLastRun)} days since last run (need ${LEARNING_INTERVAL_DAYS})`,
        lastRun,
      };
    }
  } catch {
    // No last run file, continue
  }

  // Check if we have enough history
  const historyPattern = path.join(root, 'history', '**', '*.md');
  const historyFiles = await glob(historyPattern, { nodir: true });

  if (historyFiles.length < MIN_HISTORY_FILES) {
    return {
      run: false,
      reason: `Only ${historyFiles.length} history files (need ${MIN_HISTORY_FILES})`,
      lastRun,
    };
  }

  return {
    run: true,
    reason: 'Conditions met',
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
 * Update last learning run timestamp
 */
async function updateLastLearningRun(root: string): Promise<void> {
  const lastRunFile = path.join(root, LEARNING_STATE_FILE);
  const dir = path.dirname(lastRunFile);

  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(lastRunFile, isoNow());
}

/**
 * Check if learning should trigger at session start
 */
export async function shouldTriggerAtSessionStart(): Promise<boolean> {
  const root = getProjectRoot();
  const result = await shouldRunLearning(root);
  return result.run;
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
