/**
 * State utilities for PM OS hooks
 *
 * Provides read/write access to nexa/state.json for hook operations.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { State, JobType } from '../../types.js';
import { getProjectRoot, isoNow } from '../../utils.js';

/**
 * Get path to state file
 */
export function getStatePath(): string {
  const root = getProjectRoot();
  return path.join(root, 'nexa', 'state.json');
}

/**
 * Default state when no state file exists
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
 * Load state from disk (synchronous for hook use)
 */
export function loadStateSync(): State {
  const statePath = getStatePath();
  try {
    const data = fs.readFileSync(statePath, 'utf-8');
    return JSON.parse(data) as State;
  } catch {
    return defaultState();
  }
}

/**
 * Load state from disk (async)
 */
export async function loadState(): Promise<State> {
  const statePath = getStatePath();
  try {
    const data = await fs.promises.readFile(statePath, 'utf-8');
    return JSON.parse(data) as State;
  } catch {
    return defaultState();
  }
}

/**
 * Save state to disk
 */
export async function saveState(state: State): Promise<void> {
  const statePath = getStatePath();
  await fs.promises.writeFile(statePath, JSON.stringify(state, null, 2) + '\n');
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
 * Set session start time
 */
export async function setSessionStartTime(): Promise<void> {
  await updateState({ session_start_time: isoNow() });
}

/**
 * Clear session start time
 */
export async function clearSessionStartTime(): Promise<void> {
  await updateState({ session_start_time: null });
}

/**
 * Get session duration in minutes
 */
export function getSessionDuration(state: State): number | null {
  if (!state.session_start_time) return null;
  const start = new Date(state.session_start_time);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / 60000);
}

/**
 * Update next action
 */
export async function setNextAction(action: string): Promise<void> {
  await updateState({ next_action: action });
}

/**
 * Update last job
 */
export async function updateLastJob(
  jobId: string,
  result: 'ok' | 'failed'
): Promise<void> {
  const state = await loadState();
  state.last_job = {
    id: jobId,
    result,
    finished_at: isoNow(),
  };
  state.current_job = null;
  await saveState(state);
}

/**
 * Get status summary for greeting
 */
export interface StatusSummary {
  phase: string;
  nextAction: string;
  lastJobId: string;
  lastJobResult: string;
  lastJobFinished: string;
  ingestCount: number;
  errorCount: number;
  recentSource: string | null;
  sessionStartTime: string | null;
  daemonStatus: string;
}

export function getStatusSummary(state: State): StatusSummary {
  const lastJob = state.last_job;
  const ingestIndex = state.ingest_index || [];
  const recentSource = ingestIndex.length > 0
    ? ingestIndex[ingestIndex.length - 1].source_path
    : null;

  return {
    phase: state.phase || 'OBSERVE',
    nextAction: state.next_action || "Run 'pm-os scan' to scan for new documents",
    lastJobId: lastJob?.id || 'none',
    lastJobResult: lastJob?.result || 'n/a',
    lastJobFinished: lastJob?.finished_at || 'n/a',
    ingestCount: ingestIndex.length,
    errorCount: (state.errors || []).length,
    recentSource,
    sessionStartTime: state.session_start_time,
    daemonStatus: state.daemon?.status || 'stopped',
  };
}
