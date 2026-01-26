#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import type { HookDefinition, HookContext, HookResult, HookMeta, ScheduledPayload } from '../types.js';
import { formatSessionStartOutput, logHookComplete } from '../lib/index.js';
import { getProjectRoot } from '../../utils.js';
import { parseFrontmatter } from '../../frontmatter.js';
import { glob } from 'glob';

export const meta: HookMeta = {
  id: 'staleness-check',
  trigger: 'time:daily',
  intent: 'Detect outputs that are stale relative to their sources',
  guarantees: ['non-blocking', 'read-only', 'idempotent'],
  scope: {
    read: ['outputs/**/*.md', 'inputs/**/*'],
    write: [],
  },
  userMessage: undefined, // Staleness shown in greeting if found
};

// Directories to skip
const SKIP_DIRECTORIES = [
  'outputs/ingest',
  'outputs/audit',
  'outputs/deltas',
];

export interface StaleOutput {
  outputPath: string;
  generatedAt: string;
  staleSources: Array<{
    path: string;
    modifiedAt: string;
  }>;
}

export async function run(ctx: HookContext): Promise<HookResult> {
  const filesRead: string[] = [];

  try {
    const root = getProjectRoot();

    // 1. Find all output files
    const outputPattern = path.join(root, 'outputs', '**', '*.md');
    const ignore = SKIP_DIRECTORIES.map(d => path.join(root, d, '**'));
    const outputFiles = await glob(outputPattern, { nodir: true, ignore });

    // 2. Check each output for staleness
    const staleOutputs: StaleOutput[] = [];

    for (const outputFile of outputFiles) {
      const result = await checkStaleness(root, outputFile);
      if (result) {
        staleOutputs.push(result);
        filesRead.push(path.relative(root, outputFile));
      }
    }

    // 3. If no stale outputs, return success quietly
    if (staleOutputs.length === 0) {
      await logHookComplete(meta.id, 'time:daily', true, 'No stale outputs');
      return {
        success: true,
        filesRead,
      };
    }

    // 4. Build staleness report (use SessionStart format for hooks triggered at startup)
    const report = buildStalenessReport(staleOutputs);
    const output = formatSessionStartOutput(report);

    await logHookComplete(
      meta.id,
      'time:daily',
      true,
      `Found ${staleOutputs.length} stale outputs`
    );

    return {
      success: true,
      contextInjection: JSON.stringify(output, null, 2),
      filesRead,
    };
  } catch (error) {
    await logHookComplete(meta.id, 'time:daily', false, String(error));

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      filesRead,
    };
  }
}

/**
 * Check if an output file is stale
 */
async function checkStaleness(
  root: string,
  outputPath: string
): Promise<StaleOutput | null> {
  try {
    // Read output file
    const content = await fs.promises.readFile(outputPath, 'utf-8');
    const { meta } = parseFrontmatter(content);

    // Need generated timestamp and sources
    if (!meta?.generated || !meta?.sources) {
      return null;
    }

    const generatedAt = String(meta.generated);
    const generatedDate = parseDate(generatedAt);
    if (!generatedDate) {
      return null;
    }

    // Check each source
    const sources = Array.isArray(meta.sources) ? meta.sources : [meta.sources];
    const staleSources: Array<{ path: string; modifiedAt: string }> = [];

    for (const source of sources) {
      // Parse source entry (might be "path (modified: date)" or just "path")
      const sourcePath = extractSourcePath(String(source));
      const absoluteSourcePath = path.isAbsolute(sourcePath)
        ? sourcePath
        : path.join(root, sourcePath);

      try {
        const stats = await fs.promises.stat(absoluteSourcePath);
        if (stats.mtime > generatedDate) {
          staleSources.push({
            path: sourcePath,
            modifiedAt: stats.mtime.toISOString(),
          });
        }
      } catch {
        // Source file not found, skip
      }
    }

    if (staleSources.length > 0) {
      return {
        outputPath: path.relative(root, outputPath),
        generatedAt,
        staleSources,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Parse date from various formats
 */
function parseDate(dateStr: string): Date | null {
  // Try ISO format first
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try "YYYY-MM-DD HH:MM" format
  const match = dateStr.match(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/);
  if (match) {
    date = new Date(`${match[1]}T${match[2]}:00`);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

/**
 * Extract source path from source entry
 */
function extractSourcePath(source: string): string {
  // Handle "path (modified: date)" format
  const match = source.match(/^([^(]+?)(?:\s*\(.*\))?$/);
  return match ? match[1].trim() : source.trim();
}

/**
 * Build staleness report
 */
function buildStalenessReport(staleOutputs: StaleOutput[]): string {
  let report = `⚠️ **Stale Outputs Detected**

${staleOutputs.length} output(s) are older than their source files:

`;

  for (const stale of staleOutputs) {
    report += `### ${stale.outputPath}
Generated: ${stale.generatedAt}

Stale sources:
`;
    for (const source of stale.staleSources) {
      report += `- ${source.path} (modified: ${source.modifiedAt.slice(0, 19)})\n`;
    }
    report += '\n';
  }

  report += `**Recommended:** Refresh these outputs by re-running the associated skills.

To refresh:
1. Run the skill that generates the stale output
2. Or run \`pm-os scan\` to update the ingest index`;

  return report;
}

/**
 * Run staleness check and return results
 */
export async function getStaleOutputs(): Promise<StaleOutput[]> {
  const root = getProjectRoot();
  const outputPattern = path.join(root, 'outputs', '**', '*.md');
  const ignore = SKIP_DIRECTORIES.map(d => path.join(root, d, '**'));
  const outputFiles = await glob(outputPattern, { nodir: true, ignore });

  const staleOutputs: StaleOutput[] = [];
  for (const outputFile of outputFiles) {
    const result = await checkStaleness(root, outputFile);
    if (result) {
      staleOutputs.push(result);
    }
  }

  return staleOutputs;
}

// CLI execution
if (process.argv[1]?.endsWith('StalenessCheck.hook.js')) {
  import('../lib/context.js').then(async ({ buildHookContext, createScheduledPayload }) => {
    const ctx = buildHookContext('time:daily', createScheduledPayload('time:daily'));
    const result = await run(ctx);
    if (result.contextInjection) {
      console.log(result.contextInjection);
    } else {
      console.log('{}');
    }
  }).catch(err => {
    // Gracefully handle any unhandled errors in the async block
    console.error(`StalenessCheck hook failed unexpectedly: ${err instanceof Error ? err.message : String(err)}`);
    console.log('{}'); // Output empty JSON to not break the chain
  });
}

export const StalenessCheckHook: HookDefinition = { meta, run };
export default StalenessCheckHook;
