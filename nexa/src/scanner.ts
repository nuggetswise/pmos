/**
 * PM OS Source Scanner
 *
 * Scans registered sources for new or changed files.
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import {
  loadSources,
  loadState,
  loadInputRules,
  isAlreadyIngested,
  findByPathAndFingerprint,
} from './state';
import { computeHash, isStable, expandPath, getExtension, getQuickFingerprint } from './utils';
import { ScanResult, JobType, InputRule } from './types';

/**
 * Scan all registered sources for files to process
 */
export async function scanSources(): Promise<ScanResult[]> {
  const config = await loadSources();
  const state = await loadState();
  const rules = await loadInputRules();
  const results: ScanResult[] = [];

  console.log(`Scanning ${config.sources.length} source(s)...`);

  for (const source of config.sources) {
    const expandedPath = expandPath(source.path);

    // Check if path exists
    try {
      await fs.promises.access(expandedPath);
    } catch {
      console.log(`  Skipping ${source.path} (not found)`);
      continue;
    }

    console.log(`  Scanning: ${source.path}`);

    // Build glob patterns
    for (const pattern of source.include) {
      const fullPattern =
        source.mode === 'recursive'
          ? path.join(expandedPath, pattern)
          : path.join(expandedPath, pattern.replace('**/', ''));

      try {
        const files = await glob(fullPattern, {
          nodir: true,
          absolute: true,
        });

        for (const file of files) {
          // Check stability
          const stable = await isStable(file, config.stability_window_sec);
          if (!stable) {
            console.log(`    Skipping ${path.basename(file)} (still being modified)`);
            continue;
          }

          // Two-stage hashing: first check fingerprint (fast)
          const fingerprint = await getQuickFingerprint(file);
          const existingByFingerprint = findByPathAndFingerprint(state, file, fingerprint);

          if (existingByFingerprint && existingByFingerprint.status === 'ok') {
            // File unchanged (same mtime + size), skip expensive hash computation
            results.push({
              path: file,
              hash: existingByFingerprint.content_hash,
              fingerprint,
              stable,
              alreadyIngested: true,
              jobType: routeToJobType(file, rules.rules),
            });
            continue;
          }

          // Fingerprint changed or new file - compute full hash
          const hash = await computeHash(file);

          // Check if already ingested (by hash, for deduplication)
          const alreadyIngested = isAlreadyIngested(state, file, hash);

          // Determine job type
          const jobType = routeToJobType(file, rules.rules);

          results.push({
            path: file,
            hash,
            fingerprint,
            stable,
            alreadyIngested,
            jobType,
          });

          if (!alreadyIngested) {
            console.log(`    Found: ${path.basename(file)} -> ${jobType}`);
          }
        }
      } catch (err) {
        console.error(`    Error scanning pattern ${pattern}:`, err);
      }
    }
  }

  const newFiles = results.filter((r) => !r.alreadyIngested);
  console.log(`\nFound ${newFiles.length} new file(s) to process`);

  return results;
}

/**
 * Route a file to a job type based on input rules
 */
export function routeToJobType(filePath: string, rules: InputRule[]): JobType {
  const ext = getExtension(filePath);
  const pathLower = filePath.toLowerCase();

  // Sort rules by priority (higher first)
  const sortedRules = [...rules].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  for (const rule of sortedRules) {
    let matches = true;

    // Check extension match
    if (rule.match.extensions && rule.match.extensions.length > 0) {
      if (!rule.match.extensions.includes(ext)) {
        matches = false;
      }
    }

    // Check path contains match
    if (matches && rule.match.path_contains && rule.match.path_contains.length > 0) {
      const pathMatches = rule.match.path_contains.some((term) =>
        pathLower.includes(term.toLowerCase())
      );
      if (!pathMatches) {
        matches = false;
      }
    }

    if (matches) {
      return rule.job;
    }
  }

  // Default to general
  return 'delta-general';
}

/**
 * Get files that need processing (not already ingested)
 */
export async function getFilesToProcess(): Promise<ScanResult[]> {
  const results = await scanSources();
  return results.filter((r) => !r.alreadyIngested);
}
