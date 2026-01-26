/**
 * Safe Bead Reading with Corruption Detection
 *
 * Provides resilient reading of .beads/insights.jsonl that:
 * - Parses each line independently
 * - Skips corrupted lines with logging
 * - Validates bead structure
 * - Reports corruption statistics
 * - Enables repair operations
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Bead, BeadType } from './types.js';
import { getBeadsPath } from './repository.js';

/**
 * Result of reading beads file
 */
export interface BeadReadResult {
  /** Valid beads successfully parsed */
  beads: Bead[];
  /** Line numbers (1-indexed) that failed to parse */
  corrupted_lines: number[];
  /** Total lines in file */
  total_lines: number;
  /** Whether any corruption was detected */
  corruption_detected: boolean;
}

/**
 * Read all beads from file, skipping corrupted lines
 *
 * Returns statistics about corruption for logging/repair
 */
export async function readBeadsSafe(): Promise<BeadReadResult> {
  const beadsPath = getBeadsPath();
  const beads: Bead[] = [];
  const corrupted_lines: number[] = [];

  try {
    const content = await fs.promises.readFile(beadsPath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      try {
        const bead = JSON.parse(line) as Bead;

        // Validate required fields
        if (!bead.id || !bead.type || !bead.content || !bead.source || !bead.created_at) {
          corrupted_lines.push(lineNum);
          return;
        }

        // Validate type is one of expected values
        const validTypes: BeadType[] = ['insight', 'decision', 'pattern', 'question', 'output-rating'];
        if (!validTypes.includes(bead.type)) {
          corrupted_lines.push(lineNum);
          return;
        }

        beads.push(bead);
      } catch (parseError) {
        // JSON parse failed - corrupted line
        corrupted_lines.push(lineNum);
      }
    });

    return {
      beads,
      corrupted_lines,
      total_lines: lines.length,
      corruption_detected: corrupted_lines.length > 0,
    };
  } catch (fileError) {
    // File doesn't exist or can't be read
    return {
      beads: [],
      corrupted_lines: [],
      total_lines: 0,
      corruption_detected: false,
    };
  }
}

/**
 * Repair beads file by removing corrupted lines
 *
 * Creates backup and rewrites file with only valid beads
 * Returns stats on what was recovered
 */
export async function repairBeadsFile(): Promise<{
  recovered: number;
  removed: number;
  backup_path: string;
}> {
  const beadsPath = getBeadsPath();
  const backupPath = `${beadsPath}.bak`;

  // Read with corruption detection
  const result = await readBeadsSafe();

  if (!result.corruption_detected) {
    return {
      recovered: result.beads.length,
      removed: 0,
      backup_path: backupPath,
    };
  }

  // Create backup
  try {
    await fs.promises.copyFile(beadsPath, backupPath);
  } catch (backupError) {
    // Backup failed, but continue with repair
  }

  // Rewrite file with valid beads only
  const validLines = result.beads
    .map(b => JSON.stringify(b))
    .join('\n') + '\n';

  await fs.promises.writeFile(beadsPath, validLines, 'utf-8');

  return {
    recovered: result.beads.length,
    removed: result.corrupted_lines.length,
    backup_path: backupPath,
  };
}
