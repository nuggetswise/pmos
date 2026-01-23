#!/usr/bin/env node
/**
 * ============================================================
 * HOOK: EvidenceCheck
 * ============================================================
 * PURPOSE: Verify PM outputs include required evidence discipline
 *          elements (Sources Used, Claims Ledger).
 * TRIGGER: output:created (after Write to outputs/)
 *
 * INPUT:
 *   - filePath: Path to the created output file
 *   - Content of the file
 *
 * OUTPUT:
 *   - hookSpecificOutput: Warning if evidence requirements not met
 *
 * SIDE EFFECTS:
 *   - None (verification only)
 *
 * ERROR HANDLING:
 *   - Never blocks output creation
 *   - Graceful handling of non-markdown files
 *
 * INTER-HOOK RELATIONSHIPS:
 *   - Runs after output:created
 *   - May run before AutoMirror
 * ============================================================
 */

import * as fs from 'fs';
import * as path from 'path';
import type { HookDefinition, HookContext, HookResult, HookMeta, OutputCreatedPayload } from '../types.js';
import { formatContextInjection, logHookComplete } from '../lib/index.js';
import { getProjectRoot } from '../../utils.js';
import { parseFrontmatter } from '../../frontmatter.js';

export const meta: HookMeta = {
  id: 'evidence-check',
  trigger: 'output:created',
  intent: 'Verify PM outputs meet evidence discipline requirements',
  guarantees: ['non-blocking', 'read-only', 'idempotent'],
  scope: {
    read: ['outputs/**/*.md'],
    write: [],
  },
  userMessage: undefined, // Only shown if violations found
};

/**
 * Outputs that require evidence discipline
 */
const EVIDENCE_REQUIRED_PATHS = [
  'outputs/roadmap/',      // Charters
  'outputs/delivery/',     // PRDs
  'outputs/insights/',     // VOC synthesis
  'outputs/ktlo/',         // KTLO triage
  'outputs/strategy/',     // Strategy
  'outputs/stakeholders/', // Stakeholder analysis
  'outputs/gtm/',          // GTM plans
  'outputs/truth_base/',   // Truth base
  'outputs/decisions/',    // Decision logs
];

/**
 * Evidence requirements
 */
interface EvidenceRequirement {
  name: string;
  check: (content: string) => boolean;
  message: string;
}

const EVIDENCE_REQUIREMENTS: EvidenceRequirement[] = [
  {
    name: 'YAML Frontmatter',
    check: (content) => content.startsWith('---') && content.indexOf('---', 3) > 0,
    message: 'Output must include YAML frontmatter with generated, skill, and sources fields.',
  },
  {
    name: 'Sources Used',
    check: (content) => {
      const lower = content.toLowerCase();
      return lower.includes('## sources used') || lower.includes('### sources used') ||
             lower.includes('sources:') || lower.includes('**sources:**');
    },
    message: 'Output must include a "Sources Used" section listing input files.',
  },
  {
    name: 'Claims Ledger',
    check: (content) => {
      const lower = content.toLowerCase();
      return lower.includes('## claims ledger') || lower.includes('### claims ledger') ||
             lower.includes('| claim |');
    },
    message: 'Output must include a "Claims Ledger" table with tagged claims.',
  },
  {
    name: 'Generated Timestamp',
    check: (content) => {
      const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) return false;
      return /generated:\s*\d{4}-\d{2}-\d{2}/.test(frontmatterMatch[1]);
    },
    message: 'Frontmatter must include "generated" timestamp.',
  },
  {
    name: 'Skill Attribution',
    check: (content) => {
      const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) return false;
      return /skill:\s*\S+/.test(frontmatterMatch[1]);
    },
    message: 'Frontmatter must include "skill" attribution.',
  },
];

export async function run(ctx: HookContext): Promise<HookResult> {
  const payload = ctx.payload as OutputCreatedPayload;
  const filesRead: string[] = [];

  try {
    const filePath = payload.filePath;

    // 1. Check if this output requires evidence
    if (!requiresEvidence(filePath)) {
      return { success: true, filesRead };
    }

    // 2. Read the file
    const root = getProjectRoot();
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(root, filePath);

    let content: string;
    try {
      content = await fs.promises.readFile(absolutePath, 'utf-8');
      filesRead.push(filePath);
    } catch {
      // File doesn't exist yet or can't be read
      return { success: true, filesRead };
    }

    // 3. Check evidence requirements
    const violations = checkEvidenceRequirements(content);

    // 4. If no violations, success
    if (violations.length === 0) {
      await logHookComplete(meta.id, 'output:created', true, 'Evidence check passed');
      return { success: true, filesRead };
    }

    // 5. Build warning
    const warning = buildEvidenceWarning(filePath, violations);
    const output = formatContextInjection('output:created', warning, 'evidence-warning');

    await logHookComplete(
      meta.id,
      'output:created',
      true,
      `${violations.length} evidence violations for ${filePath}`
    );

    return {
      success: true, // Still success - we don't block
      contextInjection: JSON.stringify(output, null, 2),
      filesRead,
    };
  } catch (error) {
    return {
      success: true, // Never block on errors
      error: error instanceof Error ? error.message : String(error),
      filesRead,
    };
  }
}

/**
 * Check if a path requires evidence discipline
 */
function requiresEvidence(filePath: string): boolean {
  // Normalize path
  const normalizedPath = filePath.replace(/\\/g, '/');

  // Check against required paths
  for (const requiredPath of EVIDENCE_REQUIRED_PATHS) {
    if (normalizedPath.includes(requiredPath)) {
      return true;
    }
  }

  return false;
}

/**
 * Check content against evidence requirements
 */
function checkEvidenceRequirements(content: string): EvidenceRequirement[] {
  const violations: EvidenceRequirement[] = [];

  for (const requirement of EVIDENCE_REQUIREMENTS) {
    if (!requirement.check(content)) {
      violations.push(requirement);
    }
  }

  return violations;
}

/**
 * Build evidence warning message
 */
function buildEvidenceWarning(
  filePath: string,
  violations: EvidenceRequirement[]
): string {
  const violationList = violations
    .map(v => `- **${v.name}:** ${v.message}`)
    .join('\n');

  return `⚠️ **Evidence Discipline Check**

Output: \`${filePath}\`

Missing requirements:
${violationList}

Per PM OS evidence rules (.claude/rules/pm-core/evidence-rules.md):
- Every PM output must include Sources Used and Claims Ledger
- Every claim must be tagged as Evidence, Assumption, or Open Question
- YAML frontmatter must include generated timestamp and skill attribution

Consider updating the output to meet these requirements.`;
}

/**
 * Validate content meets evidence requirements
 */
export function validateEvidence(content: string): {
  valid: boolean;
  violations: string[];
} {
  const violations = checkEvidenceRequirements(content);
  return {
    valid: violations.length === 0,
    violations: violations.map(v => v.name),
  };
}

/**
 * Get evidence score (0-5 based on requirements met)
 */
export function getEvidenceScore(content: string): number {
  const violations = checkEvidenceRequirements(content);
  return EVIDENCE_REQUIREMENTS.length - violations.length;
}

// CLI execution
if (process.argv[1]?.endsWith('EvidenceCheck.hook.js')) {
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
      console.log('{}');
    }
  });
}

export const EvidenceCheckHook: HookDefinition = { meta, run };
export default EvidenceCheckHook;
