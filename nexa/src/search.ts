/**
 * PM OS Search
 *
 * Searches filenames/paths first, then full-text with ranked results.
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { getProjectRoot } from './utils.js';

type SearchResult = {
  path: string;
  score: number;
  pathMatch: boolean;
  contentMatches: number;
  snippet?: string;
};

const DEFAULT_LIMIT = 20;

export async function runSearch(query: string, limit: number = DEFAULT_LIMIT): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed) {
    console.error('Usage: pm-os search "<query>"');
    process.exit(1);
  }

  const results = await searchFiles(trimmed, limit);

  if (results.length === 0) {
    console.log('No matches found.');
    return;
  }

  console.log(`Top ${results.length} result(s):\n`);
  for (const result of results) {
    const matchLabel = result.pathMatch ? 'path+text' : 'text';
    console.log(`- ${result.path} (${matchLabel}, score=${result.score})`);
    if (result.snippet) {
      console.log(`  "${result.snippet}"`);
    }
  }
}

async function searchFiles(query: string, limit: number): Promise<SearchResult[]> {
  const root = getProjectRoot();
  const queryLower = query.toLowerCase();
  const tokens = queryLower.split(/\s+/).filter(Boolean);

  const patterns = [
    path.join(root, 'outputs', 'ingest', '*.txt'),
    path.join(root, 'outputs', '**', '*.md'),
    path.join(root, 'history', '**', '*.md'),
  ];

  const ignore = [
    path.join(root, 'outputs', 'audit', '**', '*'),
    path.join(root, 'outputs', 'ingest', '*.meta.json'),
  ];

  const files = new Set<string>();
  for (const pattern of patterns) {
    const matches = await glob(pattern, { nodir: true, absolute: true, ignore });
    for (const file of matches) {
      files.add(file);
    }
  }

  const results: SearchResult[] = [];

  for (const filePath of files) {
    const lowerPath = filePath.toLowerCase();
    let score = 0;
    let pathMatch = false;

    if (lowerPath.includes(queryLower)) {
      score += 1000;
      pathMatch = true;
    }

    let content = '';
    try {
      content = await fs.promises.readFile(filePath, 'utf-8');
    } catch {
      continue;
    }

    const contentLower = content.toLowerCase();
    let contentMatches = 0;
    let firstIndex = -1;

    if (contentLower.includes(queryLower)) {
      const phraseCount = countOccurrences(contentLower, queryLower);
      contentMatches += phraseCount * 5;
      firstIndex = contentLower.indexOf(queryLower);
    }

    for (const token of tokens) {
      if (token.length < 2) {
        continue;
      }
      const tokenCount = countOccurrences(contentLower, token);
      contentMatches += tokenCount;
      if (firstIndex === -1 && tokenCount > 0) {
        firstIndex = contentLower.indexOf(token);
      }
    }

    score += contentMatches;
    if (score <= 0) {
      continue;
    }

    const snippet = firstIndex >= 0 ? buildSnippet(content, firstIndex, query.length) : undefined;
    results.push({ path: filePath, score, pathMatch, contentMatches, snippet });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let idx = 0;
  while (true) {
    idx = haystack.indexOf(needle, idx);
    if (idx === -1) break;
    count += 1;
    idx += needle.length;
  }
  return count;
}

function buildSnippet(content: string, index: number, queryLen: number): string {
  const start = Math.max(0, index - 60);
  const end = Math.min(content.length, index + Math.max(queryLen, 20) + 80);
  return content
    .slice(start, end)
    .replace(/\s+/g, ' ')
    .trim();
}
