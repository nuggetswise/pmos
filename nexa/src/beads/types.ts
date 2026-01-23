
/**
 * Bead types for .beads/insights.jsonl
 */
export type BeadType = 'insight' | 'decision' | 'pattern' | 'question' | 'output-rating';

export interface Bead {
  /** Unique identifier */
  id: string;
  /** Type of bead */
  type: BeadType;
  /** The content/insight itself */
  content: string;
  /** Source skill or session */
  source: string;
  /** File path if related to an output */
  output_file?: string;
  /** Rating if this is an output-rating bead */
  rating?: 1 | 2 | 3 | 4 | 5;
  /** Sentiment derived from rating */
  sentiment?: 'positive' | 'neutral' | 'negative';
  /** ISO timestamp */
  created_at: string;
  /** Tags for categorization */
  tags: string[];
  /** Confidence level */
  confidence?: 'high' | 'medium' | 'low';
  /** Connected bead IDs */
  connections: string[];
}
