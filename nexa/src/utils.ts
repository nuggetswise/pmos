/**
 * PM OS CLI Utilities
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Compute SHA-256 hash of file contents
 */
export async function computeHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(`sha256:${hash.digest('hex')}`));
    stream.on('error', reject);
  });
}

/**
 * Get quick fingerprint for two-stage hashing (mtime:size)
 * Much faster than computing full hash - only compute full hash if fingerprint changed
 */
export async function getQuickFingerprint(filePath: string): Promise<string> {
  const stats = await fs.promises.stat(filePath);
  return `${stats.mtime.getTime()}:${stats.size}`;
}

/**
 * Check if file has been stable (unchanged) for the given window
 */
export async function isStable(filePath: string, windowSeconds: number): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(filePath);
    const mtime = stats.mtime.getTime();
    const now = Date.now();
    const ageMs = now - mtime;
    return ageMs >= windowSeconds * 1000;
  } catch {
    return false;
  }
}

/**
 * Expand environment variables in a path and resolve relative paths against project root
 */
export function expandPath(inputPath: string): string {
  // First expand environment variables
  let expanded = inputPath.replace(/\$\{(\w+)\}|\$(\w+)/g, (_, p1, p2) => {
    const varName = p1 || p2;
    return process.env[varName] || '';
  });

  // Resolve relative paths against project root (uses getProjectRoot())
  if (!path.isAbsolute(expanded)) {
    expanded = resolveProjectPath(expanded);
  }

  return expanded;
}

/**
 * Ensure directory exists
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

/**
 * Get file extension (lowercase, without dot)
 */
export function getExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase().slice(1);
}

/**
 * Generate job ID
 */
export function generateJobId(jobType: string): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  return `job_${timestamp}_${jobType}`;
}

/**
 * Get ISO timestamp
 */
export function isoNow(): string {
  return new Date().toISOString();
}

/**
 * Format relative time for display
 */
export function relativeTime(isoDate: string | null): string {
  if (!isoDate) return 'never';

  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

/**
 * Get the project root directory (where pm_os_superpowers is)
 */
export function getProjectRoot(): string {
  // Navigate from nexa/src to project root
  return path.resolve(__dirname, '..', '..');
}

/**
 * Resolve path relative to project root
 */
export function resolveProjectPath(relativePath: string): string {
  return path.resolve(getProjectRoot(), relativePath);
}
