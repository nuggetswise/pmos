/**
 * Beads Repository for PM OS
 *
 * Manages atomic insights in .beads/insights.jsonl
 */

import * as fs from 'fs';
import * as path from 'path';
import { getProjectRoot, isoNow, ensureDir } from '../utils.js';
import type { Bead, BeadType } from './types.js';
import { appendBeadSafe as appendBeadSafeInternal } from './bead-append-safe.js';
import { readBeadsSafe } from './bead-reader.js';

/**
 * Get path to beads file
 */
export function getBeadsPath(): string {
  const root = getProjectRoot();
  return path.join(root, '.beads', 'insights.jsonl');
}

/**
 * Get path to beads directory
 */
export function getBeadsDir(): string {
  const root = getProjectRoot();
  return path.join(root, '.beads');
}

/**
 * Generate unique bead ID
 */
export function generateBeadId(): string {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(0, 14);
  const random = Math.random().toString(36).substring(2, 5);
  return `bead_${timestamp}_${random}`;
}

/**
 * Ensure beads directory exists
 */
export async function ensureBeadsDir(): Promise<void> {
  await ensureDir(getBeadsDir());
}

/**
 * Append a bead to the insights file (SAFE - uses file locking)
 *
 * Delegates to appendBeadSafe from bead-append-safe.ts for concurrent write safety
 */
export async function appendBead(bead: Bead): Promise<void> {
  await appendBeadSafeInternal(bead);
}

/**
 * Create and append an output rating bead
 */
export async function createRatingBead(
  outputFile: string,
  skillName: string,
  rating: 1 | 2 | 3 | 4 | 5,
  feedback?: string
): Promise<Bead> {
  const sentiment = rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';

  const bead: Bead = {
    id: generateBeadId(),
    type: 'output-rating',
    content: feedback || '',
    source: skillName,
    output_file: outputFile,
    rating,
    sentiment,
    tags: [skillName, `quality-${rating}`],
    created_at: isoNow(),
    connections: [],
  };

  await appendBead(bead);
  return bead;
}

/**
 * Create and append an insight bead
 */
export async function createInsightBead(
  content: string,
  source: string,
  tags: string[] = [],
  confidence: 'high' | 'medium' | 'low' = 'medium',
  connections: string[] = []
): Promise<Bead> {
  const bead: Bead = {
    id: generateBeadId(),
    type: 'insight',
    content,
    source,
    tags,
    confidence,
    connections,
    created_at: isoNow(),
  };

  await appendBead(bead);
  return bead;
}

/**
 * Create and append a decision bead
 */
export async function createDecisionBead(
  content: string,
  source: string,
  decisionPath: string,
  tags: string[] = []
): Promise<Bead> {
  const bead: Bead = {
    id: generateBeadId(),
    type: 'decision',
    content,
    source,
    output_file: decisionPath,
    tags: ['decision', ...tags],
    confidence: 'high',
    connections: [],
    created_at: isoNow(),
  };

  await appendBead(bead);
  return bead;
}

/**
 * Read all beads from the file (safe - skips corrupted lines)
 */
export async function readAllBeads(): Promise<Bead[]> {
  const result = await readBeadsSafe();
  return result.beads;
}

/**
 * Read beads of a specific type
 */
export async function readBeadsByType(type: BeadType): Promise<Bead[]> {
  const beads = await readAllBeads();
  return beads.filter(b => b.type === type);
}

/**
 * Read output rating beads
 */
export async function readRatingBeads(): Promise<Bead[]> {
  return readBeadsByType('output-rating');
}

/**
 * Calculate quality trend from rating beads
 */
export interface QualityTrend {
  average: number | null;
  trend: 'up' | 'down' | 'stable' | null;
  totalRatings: number;
  recentAverage: number | null;
  previousAverage: number | null;
}

export async function calculateQualityTrend(): Promise<QualityTrend> {
  const ratings = await readRatingBeads();

  if (ratings.length === 0) {
    return {
      average: null,
      trend: null,
      totalRatings: 0,
      recentAverage: null,
      previousAverage: null,
    };
  }

  // Sort by created_at descending
  const sorted = [...ratings].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Take last 50 ratings (performance optimization - keeps session start fast)
  const recent = sorted.slice(0, 50);
  const allRatings = recent.map(b => b.rating!).filter(r => r !== undefined);
  const average = allRatings.length > 0
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
    : null;

  // Calculate trend if we have at least 10 ratings (need 5+5 for comparison)
  let trend: 'up' | 'down' | 'stable' | null = null;
  let recentAverage: number | null = null;
  let previousAverage: number | null = null;

  if (allRatings.length >= 10) {
    const halfPoint = Math.floor(allRatings.length / 2);
    const recentHalf = allRatings.slice(0, halfPoint);
    const previousHalf = allRatings.slice(halfPoint, halfPoint * 2);

    recentAverage = recentHalf.reduce((a, b) => a + b, 0) / recentHalf.length;
    previousAverage = previousHalf.length > 0
      ? previousHalf.reduce((a, b) => a + b, 0) / previousHalf.length
      : null;

    if (previousAverage !== null) {
      const diff = recentAverage - previousAverage;
      if (diff >= 0.3) {
        trend = 'up';
      } else if (diff <= -0.3) {
        trend = 'down';
      } else {
        trend = 'stable';
      }
    }
  }

  return {
    average: average !== null ? Math.round(average * 10) / 10 : null,
    trend,
    totalRatings: ratings.length,
    recentAverage: recentAverage !== null ? Math.round(recentAverage * 10) / 10 : null,
    previousAverage: previousAverage !== null ? Math.round(previousAverage * 10) / 10 : null,
  };
}

/**
 * Format quality trend for display
 */
export function formatQualityTrend(trend: QualityTrend): string {
  if (trend.average === null) {
    return 'No ratings yet';
  }

  const trendSymbol = trend.trend === 'up' ? '↑'
    : trend.trend === 'down' ? '↓'
    : trend.trend === 'stable' ? '→'
    : '';

  return `${trend.average}/5 ${trendSymbol} (${trend.totalRatings} ratings)`;
}
