/**
 * Frontmatter parser for markdown outputs
 */

import * as yaml from 'js-yaml';

export type FrontmatterResult = {
  meta: Record<string, unknown> | null;
  body: string;
};

export function parseFrontmatter(content: string): FrontmatterResult {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { meta: null, body: content };
  }

  let meta: Record<string, unknown> | null = null;
  try {
    const parsed = yaml.load(match[1]);
    if (parsed && typeof parsed === 'object') {
      meta = parsed as Record<string, unknown>;
    }
  } catch {
    meta = null;
  }

  const body = content.slice(match[0].length);
  return { meta, body };
}

export function extractDateFromMeta(meta: Record<string, unknown> | null): string | null {
  if (!meta) return null;
  const raw = meta.generated;
  if (typeof raw !== 'string') return null;
  const match = raw.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}
