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
 *   summarize-session - Generate a draft session summary
 *   session-start - Record the start of a session
 *   init    - Initialize state.json
 */

import { loadState, updateState, setNextAction, setCurrentJob, completeCurrentJob, logError } from './state.js';
import { getFilesToProcess } from './scanner.js';
import { ingestFiles } from './ingest.js';
import { startWatch } from './watch.js';
import { relativeTime, truncate, generateJobId, isoNow } from './utils.js';
import { runSearch } from './search.js';
import { mirrorOutputsToHistory } from './mirror.js';
import { runLearning, runLearningAuto } from './learn.js';
import { runPatternLearning } from './pattern-learning.js';
import { summarizeSession } from './summarize.js';
import { createInsightBead, createDecisionBead } from './beads/index.js';
import { render } from 'ink';
import React from 'react';
import App from './ui.js';
import { Analyzer } from './skills/index.js';
import * as path from 'path';
import { getProjectRoot } from './utils.js';

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

    case 'learn:patterns':
      await runLearnPatterns();
      break;

    case 'summarize-session':
      await runSummarize();
      break;

    case 'session-start':
      await runSessionStart();
      break;

    case 'init':
      await initState();
      break;

    case 'beads-create':
      await runBeadsCreate(args.slice(1));
      break;

    case 'ui':
      await runUi();
      break;

    case 'pilot-analyzer':
      await runPilotAnalyzer();
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
 * Temporary pilot for the Analyzer skill runner
 */
async function runPilotAnalyzer(): Promise<void> {
  console.log('--- Running Analyzer Pilot ---');
  const analyzer = new Analyzer();
  
  // Correctly resolve path from project root
  const projectRoot = getProjectRoot();
  const skillPath = path.join(projectRoot, 'skills', 'synthesize-customer-voice', 'SKILL.md');
  const inputs = [
    path.join(projectRoot, 'inputs', 'voc', 'interview-1.md'),
    path.join(projectRoot, 'inputs', 'voc', 'interview-2.md'),
    path.join(projectRoot, 'inputs', 'voc', 'interview-3.md'),
  ];

  try {
    // In the future, this will trigger the full AI execution loop.
    // For now, it prepares the context and returns it.
    const contextForAi = await analyzer.run(skillPath, inputs);
    console.log('\n--- Context for AI ---');
    console.log(contextForAi);
    console.log('--- End of Context ---');
    console.log('\n--- Analyzer Pilot Finished Successfully ---');
  } catch (error) {
    console.error('--- Analyzer Pilot Failed ---', error);
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
 * Run pattern learning analysis
 * Works with 0-N beads - graceful degradation
 */
async function runLearnPatterns(): Promise<void> {
  const jobId = generateJobId('learn-patterns');
  await setCurrentJob('learn-patterns', jobId, ['beads']);

  try {
    console.log('PM OS Pattern Learning\n');
    console.log('Analyzing beads for patterns...\n');

    const result = await runPatternLearning();

    console.log(`Total beads: ${result.totalBeads}`);
    console.log(`Total ratings: ${result.totalRatings}`);
    console.log(`Patterns found: ${result.patternsFound}`);
    console.log(`Confidence: ${result.confidence}`);

    if (result.qualityTrend) {
      const trendSymbol = result.qualityTrend.trend === 'up' ? '↑' :
                          result.qualityTrend.trend === 'down' ? '↓' : '→';
      console.log(`Quality trend: ${result.qualityTrend.average.toFixed(1)}/5 ${trendSymbol} (${result.qualityTrend.ratingCount} ratings)`);
    }

    console.log(`\n${result.message}`);

    if (result.patterns.length > 0) {
      console.log('\nPatterns written to: .claude/rules/learned/quality-patterns.md');
    }

    await completeCurrentJob(true);
    await setNextAction('Review learned patterns in .claude/rules/learned/quality-patterns.md');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await logError({
      timestamp: isoNow(),
      job_id: jobId,
      source_path: '.beads/insights.jsonl',
      error_message: errorMsg,
    });
    await completeCurrentJob(false);
    throw error;
  }
}

async function runSummarize(): Promise<void> {
  const jobId = generateJobId('summarize');
  await setCurrentJob('summarize', jobId, ['session']);
  try {
    await summarizeSession(jobId);
    await completeCurrentJob(true);
    await setNextAction('Review draft session summary in history/sessions/');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await logError({
      timestamp: isoNow(),
      job_id: jobId,
      source_path: 'session',
      error_message: errorMsg,
    });
    await completeCurrentJob(false);
    throw error;
  }
}

async function runSessionStart(): Promise<void> {
  await updateState({ session_start_time: isoNow() });
  console.log(`Session start time recorded: ${isoNow()}`);
}

async function runUi(): Promise<void> {
  const { waitUntilExit } = render(React.createElement(App));
  await waitUntilExit();
}

/**
 * Run beads-create command
 */
async function runBeadsCreate(args: string[]): Promise<void> {
  const jsonString = args.join(' ');
  if (!jsonString) {
    console.error('Usage: pm-os beads-create <json-string>');
    return;
  }

  try {
    const beads = JSON.parse(jsonString);
    for (const bead of beads) {
      if (bead.type === 'insight') {
        await createInsightBead(bead.content, 'claude-insight');
      } else if (bead.type === 'decision') {
        await createDecisionBead(bead.content, 'claude-decision', '');
      }
    }
    console.log(`Successfully created ${beads.length} beads.`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await logError({
      timestamp: isoNow(),
      job_id: generateJobId('beads-create'),
      source_path: 'stdin',
      error_message: `Failed to create beads: ${errorMsg}`,
    });
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
  scan           Scan sources and ingest new documents
  status         Show current state (5-line brief)
  watch          Start background watch mode
  search         Search filenames/paths and full text
  mirror         Copy outputs to history/
  learn          Analyze history and write learned rules
  learn:patterns Analyze beads for quality patterns (works with 0-N beads)
  summarize-session  Generate a draft session summary
  session-start  Record the start of a session
  init           Initialize state.json
  beads-create   Create beads from a JSON string
  ui             Launch the interactive TUI
  help           Show this help message

Examples:
  pm-os scan      # Scan and process new documents
  pm-os status    # Check current status
  pm-os beads-create '[{"type": "insight", "content": "example"}]'
  pm-os watch     # Start watching for changes
  pm-os search "pricing friction"  # Search ingested text and history
  pm-os mirror    # Mirror outputs to history/
  pm-os learn synthesizing-voc  # Learn patterns from history
  pm-os learn --auto            # Run weekly learning across skills
  pm-os summarize-session       # Create a draft summary of the session

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
