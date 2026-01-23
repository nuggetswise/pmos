/**
 * Context utilities for PM OS hooks
 *
 * Builds hook context and reads COMPASS files.
 */

import * as fs from 'fs';
import * as path from 'path';
import { getProjectRoot, isoNow } from '../../utils.js';
import type {
  HookContext,
  PMOSHookEvent,
  HookPayload,
  SessionStartupPayload,
  SessionShutdownPayload,
  SkillPayload,
  OutputCreatedPayload,
  OutputRatedPayload,
  DecisionLoggedPayload,
  ScheduledPayload,
} from '../types.js';

/**
 * COMPASS file paths
 */
export const COMPASS_FILES = {
  compass: 'inputs/context/compass.md',
  projects: 'inputs/context/projects.md',
  challenges: 'inputs/context/challenges.md',
  preferences: 'inputs/context/preferences.md',
} as const;

/**
 * Read a COMPASS file if it exists
 */
export async function readCompassFile(
  name: keyof typeof COMPASS_FILES
): Promise<string | null> {
  const root = getProjectRoot();
  const filePath = path.join(root, COMPASS_FILES[name]);

  try {
    return await fs.promises.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Read all COMPASS files
 */
export interface CompassContext {
  compass: string | null;
  projects: string | null;
  challenges: string | null;
  preferences: string | null;
}

export async function readAllCompassFiles(): Promise<CompassContext> {
  const [compass, projects, challenges, preferences] = await Promise.all([
    readCompassFile('compass'),
    readCompassFile('projects'),
    readCompassFile('challenges'),
    readCompassFile('preferences'),
  ]);

  return { compass, projects, challenges, preferences };
}

/**
 * Extract active work from projects.md
 *
 * Looks for a markdown table with columns: Initiative, Status, Next Milestone
 */
export function extractActiveWork(projectsContent: string | null): string[] {
  if (!projectsContent) return [];

  const lines = projectsContent.split('\n');
  const activeWork: string[] = [];

  // Look for table rows with "In Progress" or similar status
  for (const line of lines) {
    if (line.includes('|') && !line.includes('---')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 2) {
        const status = cells[1]?.toLowerCase() || '';
        if (
          status.includes('in progress') ||
          status.includes('active') ||
          status.includes('started')
        ) {
          activeWork.push(line.trim());
        }
      }
    }
  }

  return activeWork;
}

/**
 * Extract blockers from challenges.md
 */
export function extractBlockers(challengesContent: string | null): string[] {
  if (!challengesContent) return [];

  const lines = challengesContent.split('\n');
  const blockers: string[] = [];

  // Look for items marked as blockers
  let inBlockersSection = false;
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('blocker') || lowerLine.includes('## active')) {
      inBlockersSection = true;
      continue;
    }
    if (inBlockersSection && line.startsWith('#')) {
      inBlockersSection = false;
      continue;
    }
    if (inBlockersSection && line.trim().startsWith('-')) {
      blockers.push(line.trim().substring(1).trim());
    }
  }

  return blockers;
}

/**
 * Build hook context
 */
export function buildHookContext(
  event: PMOSHookEvent,
  payload: HookPayload
): HookContext {
  const root = getProjectRoot();

  return {
    event,
    timestamp: isoNow(),
    projectRoot: root,
    nexaDir: path.join(root, 'nexa'),
    payload,
    env: process.env,
  };
}

/**
 * Create payload for session:startup event
 */
export function createSessionStartupPayload(
  sessionId?: string,
  resuming?: boolean
): SessionStartupPayload {
  return {
    type: 'session:startup',
    sessionId,
    resuming,
  };
}

/**
 * Create payload for session:shutdown event
 */
export function createSessionShutdownPayload(
  sessionId?: string,
  reason?: 'explicit' | 'timeout' | 'error'
): SessionShutdownPayload {
  return {
    type: 'session:shutdown',
    sessionId,
    reason,
  };
}

/**
 * Create payload for skill events
 */
export function createSkillPayload(
  type: 'skill:started' | 'skill:completed',
  skillName: string,
  outputPath?: string,
  success?: boolean
): SkillPayload {
  return {
    type,
    skillName,
    outputPath,
    success,
  };
}

/**
 * Create payload for output:created event
 */
export function createOutputCreatedPayload(
  filePath: string,
  skillName?: string
): OutputCreatedPayload {
  return {
    type: 'output:created',
    filePath,
    skillName,
  };
}

/**
 * Create payload for output:rated event
 */
export function createOutputRatedPayload(
  filePath: string,
  rating: 1 | 2 | 3 | 4 | 5,
  feedback?: string
): OutputRatedPayload {
  return {
    type: 'output:rated',
    filePath,
    rating,
    feedback,
  };
}

/**
 * Create payload for decision:logged event
 */
export function createDecisionLoggedPayload(
  decisionPath: string,
  title: string
): DecisionLoggedPayload {
  return {
    type: 'decision:logged',
    decisionPath,
    title,
  };
}

/**
 * Create payload for scheduled events
 */
export function createScheduledPayload(
  type: 'time:daily' | 'time:weekly',
  lastRun?: string
): ScheduledPayload {
  return {
    type,
    lastRun,
  };
}
