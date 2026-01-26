/**
 * Implements the "summarize-session" command.
 * This command gathers session data and generates a complete summary file.
 *
 * Gathers ACTUAL session data from:
 * - nexa/state.json (last_job, errors, brief)
 * - outputs/audit/auto-run-log.md (operations during session)
 * - git status (files changed during session)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { getProjectRoot, isoNow, ensureDir, findFilesAfter } from './utils.js';
import { loadState, updateState } from './state.js';
import { parseFrontmatter } from './frontmatter.js';

/**
 * Get files changed via git since the session start time
 */
async function getGitChanges(root: string): Promise<string[]> {
  try {
    // Get uncommitted changes (both staged and unstaged)
    const statusResult = execSync('git status --porcelain 2>/dev/null || echo ""', {
      encoding: 'utf-8',
      cwd: root,
    });

    const changedFiles = statusResult
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => line.slice(3).trim()) // Remove status prefix (e.g., " M ", "?? ")
      .filter((f) => !f.startsWith('history/sessions/')); // Exclude session summaries

    return changedFiles;
  } catch {
    return [];
  }
}

/**
 * Count beads created during this session
 */
async function getSessionBeads(root: string, since: Date): Promise<{ beadsCount: number; decisionsCount: number; ratingsCount: number }> {
  const beadsPath = path.join(root, '.beads', 'insights.jsonl');
  let beadsCount = 0;
  let decisionsCount = 0;
  let ratingsCount = 0;

  try {
    const content = await fs.promises.readFile(beadsPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    for (const line of lines) {
      try {
        const bead = JSON.parse(line);
        const beadDate = new Date(bead.created_at || '');

        if (beadDate >= since) {
          beadsCount++;
          if (bead.type === 'decision') decisionsCount++;
          if (bead.type === 'output-rating') ratingsCount++;
        }
      } catch {
        // Skip malformed JSON lines
      }
    }
  } catch {
    // File doesn't exist or can't be read
  }

  return { beadsCount, decisionsCount, ratingsCount };
}

/**
 * Count learning entries created during this session
 */
async function getSessionLearnings(root: string, since: Date): Promise<number> {
  const learningsDir = path.join(root, 'history', 'learnings');
  let count = 0;

  try {
    const files = await fs.promises.readdir(learningsDir);

    for (const file of files) {
      const filePath = path.join(learningsDir, file);
      const stat = await fs.promises.stat(filePath);

      if (stat.mtime >= since) {
        count++;
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return count;
}

/**
 * Parse audit log for operations that happened during this session
 */
async function getSessionAuditEntries(root: string, since: Date): Promise<string[]> {
  const auditPath = path.join(root, 'outputs', 'audit', 'auto-run-log.md');

  try {
    const content = await fs.promises.readFile(auditPath, 'utf-8');
    const lines = content.split('\n');
    const entries: string[] = [];

    for (const line of lines) {
      // Parse table rows: | Timestamp | Job ID | Type | Inputs | Result | Notes |
      if (!line.startsWith('|') || line.includes('---') || line.includes('Timestamp')) {
        continue;
      }

      const parts = line.split('|').map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 4) {
        const timestamp = parts[0];
        const jobType = parts[2];
        const inputs = parts[3];
        const result = parts[4] || 'ok';

        // Check if this entry is from the current session
        try {
          const entryDate = new Date(timestamp);
          if (entryDate >= since) {
            entries.push(`${jobType}: ${inputs} (${result})`);
          }
        } catch {
          // Skip malformed timestamps
        }
      }
    }

    return entries;
  } catch {
    return [];
  }
}

export async function summarizeSession(jobId: string): Promise<void> {
  const root = getProjectRoot();
  const state = await loadState();

  const sessionStartTimeStr = state.session_start_time;
  if (!sessionStartTimeStr) {
    console.log('Session start time not recorded. Cannot generate summary.');
    return;
  }
  const sessionStartTime = new Date(sessionStartTimeStr);
  const sessionEndTime = new Date();

  // 1. Gather ACTUAL session data from state
  const lastJob = state.last_job;
  const latestDelta = state.brief?.latest_delta || null;
  const topThemes = state.brief?.top_themes || [];
  const errors = state.errors || [];

  // 2. Get audit log entries for this session
  const auditEntries = await getSessionAuditEntries(root, sessionStartTime);

  // 3. Get git changes during session
  const gitChanges = await getGitChanges(root);

  // 4. Get files created in outputs/ during session
  const outputsDir = path.join(root, 'outputs');
  const recentFiles = await findFilesAfter(outputsDir, sessionStartTime);

  // 5. Get beads (insights, decisions, ratings) created this session
  const { beadsCount, decisionsCount, ratingsCount } = await getSessionBeads(root, sessionStartTime);

  // 6. Get learning entries created this session
  const learningsCount = await getSessionLearnings(root, sessionStartTime);

  // 7. Calculate session duration
  const durationMinutes = Math.round((sessionEndTime.getTime() - sessionStartTime.getTime()) / 60000);

  // 6. Build the summary with ACTUAL data
  const sessionDate = sessionEndTime.toISOString().slice(0, 10);
  const sessionTime = sessionEndTime.toISOString().slice(11, 16);

  // Format outputs created
  const outputsCreatedSection = recentFiles.length > 0
    ? recentFiles.map((f) => `- ${path.relative(root, f)}`).join('\n')
    : '- (No outputs created this session)';

  // Format skills/jobs executed (from audit log)
  const skillsSection = auditEntries.length > 0
    ? auditEntries.map((e) => `- ${e}`).join('\n')
    : '- (No PM OS jobs recorded this session)';

  // Format last job info
  const lastJobSection = lastJob
    ? `- Last job: ${lastJob.id} - ${lastJob.result} at ${lastJob.finished_at}`
    : '- (No job info in state)';

  // Format files modified (from git)
  const filesModifiedSection = gitChanges.length > 0
    ? gitChanges.slice(0, 20).map((f) => `- ${f}`).join('\n') +
      (gitChanges.length > 20 ? `\n- ... and ${gitChanges.length - 20} more` : '')
    : '- (No git changes detected)';

  // Format errors
  const errorsSection = errors.length > 0
    ? errors.map((e: any) => `- ${typeof e === 'string' ? e : JSON.stringify(e)}`).join('\n')
    : '- (No errors)';

  // Format themes
  const themesSection = topThemes.length > 0
    ? topThemes.map((t: string) => `- ${t}`).join('\n')
    : '- (No themes detected)';

  // Build the summary (complete - no placeholders)
  const summary = `---
session_start: ${sessionStartTime.toISOString().slice(0, 16).replace('T', ' ')}
session_end: ${sessionEndTime.toISOString().slice(0, 16).replace('T', ' ')}
duration: ${durationMinutes} minutes
---

# Session Summary: ${sessionDate} ${sessionTime}

## What Was Accomplished

### PM OS Jobs Executed
${skillsSection}

### Outputs Created (in outputs/)
${outputsCreatedSection}

### Last Job Info
${lastJobSection}

## Session Activity

### Files Modified (git status)
${filesModifiedSection}

### Themes Detected
${themesSection}

### Errors
${errorsSection}

## Insights Captured

**Learnings:**
- Learning entries: ${learningsCount}
- Insight beads: ${beadsCount}
- Output ratings: ${ratingsCount}

## Session Metadata

**Duration:** ${durationMinutes} minutes

**Files Modified:** ${gitChanges.length}

**PM OS Jobs:** ${auditEntries.length}

**Outputs Created:** ${recentFiles.length}

**Capture Stats:**
- Learning entries: ${learningsCount}
- Insight beads: ${beadsCount}
- Decision logs: ${decisionsCount}
- Output ratings: ${ratingsCount}
`;

  // 7. Write the summary file
  const historySessionDir = path.join(root, 'history', 'sessions');
  await ensureDir(historySessionDir);

  const summaryFilename = `${sessionEndTime.toISOString().replace(/[:.]/g, '-')}-summary.md`;
  const summaryPath = path.join(historySessionDir, summaryFilename);

  await fs.promises.writeFile(summaryPath, summary);

  console.log(`Session summary written to: ${path.relative(root, summaryPath)}`);

  // 8. Reset session start time in state
  await updateState({ session_start_time: null });
}
