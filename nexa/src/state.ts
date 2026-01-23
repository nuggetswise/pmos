/**
 * PM OS State Management
 *
 * Single source of truth for PM OS state.
 * All state is stored in nexa/state.json.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {
  State,
  Source,
  IngestEntry,
  Job,
  InputRule,
  ErrorEntry,
  JobType,
  SourcesConfig,
  InputRulesConfig,
  DaemonStatus,
  Brief,
  LastJob,
} from './types.js';
import { isoNow, getProjectRoot, __dirname } from './utils.js';

// Paths
const NEXA_DIR = path.resolve(__dirname, '..');
const STATE_FILE = path.join(NEXA_DIR, 'state.json');
const SOURCES_LOCAL = path.join(NEXA_DIR, 'sources.local.yaml');
const SOURCES_EXAMPLE = path.join(NEXA_DIR, 'sources.example.yaml');
const INPUT_RULES = path.join(NEXA_DIR, 'input-rules.yaml');

/**
 * Default initial state
 */
function defaultState(): State {
  return {
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
    errors: [],
    session_start_time: null,
  };
}

/**
 * Load state from disk
 */
export async function loadState(): Promise<State> {
  try {
    const data = await fs.promises.readFile(STATE_FILE, 'utf-8');
    return JSON.parse(data) as State;
  } catch {
    // Return default state if file doesn't exist
    return defaultState();
  }
}

/**
 * Save state to disk
 */
export async function saveState(state: State): Promise<void> {
  await fs.promises.writeFile(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

/**
 * Update specific fields in state
 */
export async function updateState(updates: Partial<State>): Promise<State> {
  const state = await loadState();
  const newState = { ...state, ...updates };
  await saveState(newState);
  return newState;
}

/**
 * Load sources configuration
 * Prefers sources.local.yaml if it exists, falls back to sources.example.yaml
 */
export async function loadSources(): Promise<SourcesConfig> {
  let configPath = SOURCES_LOCAL;

  try {
    await fs.promises.access(configPath);
  } catch {
    // Fall back to example config
    configPath = SOURCES_EXAMPLE;
  }

  const data = await fs.promises.readFile(configPath, 'utf-8');
  return yaml.load(data) as SourcesConfig;
}

/**
 * Load input routing rules
 */
export async function loadInputRules(): Promise<InputRulesConfig> {
  const data = await fs.promises.readFile(INPUT_RULES, 'utf-8');
  return yaml.load(data) as InputRulesConfig;
}

/**
 * Check if a file has already been ingested (by path and hash)
 */
export function isAlreadyIngested(state: State, sourcePath: string, hash: string): boolean {
  return state.ingest_index.some(
    (entry: IngestEntry) => entry.source_path === sourcePath && entry.content_hash === hash
  );
}

/**
 * Add an entry to the ingest index
 */
export async function addIngestEntry(entry: IngestEntry): Promise<void> {
  const state = await loadState();

  // Remove any existing entry for the same source path
  const filtered = state.ingest_index.filter((e: IngestEntry) => e.source_path !== entry.source_path);
  filtered.push(entry);

  state.ingest_index = filtered;
  await saveState(state);
}

/**
 * Set current job
 */
export async function setCurrentJob(
  jobType: JobType,
  jobId: string,
  inputs: string[]
): Promise<void> {
  const state = await loadState();
  state.current_job = {
    id: jobId,
    type: jobType,
    status: 'running',
    started_at: isoNow(),
    inputs,
  };
  await saveState(state);
}

/**
 * Complete current job
 */
export async function completeCurrentJob(success: boolean): Promise<void> {
  const state = await loadState();

  if (state.current_job) {
    state.last_job = {
      id: state.current_job.id,
      result: success ? 'ok' : 'failed',
      finished_at: isoNow(),
    };
  }

  state.current_job = null;
  await saveState(state);
}

/**
 * Update daemon status
 */
export async function updateDaemonStatus(
  status: 'running' | 'stopped' | 'error',
  pid?: number
): Promise<void> {
  const state = await loadState();
  state.daemon.status = status;

  if (status === 'running') {
    state.daemon.pid = pid || process.pid;
    state.daemon.started_at = state.daemon.started_at || isoNow();
    state.daemon.last_heartbeat_at = isoNow();
  } else if (status === 'stopped') {
    state.daemon.pid = null;
    state.daemon.started_at = null;
  }

  await saveState(state);
}

/**
 * Update daemon heartbeat
 */
export async function updateHeartbeat(): Promise<void> {
  const state = await loadState();
  state.daemon.last_heartbeat_at = isoNow();
  await saveState(state);
}

/**
 * Update brief
 */
export async function updateBrief(
  updates: Partial<{ top_themes: string[]; risk_flags: string[]; latest_delta: string }>
): Promise<void> {
  const state = await loadState();
  state.brief = { ...state.brief, ...updates };
  await saveState(state);
}

/**
 * Set next action
 */
export async function setNextAction(action: string): Promise<void> {
  const state = await loadState();
  state.next_action = action;
  await saveState(state);
}

/**
 * Get paths for output directories
 */
export function getOutputPaths() {
  const root = getProjectRoot();
  return {
    ingest: path.join(root, 'outputs', 'ingest'),
    audit: path.join(root, 'outputs', 'audit'),
    deltas: path.join(root, 'outputs', 'deltas'),
  };
}

/**
 * Log an error to state
 * Keeps last 50 errors to prevent unbounded growth
 */
export async function logError(entry: ErrorEntry): Promise<void> {
  const state = await loadState();
  state.errors = state.errors || [];
  state.errors.push(entry);

  // Keep last 50 errors
  if (state.errors.length > 50) {
    state.errors = state.errors.slice(-50);
  }

  await saveState(state);
}

/**
 * Find ingest entry by path and fingerprint (for two-stage hashing)
 */
export function findByPathAndFingerprint(
  state: State,
  sourcePath: string,
  fingerprint: string
): IngestEntry | undefined {
  return state.ingest_index.find(
    (entry: IngestEntry) => entry.source_path === sourcePath && entry.fingerprint === fingerprint
  );
}
