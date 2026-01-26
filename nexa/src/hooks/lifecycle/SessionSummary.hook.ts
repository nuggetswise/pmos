#!/usr/bin/env node
/**
 * ============================================================
 * HOOK: SessionSummary
 * ============================================================
 * PURPOSE: Generate detailed session summary by analyzing what
 *          happened during the session. Zero AI drift - purely
 *          deterministic extraction of session activity.
 * TRIGGER: session:shutdown (Stop, UserPromptSubmit with goodbye)
 *
 * INPUT:
 *   - nexa/state.json: Session start time, job history
 *   - .beads/insights.jsonl: Insights, decisions, ratings
 *   - history/learnings/: Learning entries
 *   - outputs/: Recently modified files
 *
 * OUTPUT:
 *   - history/sessions/YYYY-MM-DD-HH-MM-summary.md: Complete summary
 *   - All sections auto-populated with actual session data
 *
 * SIDE EFFECTS:
 *   - Creates complete summary file
 *   - Clears session_start_time in state.json
 *   - No pending_summary set (summary is complete)
 *
 * ERROR HANDLING:
 *   - Creates summary even if data incomplete
 *   - Graceful degradation on file read errors
 *   - Partial data still generates valid summary
 *
 * INTER-HOOK RELATIONSHIPS:
 *   - Runs after all other session hooks
 *   - Depends on LoadContext having set session_start_time
 *   - Independent of Claude - pure automation
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
  formatStopOutput,
} from '../lib/index.js';
import { getProjectRoot, ensureDir, isoNow } from '../../utils.js';

export const meta: HookMeta = {
  id: 'session-summary',
  trigger: 'session:shutdown',
  intent: 'Generate detailed session summary by deterministically analyzing session activity (zero AI drift)',
  guarantees: ['non-blocking', 'idempotent', 'deterministic'],
  scope: {
    read: [
      'nexa/state.json',
      '.beads/insights.jsonl',
      'history/learnings/**/*.md',
      'outputs/**/*.md',
    ],
    write: ['nexa/state.json', 'history/sessions/**/*.md'],
  },
  userMessage: undefined, // Silent - fully automated
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

    // 4. Generate detailed summary content
    const summaryContent = await generateDetailedSummary(
      startTime,
      now.toISOString(),
      duration,
      state
    );

    // 5. Write summary
    await fs.promises.writeFile(summaryPath, summaryContent);
    filesModified.push(`history/sessions/${summaryFileName}`);

    // 6. Build relative path
    const relativePath = `history/sessions/${summaryFileName}`;

    // 7. Clear session start time (no pending_summary needed - summary is complete)
    await clearSessionStartTime();
    filesModified.push('nexa/state.json');

    // 8. Build Stop hook output (uses systemMessage, not hookSpecificOutput)
    const signal = buildSessionEndSignal(relativePath);
    const output = formatStopOutput(signal);

    return {
      success: true,
      contextInjection: JSON.stringify(output, null, 2),
      filesRead,
      filesModified,
    };
  } catch (error) {
    // Graceful degradation
    const signal = buildSessionEndSignal(null);
    const output = formatStopOutput(signal);

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
 * Generate detailed session summary by analyzing what happened
 */
async function generateDetailedSummary(
  startTime: string,
  endTime: string,
  duration: number | null,
  state: any
): Promise<string> {
  const durationStr = duration !== null ? `${duration} minutes` : 'unknown';
  const root = getProjectRoot();

  // Extract session data
  const skillsExecuted: string[] = [];
  const outputsCreated: string[] = [];
  const decisionsLogged: string[] = [];
  let learningsCount = 0;
  let beadsCount = 0;
  let ratingsCount = 0;

  try {
    // 1. Analyze state.last_job and job history
    if (state.last_job) {
      skillsExecuted.push(`${state.last_job.id} (${state.last_job.result})`);
    }

    // 2. Count recent learnings
    const learningsDir = path.join(root, 'history', 'learnings');
    if (fs.existsSync(learningsDir)) {
      const learningsFiles = await fs.promises.readdir(learningsDir);
      const today = new Date().toISOString().slice(0, 10);
      learningsCount = learningsFiles.filter(f => f.includes(today)).length;
    }

    // 3. Count recent beads and decisions
    const beadsPath = path.join(root, '.beads', 'insights.jsonl');
    if (fs.existsSync(beadsPath)) {
      const beadsContent = await fs.promises.readFile(beadsPath, 'utf-8');
      const beads = beadsContent.split('\n').filter(line => line.trim());

      const sessionStart = new Date(startTime);
      beadsCount = beads.filter(line => {
        try {
          const bead = JSON.parse(line);
          return new Date(bead.created_at) >= sessionStart;
        } catch {
          return false;
        }
      }).length;

      // Count decisions and ratings
      ratingsCount = beads.filter(line => {
        try {
          const bead = JSON.parse(line);
          return bead.type === 'output-rating';
        } catch {
          return false;
        }
      }).length;

      decisionsLogged.push(...beads.filter(line => {
        try {
          const bead = JSON.parse(line);
          return bead.type === 'decision';
        } catch {
          return false;
        }
      }).map(line => {
        try {
          return JSON.parse(line).content;
        } catch {
          return '';
        }
      }).filter(Boolean));
    }

    // 4. Find recently modified outputs
    const outputsDir = path.join(root, 'outputs');
    if (fs.existsSync(outputsDir)) {
      const sessionStart = new Date(startTime);
      const recentOutputs = await findRecentOutputs(outputsDir, sessionStart);
      outputsCreated.push(...recentOutputs);
    }
  } catch (error) {
    // Graceful degradation - continue with incomplete data
  }

  // Build summary sections
  const skillsSection = skillsExecuted.length > 0
    ? skillsExecuted.map(s => `- ${s}`).join('\n')
    : '*(None this session)*';

  const outputsSection = outputsCreated.length > 0
    ? outputsCreated.map(o => `- ${o}`).join('\n')
    : '*(None this session)*';

  const decisionsSection = decisionsLogged.length > 0
    ? decisionsLogged.map(d => `- ${d}`).join('\n')
    : '*(None this session)*';

  return `---
session_start: ${startTime}
session_end: ${endTime}
duration: ${durationStr}
---

# Session Summary: ${endTime.slice(0, 16).replace('T', ' ')}

## What Was Accomplished

### Skills Executed
${skillsSection}

### Outputs Created
${outputsSection}

## Key Decisions Made

${decisionsSection}

## Insights Captured

**Learnings:**
- Learning entries: ${learningsCount}
- Insight beads: ${beadsCount}
- Output ratings: ${ratingsCount}

## Session Metadata

**Duration:** ${durationStr}
**Skills Used:** ${skillsExecuted.length}
**Outputs Created:** ${outputsCreated.length}

**Capture Stats:**
- Learning entries: ${learningsCount}
- Insight beads: ${beadsCount}
- Decision logs: ${decisionsLogged.length}
- Output ratings: ${ratingsCount}

---

*Auto-generated detailed summary - all sections populated from session activity*
`;
}

/**
 * Find outputs modified since session start
 */
async function findRecentOutputs(
  outputsDir: string,
  sessionStart: Date
): Promise<string[]> {
  const recent: string[] = [];

  try {
    const categories = await fs.promises.readdir(outputsDir);

    for (const category of categories) {
      const categoryPath = path.join(outputsDir, category);
      const stat = await fs.promises.stat(categoryPath);

      if (!stat.isDirectory()) continue;

      try {
        const files = await fs.promises.readdir(categoryPath);

        for (const file of files) {
          const filePath = path.join(categoryPath, file);
          const fileStat = await fs.promises.stat(filePath);

          if (fileStat.mtime >= sessionStart) {
            recent.push(`outputs/${category}/${file}`);
          }
        }
      } catch {
        // Skip directories we can't read
      }
    }
  } catch {
    // Graceful degradation
  }

  return recent;
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
