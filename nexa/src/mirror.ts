/**
 * Mirror outputs to history/
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { ensureDir, getProjectRoot } from './utils';
import { parseFrontmatter, extractDateFromMeta } from './frontmatter';
import { appendAuditLog } from './audit';

export type MirrorResult = {
  mirrored: number;
  skipped: number;
  warnings: string[];
};

const OUTPUT_IGNORES = ['outputs/ingest/**', 'outputs/audit/**', 'outputs/deltas/**'];

export async function mirrorOutputsToHistory(jobId: string): Promise<MirrorResult> {
  const root = getProjectRoot();
  const outputPattern = path.join(root, 'outputs', '**', '*.md');
  const ignore = OUTPUT_IGNORES.map((pattern) => path.join(root, pattern));

  const files = await glob(outputPattern, { nodir: true, absolute: true, ignore });
  let mirrored = 0;
  let skipped = 0;
  const warnings: string[] = [];

  for (const filePath of files) {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const { meta } = parseFrontmatter(content);

    const rawSkill = meta && typeof meta.skill === 'string' ? meta.skill.trim() : '';
    const skill = rawSkill || 'uncategorized';
    if (!rawSkill) {
      warnings.push(`Missing skill metadata: ${path.relative(root, filePath)}`);
    }

    const dateSuffix = extractDateFromMeta(meta) || formatDateFromStat(filePath);
    const destDir = path.join(root, 'history', skill);
    await ensureDir(destDir);

    const base = path.basename(filePath, '.md');
    let destPath = path.join(destDir, `${base}-${dateSuffix}.md`);

    if (await fileExists(destPath)) {
      const existing = await fs.promises.readFile(destPath, 'utf-8');
      if (existing === content) {
        skipped += 1;
        continue;
      }

      const timeSuffix = formatTimeFromStat(filePath);
      destPath = path.join(destDir, `${base}-${dateSuffix}-${timeSuffix}.md`);
    }

    await fs.promises.copyFile(filePath, destPath);
    mirrored += 1;
  }

  const inputs = files.slice(0, 5);
  if (files.length > 5) {
    inputs.push(`+${files.length - 5} more`);
  }

  const notes = `mirrored=${mirrored}, skipped=${skipped}, warnings=${warnings.length}`;
  await appendAuditLog(jobId, 'mirror', inputs, 'ok', notes);

  return { mirrored, skipped, warnings };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function formatDateFromStat(filePath: string): string {
  const stat = fs.statSync(filePath);
  const date = stat.mtime;
  return date.toISOString().slice(0, 10);
}

function formatTimeFromStat(filePath: string): string {
  const stat = fs.statSync(filePath);
  const date = stat.mtime;
  return date.toISOString().slice(11, 19).replace(/:/g, '');
}
