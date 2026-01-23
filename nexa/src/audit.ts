/**
 * Audit log helper
 */

import * as fs from 'fs';
import * as path from 'path';
import { ensureDir, isoNow, getProjectRoot } from './utils.js';

const AUDIT_HEADER = `# Auto-Run Audit Log

| Timestamp | Job ID | Type | Inputs | Result | Notes |
|-----------|--------|------|--------|--------|-------|
`;

function getAuditFile(): string {
  const root = getProjectRoot();
  return path.join(root, 'outputs', 'audit', 'auto-run-log.md');
}

async function ensureAuditFile(): Promise<void> {
  const auditFile = getAuditFile();
  await ensureDir(path.dirname(auditFile));

  try {
    await fs.promises.access(auditFile);
  } catch {
    await fs.promises.writeFile(auditFile, AUDIT_HEADER);
  }
}

export async function appendAuditLog(
  jobId: string,
  jobType: string,
  inputs: string[],
  result: 'ok' | 'failed',
  notes?: string
): Promise<void> {
  await ensureAuditFile();

  const auditFile = getAuditFile();
  const timestamp = isoNow();
  const inputsStr = inputs.map((input) => path.basename(input)).join(', ');
  const safeNotes = notes ? notes.replace(/\r?\n/g, ' ') : '';
  const line = `| ${timestamp} | ${jobId} | ${jobType} | ${inputsStr} | ${result} | ${safeNotes} |\n`;

  await fs.promises.appendFile(auditFile, line);
}
