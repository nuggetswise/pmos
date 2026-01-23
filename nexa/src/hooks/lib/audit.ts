/**
 * Audit utilities for PM OS hooks
 *
 * Logging operations for hooks to the audit trail.
 */

import * as fs from 'fs';
import * as path from 'path';
import { getProjectRoot, ensureDir, isoNow } from '../../utils.js';

const HOOK_AUDIT_HEADER = `# Hook Audit Log

| Timestamp | Hook ID | Event | Result | Notes |
|-----------|---------|-------|--------|-------|
`;

/**
 * Get path to hook audit file
 */
function getHookAuditPath(): string {
  const root = getProjectRoot();
  return path.join(root, 'outputs', 'audit', 'hook-log.md');
}

/**
 * Ensure hook audit file exists
 */
async function ensureHookAuditFile(): Promise<void> {
  const auditPath = getHookAuditPath();
  await ensureDir(path.dirname(auditPath));

  try {
    await fs.promises.access(auditPath);
  } catch {
    await fs.promises.writeFile(auditPath, HOOK_AUDIT_HEADER);
  }
}

/**
 * Append entry to hook audit log
 */
export async function appendHookAuditLog(
  hookId: string,
  event: string,
  result: 'ok' | 'failed' | 'skipped',
  notes?: string
): Promise<void> {
  await ensureHookAuditFile();

  const auditPath = getHookAuditPath();
  const timestamp = isoNow();
  const safeNotes = notes ? notes.replace(/\r?\n/g, ' ').slice(0, 100) : '';
  const line = `| ${timestamp} | ${hookId} | ${event} | ${result} | ${safeNotes} |\n`;

  await fs.promises.appendFile(auditPath, line);
}

/**
 * Log hook start
 */
export async function logHookStart(hookId: string, event: string): Promise<void> {
  // For now, we only log completions to avoid noise
  // Could be enabled for debugging
}

/**
 * Log hook completion
 */
export async function logHookComplete(
  hookId: string,
  event: string,
  success: boolean,
  notes?: string
): Promise<void> {
  await appendHookAuditLog(
    hookId,
    event,
    success ? 'ok' : 'failed',
    notes
  );
}

/**
 * Log hook skip (when conditions not met)
 */
export async function logHookSkip(
  hookId: string,
  event: string,
  reason: string
): Promise<void> {
  await appendHookAuditLog(hookId, event, 'skipped', reason);
}

/**
 * Create a hook execution context
 */
export interface HookExecutionLog {
  hookId: string;
  event: string;
  startedAt: string;
  filesRead: string[];
  filesWritten: string[];
}

export function createExecutionLog(hookId: string, event: string): HookExecutionLog {
  return {
    hookId,
    event,
    startedAt: isoNow(),
    filesRead: [],
    filesWritten: [],
  };
}

export function addFileRead(log: HookExecutionLog, filePath: string): void {
  log.filesRead.push(filePath);
}

export function addFileWritten(log: HookExecutionLog, filePath: string): void {
  log.filesWritten.push(filePath);
}

export async function finalizeExecutionLog(
  log: HookExecutionLog,
  success: boolean
): Promise<void> {
  const notes = `read=${log.filesRead.length}, wrote=${log.filesWritten.length}`;
  await logHookComplete(log.hookId, log.event, success, notes);
}
