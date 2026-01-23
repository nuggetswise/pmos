#!/usr/bin/env node
/**
 * ============================================================
 * HOOK: AutoMirror
 * ============================================================
 * PURPOSE: Automatically copy outputs to history/ with date suffix
 *          when files are written to outputs/.
 * TRIGGER: output:created (PostToolUse with Write to outputs/)
 *
 * INPUT:
 *   - filePath: Path to the output file created
 *   - skillName: Name of the skill that created it (from metadata)
 *
 * OUTPUT:
 *   - history/{skill}/{filename}-{date}.md: Mirrored file
 *   - hookSpecificOutput: Notification of mirror action
 *
 * SIDE EFFECTS:
 *   - Creates file in history/ directory
 *   - Logs to audit trail
 *
 * ERROR HANDLING:
 *   - Skips files without skill metadata (warns)
 *   - Handles duplicate filenames with time suffix
 *
 * INTER-HOOK RELATIONSHIPS:
 *   - Runs after Write tool completes
 *   - May trigger before PostSkillSignal
 * ============================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import type { HookDefinition, HookContext, HookResult, HookMeta, OutputCreatedPayload } from '../types.js';
import {
  logHookComplete,
  buildAutoMirrorNotification,
  formatContextInjection,
} from '../lib/index.js';
import { getProjectRoot, ensureDir, isoNow } from '../../utils.js';
import { parseFrontmatter, extractDateFromMeta } from '../../frontmatter.js';

export const meta: HookMeta = {
  id: 'auto-mirror',
  trigger: 'output:created',
  intent: 'Mirror output files to history/ for learning loop',
  guarantees: ['non-blocking', 'idempotent'],
  scope: {
    read: ['outputs/**/*.md'],
    write: ['history/**/*.md', 'outputs/audit/hook-log.md'],
  },
  userMessage: '📁 Mirrored to history/',
};

// Directories to ignore (managed by daemon)
const IGNORE_PATTERNS = [
  'outputs/ingest/',
  'outputs/audit/',
  'outputs/deltas/',
];

export async function run(ctx: HookContext): Promise<HookResult> {
  const payload = ctx.payload as OutputCreatedPayload;
  const filesRead: string[] = [];
  const filesModified: string[] = [];

  try {
    const filePath = payload.filePath;

    // 1. Check if file should be mirrored
    if (!shouldMirror(filePath)) {
      return {
        success: true,
        filesRead,
        filesModified,
      };
    }

    // 2. Read the file
    const root = getProjectRoot();
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(root, filePath);

    if (!await fileExists(absolutePath)) {
      return {
        success: false,
        error: `File not found: ${filePath}`,
        filesRead,
        filesModified,
      };
    }

    const content = await fs.promises.readFile(absolutePath, 'utf-8');
    filesRead.push(filePath);

    // 3. Parse frontmatter for skill name
    const { meta: frontmatter } = parseFrontmatter(content);
    const skill = (frontmatter?.skill as string) || payload.skillName || 'uncategorized';

    // 4. Generate destination path
    const dateSuffix = extractDateFromMeta(frontmatter) || formatDate(new Date());
    const historyDir = path.join(root, 'history', skill);
    await ensureDir(historyDir);

    const baseName = path.basename(absolutePath, '.md');
    let destPath = path.join(historyDir, `${baseName}-${dateSuffix}.md`);

    // Handle duplicates
    if (await fileExists(destPath)) {
      const existingContent = await fs.promises.readFile(destPath, 'utf-8');
      if (existingContent === content) {
        // Same content, skip
        return {
          success: true,
          filesRead,
          filesModified,
        };
      }
      // Different content, add time suffix
      const timeSuffix = formatTime(new Date());
      destPath = path.join(historyDir, `${baseName}-${dateSuffix}-${timeSuffix}.md`);
    }

    // 5. Copy file
    await fs.promises.copyFile(absolutePath, destPath);
    const relativeDestPath = path.relative(root, destPath);
    filesModified.push(relativeDestPath);

    // 6. Log to audit
    await logHookComplete(meta.id, 'output:created', true, `Mirrored to ${relativeDestPath}`);

    // 7. Build notification
    const notification = buildAutoMirrorNotification(
      path.relative(root, absolutePath),
      relativeDestPath
    );
    const output = formatContextInjection('output:created', notification, 'auto-mirror');

    return {
      success: true,
      contextInjection: JSON.stringify(output, null, 2),
      filesRead,
      filesModified,
    };
  } catch (error) {
    await logHookComplete(meta.id, 'output:created', false, String(error));

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      filesRead,
      filesModified,
    };
  }
}

/**
 * Check if file should be mirrored
 */
function shouldMirror(filePath: string): boolean {
  // Only mirror files in outputs/
  if (!filePath.includes('outputs/')) {
    return false;
  }

  // Skip ignored directories
  for (const pattern of IGNORE_PATTERNS) {
    if (filePath.includes(pattern)) {
      return false;
    }
  }

  // Only mirror markdown files
  if (!filePath.endsWith('.md')) {
    return false;
  }

  return true;
}

/**
 * Check if file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Format time as HHMMSS
 */
function formatTime(date: Date): string {
  return date.toISOString().slice(11, 19).replace(/:/g, '');
}

// CLI execution
if (process.argv[1]?.endsWith('AutoMirror.hook.js')) {
  // Parse stdin for file path
  let inputData = '';
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', chunk => inputData += chunk);
  process.stdin.on('end', async () => {
    try {
      const input = JSON.parse(inputData);
      const filePath = input.tool_result?.path || input.filePath || '';

      if (filePath) {
        const { buildHookContext, createOutputCreatedPayload } = await import('../lib/context.js');
        const ctx = buildHookContext(
          'output:created',
          createOutputCreatedPayload(filePath)
        );
        const result = await run(ctx);
        if (result.contextInjection) {
          console.log(result.contextInjection);
        }
      }
    } catch {
      // Silent fail for non-JSON input
      console.log('{}');
    }
  });
}

export const AutoMirrorHook: HookDefinition = { meta, run };
export default AutoMirrorHook;
