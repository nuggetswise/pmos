/**
 * Output utilities for PM OS hooks
 *
 * Formats hook output for Claude Code consumption.
 */

import type { ClaudeHookOutput, HookResult } from '../types.js';

/**
 * Format context injection for Claude Code hooks
 *
 * Wraps content in a tag and creates the JSON output structure.
 */
export function formatContextInjection(
  eventName: string,
  content: string,
  tag?: string
): ClaudeHookOutput {
  const tagName = tag || eventName.replace(':', '-');
  const wrappedContent = `<${tagName}>\n${content}\n</${tagName}>`;

  return {
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext: wrappedContent,
    },
  };
}

/**
 * Format important context (wrapped in EXTREMELY_IMPORTANT tags)
 */
export function formatImportantContext(
  eventName: string,
  content: string
): ClaudeHookOutput {
  const wrappedContent = `<EXTREMELY_IMPORTANT>\n${content}\n</EXTREMELY_IMPORTANT>`;

  return {
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext: wrappedContent,
    },
  };
}

/**
 * Format hook result as JSON string for stdout
 */
export function formatHookOutput(result: HookResult): string {
  if (!result.contextInjection) {
    return '{}';
  }

  // Context injection should already be a ClaudeHookOutput-compatible string
  // or we need to wrap it
  try {
    // Try parsing as JSON first
    JSON.parse(result.contextInjection);
    return result.contextInjection;
  } catch {
    // Wrap raw content in standard format
    const output: ClaudeHookOutput = {
      hookSpecificOutput: {
        hookEventName: 'hook',
        additionalContext: result.contextInjection,
      },
    };
    return JSON.stringify(output, null, 2);
  }
}

/**
 * Create empty hook output (no context injection)
 */
export function createEmptyOutput(): string {
  return '{}';
}

/**
 * Escape string for JSON embedding
 */
export function escapeForJson(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Build session greeting block
 */
export interface GreetingData {
  phase: string;
  nextAction: string;
  lastJobId: string;
  lastJobResult: string;
  lastJobFinished: string;
  ingestCount: number;
  errorCount: number;
  recentSource: string | null;
  qualityTrend: string;
  activeWork: string[];
  blockers: string[];
  compassLoaded: number;
}

export function buildGreetingBlock(data: GreetingData): string {
  const recentSourceDisplay = data.recentSource || '*(none)*';
  const activeWorkDisplay = data.activeWork.length > 0
    ? data.activeWork.join('\n')
    : '*(No active work tracked)*';
  const blockersDisplay = data.blockers.length > 0
    ? data.blockers.join(', ')
    : '(none)';

  return `You are Nexa, operating PM OS. At session start, greet the user with the runtime state from nexa/state.json.

**YOUR CONTEXT IS LOADED - Use it to inform EVERY response:**

## Runtime State
Phase: ${data.phase}
Next Action: ${data.nextAction}
Last Job: ${data.lastJobId} (${data.lastJobResult})
Last Finished: ${data.lastJobFinished}
Ingested Sources: ${data.ingestCount}
Errors: ${data.errorCount}
Recent Source: ${recentSourceDisplay}

---

**MANDATORY GREETING - YOUR FIRST OUTPUT MUST BE:**

\`\`\`
👋 Nexa here - PM OS ready.

📚 Loaded: ${data.compassLoaded} context dimensions

📈 Output Quality: ${data.qualityTrend}

🔄 Phase: ${data.phase}
👉 Next: ${data.nextAction}

🧾 Last Job: ${data.lastJobId} (${data.lastJobResult})
🕒 Finished: ${data.lastJobFinished}

📥 Ingested Sources: ${data.ingestCount}
⚠️ Errors: ${data.errorCount}
📄 Latest Source: ${recentSourceDisplay}

🔥 Active Work:
${activeWorkDisplay}

⚠️ Needs Attention:
   Blockers: ${blockersDisplay}

Ready for your request.
\`\`\`

**ABSOLUTE REQUIREMENT:** You MUST output this greeting BEFORE doing anything else. Even if the user's first message is an action request, you output the greeting FIRST, then address their request. No exceptions. This is not optional.`;
}

/**
 * Build session protocol reminder
 */
export function buildSessionProtocol(): string {
  return `BEFORE responding to user requests, you MUST:
1. Read nexa/state.json
2. If current_job is running, report status and ask whether to wait or proceed
3. If last job failed, call out the error and suggest pm-os scan
4. Then proceed with the user's request`;
}

/**
 * Build post-skill reflection signal
 */
export function buildPostSkillSignal(skillName: string, outputPath: string): string {
  return `Skill '${skillName}' completed.
Output at ${outputPath}.

**MANDATORY:** Run post-skill reflection protocol per .claude/rules/pm-core/post-skill-reflection.md:

1. Extract 3-5 key learnings from this work
2. Create learning entry in history/learnings/
3. Create insight beads in .beads/insights.jsonl
4. Request user rating (1-5) for this output
5. Detect and log any decisions made

This is NON-NEGOTIABLE for PLAN/BUILD phase skills.`;
}

/**
 * Build session end signal
 */
export function buildSessionEndSignal(summaryPath: string | null): string {
  if (summaryPath) {
    return `Session end detected. A draft summary was created at ${summaryPath}.

CRITICAL RULES FOR FILLING IN THE SUMMARY:
1. ONLY fill in sections where you have ACTUAL data from THIS session
2. For 'Outputs Created' - ONLY list files YOU actually created/modified this session
3. For 'Skills Executed' - ONLY list skills YOU actually ran (e.g., /charters, /prd)
4. For 'Key Decisions Made' - ONLY decisions explicitly discussed this session
5. For 'Open Items' - ONLY items that emerged from THIS session's work
6. DO NOT pull generic data from projects.md, challenges.md, or other COMPASS context files
7. If you don't have specific data for a section, write '(No data from this session)' - do NOT infer

ACTION REQUIRED: You MUST use the Read tool to read ${summaryPath}, then use the Edit tool to fill in the AI sections with actual session data, then acknowledge the session end.`;
  }

  return 'Session end detected. Complete any pending capture and acknowledge the session end to the user.';
}

/**
 * Build auto-mirror notification
 */
export function buildAutoMirrorNotification(
  sourcePath: string,
  destPath: string
): string {
  return `📁 Mirrored: ${sourcePath} → ${destPath}`;
}

/**
 * Build rating capture prompt
 */
export function buildRatingPrompt(outputPath: string, outputType: string): string {
  return `✅ ${outputType} complete → ${outputPath}

Rate this output (1-5, or 'skip'):
1 - Needs major revision
2 - Below expectations
3 - Meets expectations
4 - Exceeds expectations
5 - Outstanding, exactly what I needed

Your rating:`;
}
