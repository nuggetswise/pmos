/**
 * Learning Engine
 *
 * Analyzes history to generate learned rules.
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { ensureDir, generateJobId, getProjectRoot, isoNow } from './utils.js';
import { parseFrontmatter } from './frontmatter.js';
import { appendAuditLog } from './audit.js';

const STOPWORDS = new Set([
  'a',
  'about',
  'after',
  'all',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'but',
  'by',
  'can',
  'could',
  'did',
  'do',
  'does',
  'for',
  'from',
  'had',
  'has',
  'have',
  'how',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'just',
  'may',
  'more',
  'most',
  'not',
  'of',
  'on',
  'or',
  'our',
  'out',
  'over',
  'should',
  'so',
  'some',
  'such',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'to',
  'under',
  'up',
  'use',
  'was',
  'we',
  'were',
  'what',
  'when',
  'which',
  'who',
  'will',
  'with',
  'you',
  'your',
]);

const AUTO_MIN_FILES = 5;
const AUTO_MIN_DAYS = 7;

export async function runLearning(skill: string, jobId: string): Promise<void> {
  const trimmed = skill.trim();
  if (!trimmed) {
    return;
  }

  const root = getProjectRoot();
  const historyDir = path.join(root, 'history', trimmed);

  const files = await glob(path.join(historyDir, '*.md'), { nodir: true, absolute: true });
  if (files.length === 0) {
    console.log(`No history files found for ${trimmed}.`);
    return;
  }

  const tokens = new Map<string, number>();
  const headings = new Map<string, number>();
  let earliest = new Date(8640000000000000);
  let latest = new Date(0);

  for (const filePath of files) {
    const stat = await fs.promises.stat(filePath);
    if (stat.mtime < earliest) earliest = stat.mtime;
    if (stat.mtime > latest) latest = stat.mtime;

    const content = await fs.promises.readFile(filePath, 'utf-8');
    const { body } = parseFrontmatter(content);

    for (const heading of extractHeadings(body)) {
      const count = headings.get(heading) || 0;
      headings.set(heading, count + 1);
    }

    for (const token of tokenize(body)) {
      const count = tokens.get(token) || 0;
      tokens.set(token, count + 1);
    }
  }

  const topTokens = topEntries(tokens, 10);
  const topHeadings = topEntries(headings, 10);

  const learnedDir = path.join(root, '.claude', 'rules', 'learned');
  await ensureDir(learnedDir);

  const learnedPath = path.join(learnedDir, `${trimmed}-patterns.md`);
  const learnedContent = buildLearnedContent(trimmed, files, earliest, latest, topTokens, topHeadings);
  await fs.promises.writeFile(learnedPath, learnedContent);

  const localPath = path.join(root, 'CLAUDE.local.md');
  await appendLocalLearning(localPath, trimmed, topTokens, topHeadings);

  const inputs = files.slice(0, 5);
  if (files.length > 5) {
    inputs.push(`+${files.length - 5} more`);
  }
  await appendAuditLog(jobId, 'learn', inputs, 'ok', `skill=${trimmed}`);

  console.log(`Learned patterns written to ${path.relative(root, learnedPath)}`);
  console.log(`Preferences appended to ${path.relative(root, localPath)}`);
}

export async function runLearningAuto(): Promise<{
  processed: number;
  skipped: number;
  warnings: string[];
}> {
  const root = getProjectRoot();
  const historyRoot = path.join(root, 'history');
  const learnedRoot = path.join(root, '.claude', 'rules', 'learned');
  const trackerPath = path.join(root, '.claude', 'learning-last-run');

  let entries: fs.Dirent[] = [];
  try {
    entries = await fs.promises.readdir(historyRoot, { withFileTypes: true });
  } catch {
    return { processed: 0, skipped: 0, warnings: ['history/ not found'] };
  }

  await ensureDir(learnedRoot);

  const warnings: string[] = [];
  let processed = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skill = entry.name;
    const historyDir = path.join(historyRoot, skill);

    const files = await glob(path.join(historyDir, '*.md'), { nodir: true, absolute: true });
    if (files.length < AUTO_MIN_FILES) {
      skipped += 1;
      continue;
    }

    const learnedPath = path.join(learnedRoot, `${skill}-patterns.md`);
    const shouldRun = await isStaleLearned(learnedPath, AUTO_MIN_DAYS);
    if (!shouldRun) {
      skipped += 1;
      continue;
    }

    const jobId = `${generateJobId('learn')}_auto_${processed + 1}`;
    await runLearning(skill, jobId);
    processed += 1;
  }

  await ensureDir(path.join(root, '.claude'));
  await fs.promises.writeFile(trackerPath, String(Math.floor(Date.now() / 1000)));

  const summaryNotes = `processed=${processed}, skipped=${skipped}`;
  await appendAuditLog(generateJobId('learn'), 'learn', ['auto'], 'ok', summaryNotes);

  return { processed, skipped, warnings };
}

function extractHeadings(content: string): string[] {
  const headings: string[] = [];
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^##+\s+(.*)$/);
    if (match) {
      headings.push(match[1].trim());
    }
  }
  return headings;
}

function tokenize(content: string): string[] {
  return content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

function topEntries(map: Map<string, number>, limit: number): Array<[string, number]> {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function buildLearnedContent(
  skill: string,
  files: string[],
  earliest: Date,
  latest: Date,
  topTokens: Array<[string, number]>,
  topHeadings: Array<[string, number]>
): string {
  const range = `${earliest.toISOString().slice(0, 10)} → ${latest.toISOString().slice(0, 10)}`;
  const tokenLines = topTokens.map(([token, count]) => `- ${token} (${count})`).join('\n');
  const headingLines = topHeadings.map(([heading, count]) => `- ${heading} (${count})`).join('\n');
  const filesList = files
    .map((filePath) => `- ${path.basename(filePath)}`)
    .join('\n');

  return `# Learned Patterns: ${skill}

Generated: ${isoNow()}
History files analyzed: ${files.length}
Date range: ${range}

## Top Recurring Topics (heuristic)
${tokenLines || '- (none)'}

## Common Sections
${headingLines || '- (none)'}

## Files Analyzed
${filesList}

## Suggested Defaults
- Keep outputs concise and evidence-backed.
- Reuse recurring sections that appear in successful outputs.
- Highlight top recurring topics when drafting new outputs.
`;
}

async function appendLocalLearning(
  localPath: string,
  skill: string,
  topTokens: Array<[string, number]>,
  topHeadings: Array<[string, number]>
): Promise<void> {
  const exists = await fileExists(localPath);
  if (!exists) {
    await fs.promises.writeFile(localPath, '# Personal Preferences\n');
  }

  const tokensLine = topTokens.map(([token]) => token).join(', ') || 'none';
  const headingsLine = topHeadings.map(([heading]) => heading).join(', ') || 'none';
  const entry = `\n## Learned (${isoNow()})\n- Skill: ${skill}\n- Top topics: ${tokensLine}\n- Common sections: ${headingsLine}\n`;

  await fs.promises.appendFile(localPath, entry);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isStaleLearned(filePath: string, minDays: number): Promise<boolean> {
  const exists = await fileExists(filePath);
  if (!exists) return true;

  const stat = await fs.promises.stat(filePath);
  const ageMs = Date.now() - stat.mtime.getTime();
  return ageMs >= minDays * 24 * 60 * 60 * 1000;
}
