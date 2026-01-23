
import { exec } from 'child_process';
import * as path from 'path';

const GOODBYE_REGEX = /\b(goodbye|bye|see you|done for (today|now)|that.s (all|it)|end session|log off|sign off)\b/i;

interface UserPromptInput {
  prompt?: string;
  content?: string;
}

interface ClaudeHookOutput {
  hookSpecificOutput?: {
    hookEventName: string;
    additionalContext: string;
  };
}

async function main() {
  const input = await readStdin();
  const data: UserPromptInput = JSON.parse(input);

  const userPrompt = (data.prompt || data.content || '').toLowerCase();

  if (GOODBYE_REGEX.test(userPrompt)) {
    const projectRoot = process.env.CLAUDE_PROJECT_DIR || path.join(__dirname, '..', '..', '..', '..');
    const summaryOutput = await runSummary(projectRoot);
    const summaryFile = parseSummaryOutput(summaryOutput);

    const output: ClaudeHookOutput = {
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: buildAdditionalContext(summaryFile),
      },
    };
    console.log(JSON.stringify(output, null, 2));
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let result = '';
    process.stdin.on('data', (chunk) => {
      result += chunk.toString();
    });
    process.stdin.on('end', () => {
      resolve(result);
    });
  });
}

function runSummary(projectRoot: string): Promise<string> {
  const command = `node ${path.join(projectRoot, 'nexa', 'dist', 'index.js')} summarize-session`;
  return new Promise((resolve) => {
    exec(command, { cwd: projectRoot }, (error, stdout, stderr) => {
      if (error) {
        // Log error but resolve with stdout/stderr to let the parsing attempt it
        console.error(`Error running summarize-session: ${error.message}`);
        resolve(stdout + stderr);
        return;
      }
      resolve(stdout);
    });
  });
}

function parseSummaryOutput(output: string): string | null {
  const match = output.match(/history\/sessions\/[^ ]+/);
  return match ? match[0] : null;
}

function buildAdditionalContext(summaryFile: string | null): string {
  if (summaryFile) {
    return `<session-end-detected>Session end detected. A draft summary was created at ${summaryFile}.

CRITICAL RULES FOR FILLING IN THE SUMMARY:
1. ONLY fill in sections where you have ACTUAL data from THIS session
2. For 'Outputs Created' - ONLY list files YOU actually created/modified this session
3. For 'Skills Executed' - ONLY list skills YOU actually ran (e.g., /charters, /prd)
4. For 'Key Decisions Made' - ONLY decisions explicitly discussed this session
5. For 'Open Items' - ONLY items that emerged from THIS session's work
6. DO NOT pull generic data from projects.md, challenges.md, or other COMPASS context files
7. If you don't have specific data for a section, write '(No data from this session)' - do NOT infer

ACTION REQUIRED: You MUST use the Read tool to read ${summaryFile}, then use the Edit tool to fill in the AI sections with actual session data, then acknowledge the session end.</session-end-detected>`;
  } else {
    return `<session-end-detected>Session end detected. Complete any pending capture and acknowledge the session end to the user.</session-end-detected>`;
  }
}

main().catch(err => {
  console.error('Hook failed:', err);
  process.exit(1); // Exit with error code if something goes wrong
});
