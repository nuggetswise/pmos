#!/usr/bin/env node

/**
 * PM OS CLI
 *
 * Commands:
 *   scan    - Scan sources and ingest new documents
 *   status  - Show current state (5-line brief)
 *   watch   - Start background watch mode
 *   search  - Search filenames/paths and full text
 *   mirror  - Copy outputs to history/
 *   learn   - Analyze history and write learned rules
 *   init    - Initialize state.json
 */

import { loadState, updateState, setNextAction, setCurrentJob, completeCurrentJob, logError } from './state';
import { getFilesToProcess } from './scanner';
import { ingestFiles } from './ingest';
import { startWatch } from './watch';
import { relativeTime, truncate, generateJobId, isoNow } from './utils';
import { runSearch } from './search';
import { mirrorOutputsToHistory } from './mirror';
import { runLearning, runLearningAuto } from './learn';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';

  switch (command) {
    case 'scan':
      await runScan();
      break;

    case 'status':
      await printStatus();
      break;

    case 'watch':
      await startWatch();
      break;

    case 'search':
      await runSearch(args.slice(1).join(' '));
      break;

    case 'mirror':
      const quietMode = args.includes('--quiet');
      await runMirror(quietMode);
      break;

    case 'learn':
      await runLearn(args.slice(1));
      break;

    case 'init':
      await initState();
      break;

    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

/**
 * Run scan command
 */
async function runScan(): Promise<void> {
  console.log('PM OS Scan\n');

  // Get files to process
  const files = await getFilesToProcess();

  if (files.length === 0) {
    console.log('No new files to process.');
    await setNextAction('All sources up to date. Add new documents or check sources.yaml');
    return;
  }

  // Ingest files
  console.log(`\nProcessing ${files.length} file(s)...\n`);
  const result = await ingestFiles(files);

  console.log(`\nComplete: ${result.success} succeeded, ${result.failed} failed`);

  // Update next action
  if (result.failed > 0) {
    await setNextAction(`Review ${result.failed} failed extraction(s) in outputs/audit/auto-run-log.md`);
  } else {
    await setNextAction('Run skills to analyze ingested content (e.g., synthesizing-voc)');
  }
}

async function runMirror(quiet: boolean = false): Promise<void> {
  const jobId = generateJobId('mirror');
  await setCurrentJob('mirror', jobId, ['outputs']);

  try {
    const result = await mirrorOutputsToHistory(jobId);

    if (!quiet) {
      console.log(`Mirrored: ${result.mirrored}, skipped: ${result.skipped}`);
      if (result.warnings.length > 0) {
        console.log('Warnings:');
        for (const warning of result.warnings.slice(0, 5)) {
          console.log(`- ${warning}`);
        }
        if (result.warnings.length > 5) {
          console.log(`- +${result.warnings.length - 5} more`);
        }
      }
    }

    await completeCurrentJob(true);
    if (!quiet) {
      await setNextAction('Run pm-os learn <skill> to refresh learned patterns');
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await logError({
      timestamp: isoNow(),
      job_id: jobId,
      source_path: 'outputs',
      error_message: errorMsg,
    });
    await completeCurrentJob(false);
    throw error;
  }
}

async function runLearn(args: string[]): Promise<void> {
  const hasAuto = args.includes('--auto');
  const skill = args.filter((arg) => arg !== '--auto').join(' ').trim();

  if (hasAuto) {
    const jobId = generateJobId('learn');
    await setCurrentJob('learn', jobId, ['auto']);

    try {
      const result = await runLearningAuto();
      console.log(`Auto-learn: ${result.processed} processed, ${result.skipped} skipped`);
      await completeCurrentJob(true);
      await setNextAction('Review learned rules in .claude/rules/learned/');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await logError({
        timestamp: isoNow(),
        job_id: jobId,
        source_path: 'history',
        error_message: errorMsg,
      });
      await completeCurrentJob(false);
      throw error;
    }

    return;
  }

  if (!skill) {
    console.error('Usage: pm-os learn <skill-name>');
    return;
  }

  const jobId = generateJobId('learn');
  await setCurrentJob('learn', jobId, [skill]);

  try {
    await runLearning(skill, jobId);
    await completeCurrentJob(true);
    await setNextAction('Review learned rules in .claude/rules/learned/');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await logError({
      timestamp: isoNow(),
      job_id: jobId,
      source_path: `history/${skill}`,
      error_message: errorMsg,
    });
    await completeCurrentJob(false);
    throw error;
  }
}

/**
 * Print status (5-line brief)
 */
async function printStatus(): Promise<void> {
  const state = await loadState();

  const daemonStatus =
    state.daemon.status === 'running'
      ? `running (hb: ${relativeTime(state.daemon.last_heartbeat_at)})`
      : state.daemon.status;

  const currentJob = state.current_job
    ? `${state.current_job.type} (${state.current_job.status})`
    : 'idle';

  const latestDelta = state.brief.latest_delta
    ? truncate(state.brief.latest_delta, 50)
    : 'none';

  console.log(`Daemon: ${daemonStatus}`);
  console.log(`Mode: ${state.phase}`);
  console.log(`Current: ${currentJob}`);
  console.log(`Latest: ${latestDelta}`);
  console.log(`Next: ${state.next_action}`);
}

/**
 * Initialize state
 */
async function initState(): Promise<void> {
  console.log('Initializing PM OS state...');

  await updateState({
    version: 1,
    daemon: {
      status: 'stopped',
      pid: null,
      last_heartbeat_at: null,
      started_at: null,
    },
    phase: 'OBSERVE',
    current_job: null,
    brief: {
      top_themes: [],
      risk_flags: [],
      latest_delta: null,
    },
    next_action: "Run 'pm-os scan' to scan for new documents",
    ingest_index: [],
    last_job: null,
  });

  console.log('State initialized.');
}

/**
 * Print help
 */
function printHelp(): void {
  console.log(`
PM OS CLI - Document scanning, extraction, and state management

Usage: pm-os <command>

Commands:
  scan      Scan sources and ingest new documents
  status    Show current state (5-line brief)
  watch     Start background watch mode
  search    Search filenames/paths and full text
  mirror    Copy outputs to history/
  learn     Analyze history and write learned rules
  init      Initialize state.json
  help      Show this help message

Examples:
  pm-os scan      # Scan and process new documents
  pm-os status    # Check current status
  pm-os watch     # Start watching for changes
  pm-os search "pricing friction"  # Search ingested text and history
  pm-os mirror    # Mirror outputs to history/
  pm-os learn synthesizing-voc  # Learn patterns from history
  pm-os learn --auto            # Run weekly learning across skills

Configuration:
  Copy nexa/sources.example.yaml to nexa/sources.local.yaml
  and customize for your environment.
`);
}

// Run main
main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
