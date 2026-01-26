/**
 * Safe Bead Append Operations
 *
 * Provides file-locked append operations for .beads/insights.jsonl
 * to prevent concurrent write corruption.
 *
 * PROBLEM: Multiple hooks appending beads simultaneously can corrupt JSON
 *   T1: Hook A writes: {"id":"bead_001"...
 *   T2: Hook B writes: {"id":"bead_002"...
 *   Result: {"id":"bead_001"...{"id":"bead_002"... (corrupted)
 *
 * SOLUTION: Acquire exclusive file lock before append
 */

import lockfile from 'proper-lockfile';
import * as fs from 'fs';
import type { Bead } from './types.js';
import { getBeadsPath, ensureBeadsDir } from './repository.js';
import { readBeadsSafe } from './bead-reader.js';

// Max file size before auto-compaction (500KB ~= 1000 beads)
const MAX_BEADS_SIZE_KB = 500;

/**
 * Append a bead to insights.jsonl with exclusive file lock
 *
 * Prevents concurrent append corruption by:
 * 1. Checking file size, auto-compact if >500KB
 * 2. Acquiring exclusive lock on file
 * 3. Appending line atomically
 * 4. Releasing lock
 *
 * If lock is held by another process, waits (retry every 100ms, max 5s)
 *
 * @param bead - The bead to append
 * @throws Error if lock acquisition times out or file write fails
 */
export async function appendBeadSafe(bead: Bead): Promise<void> {
  await ensureBeadsDir();

  const beadsPath = getBeadsPath();

  // Check if compaction needed BEFORE acquiring lock
  try {
    const stats = await fs.promises.stat(beadsPath);
    const sizeKB = stats.size / 1024;

    if (sizeKB > MAX_BEADS_SIZE_KB) {
      await autoCompactBeads(beadsPath);
    }
  } catch (err) {
    // File doesn't exist yet - that's fine
  }

  const beadLine = JSON.stringify(bead) + '\n';

  // Acquire exclusive lock (wait up to 5 seconds)
  let release: (() => Promise<void>) | null = null;
  try {
    release = await lockfile.lock(beadsPath, {
      retries: {
        retries: 50,        // 50 retries
        minTimeout: 100,    // 100ms between retries
        maxTimeout: 100     // Cap at 100ms (5s total)
      },
      stale: 5000,          // Assume lock is dead after 5s
      realpath: false,      // Don't resolve symlinks (faster)
    });

    // Exclusive section: append to file
    await fs.promises.appendFile(beadsPath, beadLine, 'utf-8');

  } finally {
    // Always release lock
    if (release) {
      await release();
    }
  }
}

/**
 * Batch append multiple beads with single lock
 * More efficient than appending one at a time
 *
 * @param beads - Array of beads to append
 */
export async function appendBeadsSafe(beads: Bead[]): Promise<void> {
  if (beads.length === 0) return;

  await ensureBeadsDir();

  const beadsPath = getBeadsPath();
  const lines = beads.map(b => JSON.stringify(b) + '\n').join('');

  let release: (() => Promise<void>) | null = null;
  try {
    release = await lockfile.lock(beadsPath, {
      retries: { retries: 50, minTimeout: 100, maxTimeout: 100 },
      stale: 5000,
      realpath: false,
    });

    await fs.promises.appendFile(beadsPath, lines, 'utf-8');

  } finally {
    if (release) {
      await release();
    }
  }
}

/**
 * Auto-compact beads file by deduplicating and removing corrupted entries
 *
 * Runs automatically when file exceeds MAX_BEADS_SIZE_KB.
 * Creates backup before rewriting file.
 *
 * Deduplication strategy: Keep most recent bead for each ID
 *
 * @param beadsPath - Path to insights.jsonl
 */
async function autoCompactBeads(beadsPath: string): Promise<void> {
  try {
    // Read and validate all beads
    const result = await readBeadsSafe();

    // Deduplicate by ID (keep most recent)
    const uniqueBeads = Array.from(
      result.beads
        .reduce((map, bead) => {
          const existing = map.get(bead.id);
          if (!existing || new Date(bead.created_at) > new Date(existing.created_at)) {
            map.set(bead.id, bead);
          }
          return map;
        }, new Map<string, Bead>())
        .values()
    );

    // Create backup
    const backupPath = `${beadsPath}.bak`;
    await fs.promises.copyFile(beadsPath, backupPath);

    // Rewrite file with deduplicated beads
    const content = uniqueBeads.map((b) => JSON.stringify(b)).join('\n') + '\n';
    await fs.promises.writeFile(beadsPath, content, 'utf-8');

    // Log compaction (silent - no user notification needed)
    const removed = result.total_lines - uniqueBeads.length;
    console.error(`[auto-compact] Compacted beads: ${result.total_lines} → ${uniqueBeads.length} (removed ${removed})`);
  } catch (error) {
    // Non-fatal - just log and continue
    console.error('[auto-compact] Failed:', error);
  }
}
