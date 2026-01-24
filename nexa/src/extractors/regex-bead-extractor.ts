/**
 * Regex-based Bead Extractor
 *
 * Extracts structured beads from text content using a set of configurable rules.
 * Looks for patterns like "INSIGHT:", "DECISION:", "QUESTION:", etc.
 */
import { Bead, BeadType } from '../beads/types.js';
import { generateBeadId } from '../beads/repository.js';

interface RegexRule {
  type: BeadType;
  regex: RegExp;
  confidence: 'high' | 'medium' | 'low';
}

// Default rules for the extractor
const DEFAULT_RULES: RegexRule[] = [
  {
    type: 'insight',
    regex: /INSIGHT:\s*(.*)/gi,
    confidence: 'high',
  },
  {
    type: 'decision',
    regex: /DECISION:\s*(.*)/gi,
    confidence: 'high',
  },
  {
    type: 'question',
    regex: /QUESTION:\s*(.*)/gi,
    confidence: 'high',
  },
];

interface ExtractedBead {
  type: BeadType;
  content: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Extracts beads from a string based on a set of regex rules.
 *
 * @param content The text content to analyze.
 * @param source The source of the content (e.g., file path or skill name).
 * @param rules Optional array of regex rules to use.
 * @returns An array of newly created Bead objects.
 */
export function extractBeadsWithRegex(
  content: string,
  source: string,
  rules: RegexRule[] = DEFAULT_RULES
): ExtractedBead[] {
  const extracted: ExtractedBead[] = [];

  for (const rule of rules) {
    const matches = content.matchAll(rule.regex);
    for (const match of matches) {
      const capturedContent = match[1]?.trim();
      if (capturedContent) {
        extracted.push({
          type: rule.type,
          content: capturedContent,
          confidence: rule.confidence,
        });
      }
    }
  }

  return extracted;
}

/**
 * Converts an array of extracted beads into full Bead objects.
 */
export function createBeadsFromExtraction(
  extractedBeads: ExtractedBead[],
  source: string,
  sourceFile?: string
): Bead[] {
    const now = new Date().toISOString();

    return extractedBeads.map(extracted => {
        const bead = {
            id: generateBeadId(),
            type: extracted.type,
            content: extracted.content,
            source: source,
            output_file: sourceFile,
            tags: [extracted.type],
            confidence: extracted.confidence,

            connections: [],
            created_at: now,
        } as Bead;
        return bead;
    });
}
