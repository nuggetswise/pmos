#!/usr/bin/env node
/**
 * Atomic State Operations
 *
 * Provides safe state updates using write-file-atomic + in-memory mutex
 * to prevent race conditions when multiple hooks update state.json
 *
 * PROBLEM: Multiple hooks calling updateState() can overwrite each other
 *   T1: Hook A reads state
 *   T2: Hook B reads state (stale)
 *   T3: Hook A writes state
 *   T4: Hook B writes state (overwrites A's changes)
 *
 * SOLUTION: Serialize all updates through AsyncMutex + atomic file writes
 */

import writeFileAtomic from 'write-file-atomic';
import fs from 'fs/promises';
import path from 'path';
import type { State } from '../../types.js';
import { getProjectRoot } from '../../utils.js';

function getStatePath(): string {
  return path.join(getProjectRoot(), 'nexa', 'state.json');
}

const STATE_FILE = getStatePath();

/**
 * In-memory mutex for serializing state updates
 * Prevents concurrent read-modify-write races
 */
class AsyncMutex {
  private locked = false;
  private queue: Array<() => void> = [];

  /**
   * Run function exclusively (wait for lock if held by another update)
   */
  async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    // Wait for lock if held by another update
    while (this.locked) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }

    // Acquire lock
    this.locked = true;
    try {
      // Execute critical section
      return await fn();
    } finally {
      // Release lock and wake next waiter
      this.locked = false;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

const stateMutex = new AsyncMutex();

/**
 * Load state from file
 */
async function loadState(): Promise<State> {
  try {
    const content = await fs.readFile(STATE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // File doesn't exist - return default state
    return {
      version: 1,
      daemon: { status: 'stopped', pid: null, last_heartbeat_at: null, started_at: null },
      phase: 'OBSERVE',
      current_job: null,
      brief: { top_themes: [], risk_flags: [], latest_delta: null },
      next_action: 'Run pm-os scan to scan for new documents',
      ingest_index: [],
      last_job: null,
      errors: [],
      session_start_time: null,
    };
  }
}

/**
 * Save state atomically (safe against crashes)
 *
 * Uses write-file-atomic which:
 * 1. Writes to temp file
 * 2. Atomically renames to target
 *
 * This prevents partial writes from corrupting state.json
 */
export async function saveStateAtomic(state: State): Promise<void> {
  const content = JSON.stringify(state, null, 2) + '\n';
  await writeFileAtomic(STATE_FILE, content);
}

/**
 * Update state atomically and safely
 *
 * Combines in-memory mutex with atomic file writes for full safety:
 * - Mutex prevents concurrent read-modify-write races
 * - write-file-atomic prevents partial writes from crashes
 *
 * Usage:
 * ```typescript
 * await updateStateAtomic(state => ({
 *   ...state,
 *   current_job: 'scanning'
 * }));
 * ```
 *
 * OLD (unsafe):
 * ```typescript
 * const state = await loadState();
 * state.current_job = 'scanning';
 * await saveState(state);
 * ```
 */
export async function updateStateAtomic(
  updater: (state: State) => State
): Promise<State> {
  return await stateMutex.runExclusive(async () => {
    // Read current state (inside critical section)
    const state = await loadState();

    // Apply updates (inside critical section)
    const newState = updater(state);

    // Write atomically (inside critical section)
    await saveStateAtomic(newState);

    return newState;
  });
}
