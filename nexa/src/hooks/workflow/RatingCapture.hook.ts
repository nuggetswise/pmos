#!/usr/bin/env node
/**
 * ============================================================
 * HOOK: RatingCapture
 * ============================================================
 * PURPOSE: Capture user ratings for outputs and store as beads
 *          in .beads/insights.jsonl.
 * TRIGGER: output:rated (when user provides 1-5 rating)
 *
 * INPUT:
 *   - filePath: Path to the rated output
 *   - rating: 1-5 score
 *   - feedback: Optional qualitative feedback
 *
 * OUTPUT:
 *   - .beads/insights.jsonl: Appended rating bead
 *   - hookSpecificOutput: Confirmation of capture
 *
 * SIDE EFFECTS:
 *   - Appends bead to insights file
 *   - Logs to audit trail
 *
 * ERROR HANDLING:
 *   - Creates beads directory if missing
 *   - Validates rating is 1-5
 *
 * INTER-HOOK RELATIONSHIPS:
 *   - Triggered after PostSkillSignal
 *   - Rating data used by weekly learning
 * ============================================================
 */

import type { HookDefinition, HookContext, HookResult, HookMeta, OutputRatedPayload } from '../types.js';
import {
  logHookComplete,
  formatContextInjection,
} from '../lib/index.js';
import { createRatingBead } from '../../beads/index.js';
import { parseFrontmatter } from '../../frontmatter.js';
import * as fs from 'fs';
import * as path from 'path';
import { getProjectRoot } from '../../utils.js';

export const meta: HookMeta = {
  id: 'rating-capture',
  trigger: 'output:rated',
  intent: 'Capture output ratings as beads for quality tracking',
  guarantees: ['non-blocking', 'idempotent'],
  scope: {
    read: ['outputs/**/*.md'],
    write: ['.beads/insights.jsonl', 'outputs/audit/hook-log.md'],
  },
  userMessage: '📊 Rating recorded',
};

export async function run(ctx: HookContext): Promise<HookResult> {
  const payload = ctx.payload as OutputRatedPayload;
  const filesRead: string[] = [];
  const filesModified: string[] = [];

  try {
    const { filePath, rating, feedback } = payload;

    // 1. Validate rating
    if (rating < 1 || rating > 5) {
      return {
        success: false,
        error: `Invalid rating: ${rating}. Must be 1-5.`,
        filesRead,
        filesModified,
      };
    }

    // 2. Get skill name from file if possible
    let skillName = 'unknown';
    const root = getProjectRoot();
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(root, filePath);

    try {
      const content = await fs.promises.readFile(absolutePath, 'utf-8');
      filesRead.push(filePath);
      const { meta: frontmatter } = parseFrontmatter(content);
      if (frontmatter?.skill) {
        skillName = String(frontmatter.skill);
      }
    } catch {
      // Couldn't read file, use path to infer skill
      const pathParts = filePath.split('/');
      if (pathParts.includes('roadmap')) skillName = 'generating-quarterly-charters';
      else if (pathParts.includes('delivery')) skillName = 'writing-prds-from-charters';
      else if (pathParts.includes('insights')) skillName = 'synthesizing-voc';
      else if (pathParts.includes('ktlo')) skillName = 'triaging-ktlo';
      else if (pathParts.includes('strategy')) skillName = 'writing-product-strategy';
    }

    // 3. Create rating bead
    const bead = await createRatingBead(filePath, skillName, rating, feedback);
    filesModified.push('.beads/insights.jsonl');

    // 4. Log to audit
    await logHookComplete(
      meta.id,
      'output:rated',
      true,
      `Rating ${rating}/5 for ${skillName}`
    );

    // 5. Build confirmation
    const confirmation = `📊 Recorded rating: ${rating}/5 → .beads/insights.jsonl

Bead ID: ${bead.id}
Skill: ${skillName}
Sentiment: ${bead.sentiment}`;

    const output = formatContextInjection('output:rated', confirmation, 'rating-captured');

    return {
      success: true,
      contextInjection: JSON.stringify(output, null, 2),
      filesRead,
      filesModified,
    };
  } catch (error) {
    await logHookComplete(meta.id, 'output:rated', false, String(error));

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      filesRead,
      filesModified,
    };
  }
}

/**
 * Parse rating from user message
 *
 * Supports:
 * - Plain number: "5"
 * - Number with feedback: "4 - great work"
 * - Skip: "skip"
 */
export function parseRatingFromMessage(message: string): {
  rating: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
} | null {
  const trimmed = message.trim().toLowerCase();

  // Check for skip
  if (trimmed === 'skip' || trimmed.includes('skip')) {
    return null;
  }

  // Try to extract number
  const match = trimmed.match(/^(\d)\s*(?:[-–—]\s*(.+))?$/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 5) {
      return {
        rating: num as 1 | 2 | 3 | 4 | 5,
        feedback: match[2]?.trim(),
      };
    }
  }

  return null;
}

/**
 * Detect rating context in conversation
 *
 * Returns the output file being rated if a rating prompt is detected.
 */
export function detectRatingContext(assistantMessage: string): string | null {
  // Look for rating prompt pattern
  const patterns = [
    /✅\s+\w+(?:-\w+)*\s+complete\s*→\s*([^\n]+)/i,
    /Rate this (?:output|charter|prd|synthesis)[^→]*→\s*([^\n]+)/i,
    /Rate this output \(1-5[^)]*\):/i,
  ];

  for (const pattern of patterns) {
    const match = assistantMessage.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // If we see the rating prompt but no path, look for the most recent output
  if (assistantMessage.includes('Rate this output')) {
    const outputMatch = assistantMessage.match(/→\s*([^\n]+\.md)/);
    if (outputMatch) {
      return outputMatch[1].trim();
    }
  }

  return null;
}

// CLI execution
if (process.argv[1]?.endsWith('RatingCapture.hook.js')) {
  // Parse stdin for rating info
  let inputData = '';
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', chunk => inputData += chunk);
  process.stdin.on('end', async () => {
    try {
      const input = JSON.parse(inputData);
      const filePath = input.filePath || input.path || '';
      const rating = input.rating;
      const feedback = input.feedback;

      if (filePath && rating) {
        const { buildHookContext, createOutputRatedPayload } = await import('../lib/context.js');
        const ctx = buildHookContext(
          'output:rated',
          createOutputRatedPayload(filePath, rating, feedback)
        );
        const result = await run(ctx);
        if (result.contextInjection) {
          console.log(result.contextInjection);
        }
      }
    } catch {
      console.log('{}');
    }
  });
}

export const RatingCaptureHook: HookDefinition = { meta, run };
export default RatingCaptureHook;
