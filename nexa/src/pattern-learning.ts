/**
 * Pattern Learning Engine
 *
 * Analyzes beads to extract patterns with graceful degradation.
 * Works with 0-N beads - confidence scales with data, never blocks.
 *
 * Inspired by:
 * - steveyegge/beads (atomic insights, connections graph)
 * - danielmiessler/Personal_AI_Infrastructure (hook-based learning)
 */

import * as fs from 'fs';
import * as path from 'path';
import { Bead, BeadType } from './beads/types.js';
import { readAllBeads, readRatingBeads, calculateQualityTrend } from './beads/repository.js';
import { getProjectRoot } from './utils.js';

// ============================================================================
// Types
// ============================================================================

export type ConfidenceLevel = 'none' | 'low' | 'medium' | 'high';

export interface Pattern {
  id: string;
  type: 'sentiment' | 'cooccurrence' | 'graph' | 'quality';
  content: string;
  confidence: ConfidenceLevel;
  evidence: string[];
  created_at: string;
}

export interface PatternResult {
  totalBeads: number;
  totalRatings: number;
  patternsFound: number;
  confidence: ConfidenceLevel;
  patterns: Pattern[];
  message: string;
  qualityTrend: {
    average: number;
    trend: 'up' | 'down' | 'stable' | 'insufficient';
    ratingCount: number;
  } | null;
}

// ============================================================================
// Confidence Calculation
// ============================================================================

/**
 * Calculate confidence level based on sample size
 */
function calculateConfidence(sampleSize: number, minForLow = 3, minForMedium = 10, minForHigh = 50): ConfidenceLevel {
  if (sampleSize === 0) return 'none';
  if (sampleSize < minForLow) return 'none';
  if (sampleSize < minForMedium) return 'low';
  if (sampleSize < minForHigh) return 'medium';
  return 'high';
}

/**
 * Calculate overall confidence from multiple pattern confidences
 */
function calculateOverallConfidence(beadCount: number, patterns: Pattern[]): ConfidenceLevel {
  if (beadCount === 0) return 'none';
  if (patterns.length === 0) return 'none';

  const confidenceOrder: ConfidenceLevel[] = ['none', 'low', 'medium', 'high'];
  const maxPatternConfidence = patterns.reduce((max, p) => {
    const current = confidenceOrder.indexOf(p.confidence);
    const maxIdx = confidenceOrder.indexOf(max);
    return current > maxIdx ? p.confidence : max;
  }, 'none' as ConfidenceLevel);

  return maxPatternConfidence;
}

// ============================================================================
// Sentiment Analysis
// ============================================================================

/**
 * Analyze rating patterns to find characteristics of high vs low rated outputs
 */
function analyzeSentiment(beads: Bead[]): Pattern[] {
  const ratings = beads.filter(b => b.type === 'output-rating' && b.rating !== undefined);

  if (ratings.length < 3) {
    return []; // Need minimum samples for comparison
  }

  const highRated = ratings.filter(b => b.rating! >= 4);
  const lowRated = ratings.filter(b => b.rating! <= 2);
  const patterns: Pattern[] = [];

  // Extract patterns from high-rated outputs
  if (highRated.length >= 2) {
    const highTags = extractCommonTags(highRated);
    const highSources = extractCommonSources(highRated);

    if (highTags.length > 0) {
      patterns.push({
        id: `sentiment_high_tags_${Date.now()}`,
        type: 'sentiment',
        content: `High-rated outputs (4-5) commonly have these characteristics: ${highTags.join(', ')}`,
        confidence: calculateConfidence(highRated.length, 2, 5, 10),
        evidence: highRated.map(b => b.id),
        created_at: new Date().toISOString()
      });
    }

    if (highSources.length > 0) {
      patterns.push({
        id: `sentiment_high_sources_${Date.now()}`,
        type: 'sentiment',
        content: `High-rated outputs often come from skills: ${highSources.join(', ')}`,
        confidence: calculateConfidence(highRated.length, 2, 5, 10),
        evidence: highRated.map(b => b.id),
        created_at: new Date().toISOString()
      });
    }
  }

  // Extract patterns from low-rated outputs
  if (lowRated.length >= 2) {
    const lowTags = extractCommonTags(lowRated);

    if (lowTags.length > 0) {
      patterns.push({
        id: `sentiment_low_tags_${Date.now()}`,
        type: 'sentiment',
        content: `Low-rated outputs (1-2) commonly have these issues: ${lowTags.join(', ')}`,
        confidence: calculateConfidence(lowRated.length, 2, 5, 10),
        evidence: lowRated.map(b => b.id),
        created_at: new Date().toISOString()
      });
    }

    // Look for patterns in user feedback content
    const feedbackPatterns = extractFeedbackPatterns(lowRated);
    if (feedbackPatterns.length > 0) {
      patterns.push({
        id: `sentiment_low_feedback_${Date.now()}`,
        type: 'sentiment',
        content: `Common feedback on low-rated outputs: ${feedbackPatterns.join('; ')}`,
        confidence: calculateConfidence(lowRated.length, 2, 5, 10),
        evidence: lowRated.map(b => b.id),
        created_at: new Date().toISOString()
      });
    }
  }

  // Compare high vs low if both exist
  if (highRated.length >= 2 && lowRated.length >= 2) {
    const highAvgTags = highRated.reduce((sum, b) => sum + b.tags.length, 0) / highRated.length;
    const lowAvgTags = lowRated.reduce((sum, b) => sum + b.tags.length, 0) / lowRated.length;

    if (Math.abs(highAvgTags - lowAvgTags) > 1) {
      patterns.push({
        id: `sentiment_comparison_${Date.now()}`,
        type: 'sentiment',
        content: `High-rated outputs have ${highAvgTags > lowAvgTags ? 'more' : 'fewer'} tags on average (${highAvgTags.toFixed(1)} vs ${lowAvgTags.toFixed(1)})`,
        confidence: calculateConfidence(ratings.length, 4, 10, 20),
        evidence: [...highRated.map(b => b.id), ...lowRated.map(b => b.id)],
        created_at: new Date().toISOString()
      });
    }
  }

  return patterns;
}

/**
 * Extract tags that appear in multiple beads
 */
function extractCommonTags(beads: Bead[]): string[] {
  const tagCounts: Record<string, number> = {};

  for (const bead of beads) {
    for (const tag of bead.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  // Return tags that appear in at least 50% of beads
  const threshold = Math.ceil(beads.length / 2);
  return Object.entries(tagCounts)
    .filter(([_, count]) => count >= threshold)
    .map(([tag]) => tag);
}

/**
 * Extract common source skills from beads
 */
function extractCommonSources(beads: Bead[]): string[] {
  const sourceCounts: Record<string, number> = {};

  for (const bead of beads) {
    if (bead.source) {
      sourceCounts[bead.source] = (sourceCounts[bead.source] || 0) + 1;
    }
  }

  // Return sources that appear in at least 2 beads
  return Object.entries(sourceCounts)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([source]) => source);
}

/**
 * Extract patterns from user feedback content
 */
function extractFeedbackPatterns(beads: Bead[]): string[] {
  const patterns: string[] = [];
  const keywords: Record<string, number> = {};

  // Common feedback keywords to look for
  const feedbackTerms = ['vague', 'unclear', 'missing', 'incomplete', 'wrong', 'too long', 'too short', 'confusing'];

  for (const bead of beads) {
    if (bead.content) {
      const content = bead.content.toLowerCase();
      for (const term of feedbackTerms) {
        if (content.includes(term)) {
          keywords[term] = (keywords[term] || 0) + 1;
        }
      }
    }
  }

  // Return terms that appear in at least 2 feedback entries
  for (const [term, count] of Object.entries(keywords)) {
    if (count >= 2) {
      patterns.push(`"${term}" mentioned ${count} times`);
    }
  }

  return patterns;
}

// ============================================================================
// Co-occurrence Analysis
// ============================================================================

/**
 * Analyze tag co-occurrence to find related concepts
 */
function analyzeCooccurrence(beads: Bead[]): Pattern[] {
  if (beads.length < 5) {
    return []; // Need minimum beads for meaningful co-occurrence
  }

  const patterns: Pattern[] = [];
  const cooccurrences: Record<string, Record<string, number>> = {};

  // Count co-occurrences
  for (const bead of beads) {
    const tags = bead.tags;
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const [tag1, tag2] = [tags[i], tags[j]].sort();
        if (!cooccurrences[tag1]) cooccurrences[tag1] = {};
        cooccurrences[tag1][tag2] = (cooccurrences[tag1][tag2] || 0) + 1;
      }
    }
  }

  // Find significant co-occurrences (appearing together at least 3 times)
  const significantPairs: Array<{ tags: [string, string]; count: number }> = [];

  for (const [tag1, related] of Object.entries(cooccurrences)) {
    for (const [tag2, count] of Object.entries(related)) {
      if (count >= 3) {
        significantPairs.push({ tags: [tag1, tag2], count });
      }
    }
  }

  // Sort by count and take top 5
  significantPairs.sort((a, b) => b.count - a.count);

  if (significantPairs.length > 0) {
    const topPairs = significantPairs.slice(0, 5);
    patterns.push({
      id: `cooccurrence_tags_${Date.now()}`,
      type: 'cooccurrence',
      content: `Frequently co-occurring concepts: ${topPairs.map(p => `${p.tags[0]} + ${p.tags[1]} (${p.count}x)`).join(', ')}`,
      confidence: calculateConfidence(beads.length, 5, 20, 50),
      evidence: beads.filter(b => {
        const tags = b.tags;
        return topPairs.some(p => tags.includes(p.tags[0]) && tags.includes(p.tags[1]));
      }).map(b => b.id),
      created_at: new Date().toISOString()
    });
  }

  // Analyze type co-occurrence with sources
  const typeSourceCounts: Record<string, Record<string, number>> = {};

  for (const bead of beads) {
    if (!typeSourceCounts[bead.type]) typeSourceCounts[bead.type] = {};
    if (bead.source) {
      typeSourceCounts[bead.type][bead.source] = (typeSourceCounts[bead.type][bead.source] || 0) + 1;
    }
  }

  // Find which skills produce which types of insights
  for (const [type, sources] of Object.entries(typeSourceCounts)) {
    const topSources = Object.entries(sources)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topSources.length > 0 && topSources[0][1] >= 3) {
      patterns.push({
        id: `cooccurrence_type_source_${type}_${Date.now()}`,
        type: 'cooccurrence',
        content: `'${type}' beads mostly come from: ${topSources.map(([s, c]) => `${s} (${c})`).join(', ')}`,
        confidence: calculateConfidence(beads.filter(b => b.type === type).length, 3, 10, 30),
        evidence: beads.filter(b => b.type === type).map(b => b.id),
        created_at: new Date().toISOString()
      });
    }
  }

  return patterns;
}

// ============================================================================
// Graph Analysis
// ============================================================================

/**
 * Analyze bead connections to find workflow patterns
 */
function analyzeGraph(beads: Bead[]): Pattern[] {
  const beadsWithConnections = beads.filter(b => b.connections && b.connections.length > 0);

  if (beadsWithConnections.length < 3) {
    return []; // Need minimum connected beads for graph analysis
  }

  const patterns: Pattern[] = [];

  // Build connection graph
  const graph: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  const outDegree: Record<string, number> = {};

  for (const bead of beads) {
    graph[bead.id] = bead.connections || [];
    outDegree[bead.id] = (bead.connections || []).length;

    for (const connId of bead.connections || []) {
      inDegree[connId] = (inDegree[connId] || 0) + 1;
    }
  }

  // Find hub beads (high connectivity)
  const hubBeads = beads.filter(b => {
    const totalDegree = (outDegree[b.id] || 0) + (inDegree[b.id] || 0);
    return totalDegree >= 3;
  });

  if (hubBeads.length > 0) {
    patterns.push({
      id: `graph_hubs_${Date.now()}`,
      type: 'graph',
      content: `Key hub insights (highly connected): ${hubBeads.slice(0, 5).map(b => `"${b.content.slice(0, 50)}..."`).join('; ')}`,
      confidence: calculateConfidence(beadsWithConnections.length, 3, 10, 30),
      evidence: hubBeads.map(b => b.id),
      created_at: new Date().toISOString()
    });
  }

  // Find chains (A -> B -> C)
  const chains: string[][] = [];

  for (const bead of beads) {
    if ((bead.connections || []).length > 0) {
      for (const nextId of bead.connections!) {
        const nextBead = beads.find(b => b.id === nextId);
        if (nextBead && (nextBead.connections || []).length > 0) {
          for (const thirdId of nextBead.connections!) {
            chains.push([bead.id, nextId, thirdId]);
          }
        }
      }
    }
  }

  if (chains.length > 0) {
    patterns.push({
      id: `graph_chains_${Date.now()}`,
      type: 'graph',
      content: `Found ${chains.length} insight chains (connected sequences of learnings)`,
      confidence: calculateConfidence(chains.length, 1, 5, 15),
      evidence: [...new Set(chains.flat())],
      created_at: new Date().toISOString()
    });
  }

  return patterns;
}

// ============================================================================
// Quality Patterns
// ============================================================================

/**
 * Generate quality patterns based on rating trends
 */
function analyzeQualityPatterns(beads: Bead[]): Pattern[] {
  const ratings = beads.filter(b => b.type === 'output-rating' && b.rating !== undefined);

  if (ratings.length < 5) {
    return [];
  }

  const patterns: Pattern[] = [];

  // Analyze by skill
  const skillRatings: Record<string, number[]> = {};

  for (const bead of ratings) {
    if (bead.source && bead.rating) {
      if (!skillRatings[bead.source]) skillRatings[bead.source] = [];
      skillRatings[bead.source].push(bead.rating);
    }
  }

  // Find best and worst performing skills
  const skillAverages = Object.entries(skillRatings)
    .filter(([_, ratings]) => ratings.length >= 2)
    .map(([skill, ratings]) => ({
      skill,
      average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
      count: ratings.length
    }))
    .sort((a, b) => b.average - a.average);

  if (skillAverages.length > 0) {
    const best = skillAverages[0];
    patterns.push({
      id: `quality_best_skill_${Date.now()}`,
      type: 'quality',
      content: `Highest rated skill: ${best.skill} (avg ${best.average.toFixed(1)}/5 from ${best.count} ratings)`,
      confidence: calculateConfidence(best.count, 2, 5, 10),
      evidence: ratings.filter(b => b.source === best.skill).map(b => b.id),
      created_at: new Date().toISOString()
    });

    if (skillAverages.length > 1) {
      const worst = skillAverages[skillAverages.length - 1];
      if (worst.average < 3.5) {
        patterns.push({
          id: `quality_improve_skill_${Date.now()}`,
          type: 'quality',
          content: `Skill needing improvement: ${worst.skill} (avg ${worst.average.toFixed(1)}/5 from ${worst.count} ratings)`,
          confidence: calculateConfidence(worst.count, 2, 5, 10),
          evidence: ratings.filter(b => b.source === worst.skill).map(b => b.id),
          created_at: new Date().toISOString()
        });
      }
    }
  }

  // Overall quality trend
  const sortedRatings = [...ratings].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  if (sortedRatings.length >= 6) {
    const firstHalf = sortedRatings.slice(0, Math.floor(sortedRatings.length / 2));
    const secondHalf = sortedRatings.slice(Math.floor(sortedRatings.length / 2));

    const firstAvg = firstHalf.reduce((sum, b) => sum + (b.rating || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, b) => sum + (b.rating || 0), 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    if (Math.abs(diff) > 0.3) {
      patterns.push({
        id: `quality_trend_${Date.now()}`,
        type: 'quality',
        content: `Quality is ${diff > 0 ? 'improving' : 'declining'}: earlier avg ${firstAvg.toFixed(1)}/5 → recent avg ${secondAvg.toFixed(1)}/5`,
        confidence: calculateConfidence(ratings.length, 6, 12, 30),
        evidence: sortedRatings.map(b => b.id),
        created_at: new Date().toISOString()
      });
    }
  }

  return patterns;
}

// ============================================================================
// Pattern Writing
// ============================================================================

/**
 * Write learned patterns to rules file
 */
async function writeLearnedPatterns(patterns: Pattern[], result: PatternResult): Promise<void> {
  const projectRoot = getProjectRoot();
  const outputPath = path.join(projectRoot, '.claude', 'rules', 'learned', 'quality-patterns.md');

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const now = new Date().toISOString();

  let content = `# Learned Quality Patterns

> Auto-generated by pattern-learning engine on ${now.split('T')[0]}
> Based on ${result.totalBeads} beads and ${result.totalRatings} ratings
> Overall confidence: ${result.confidence}

## Summary

- **Total Beads:** ${result.totalBeads}
- **Total Ratings:** ${result.totalRatings}
- **Patterns Found:** ${result.patternsFound}
- **Quality Trend:** ${result.qualityTrend ? `${result.qualityTrend.average.toFixed(1)}/5 (${result.qualityTrend.trend})` : 'Insufficient data'}

`;

  if (patterns.length === 0) {
    content += `## Status

No patterns found yet. Keep using PM OS and patterns will emerge as you:
- Generate outputs and provide ratings
- Capture insights during sessions
- Log decisions and learnings

Patterns will appear here automatically during weekly learning.
`;
  } else {
    // Group patterns by type
    const byType: Record<string, Pattern[]> = {};
    for (const pattern of patterns) {
      if (!byType[pattern.type]) byType[pattern.type] = [];
      byType[pattern.type].push(pattern);
    }

    if (byType.sentiment && byType.sentiment.length > 0) {
      content += `## Sentiment Patterns

These patterns show characteristics of high vs low rated outputs.

`;
      for (const p of byType.sentiment) {
        content += `- **[${p.confidence}]** ${p.content}\n`;
      }
      content += '\n';
    }

    if (byType.cooccurrence && byType.cooccurrence.length > 0) {
      content += `## Co-occurrence Patterns

These patterns show concepts and skills that frequently appear together.

`;
      for (const p of byType.cooccurrence) {
        content += `- **[${p.confidence}]** ${p.content}\n`;
      }
      content += '\n';
    }

    if (byType.graph && byType.graph.length > 0) {
      content += `## Connection Patterns

These patterns show how insights connect and flow.

`;
      for (const p of byType.graph) {
        content += `- **[${p.confidence}]** ${p.content}\n`;
      }
      content += '\n';
    }

    if (byType.quality && byType.quality.length > 0) {
      content += `## Quality Patterns

These patterns show output quality trends by skill.

`;
      for (const p of byType.quality) {
        content += `- **[${p.confidence}]** ${p.content}\n`;
      }
      content += '\n';
    }
  }

  content += `---

*Last updated: ${now}*
*Next update: Run \`pm-os learn:patterns\` or wait for weekly auto-learn*
`;

  fs.writeFileSync(outputPath, content, 'utf-8');
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Run pattern learning analysis - works with 0-N beads
 */
export async function runPatternLearning(): Promise<PatternResult> {
  const beads = await readAllBeads();
  const ratings = beads.filter(b => b.type === 'output-rating');

  // Calculate quality trend using existing repository function
  const qualityTrend = await calculateQualityTrend();

  // Handle 0 beads gracefully
  if (beads.length === 0) {
    const result: PatternResult = {
      totalBeads: 0,
      totalRatings: 0,
      patternsFound: 0,
      confidence: 'none',
      patterns: [],
      message: 'No beads yet. Patterns will emerge as you use PM OS.',
      qualityTrend: null
    };

    await writeLearnedPatterns([], result);
    return result;
  }

  // Run all analyses regardless of bead count
  const sentimentPatterns = analyzeSentiment(beads);
  const cooccurrencePatterns = analyzeCooccurrence(beads);
  const graphPatterns = analyzeGraph(beads);
  const qualityPatterns = analyzeQualityPatterns(beads);

  // Combine all patterns
  const allPatterns = [
    ...sentimentPatterns,
    ...cooccurrencePatterns,
    ...graphPatterns,
    ...qualityPatterns
  ];

  // Calculate overall confidence
  const confidence = calculateOverallConfidence(beads.length, allPatterns);

  // Build result
  const result: PatternResult = {
    totalBeads: beads.length,
    totalRatings: ratings.length,
    patternsFound: allPatterns.length,
    confidence,
    patterns: allPatterns,
    message: buildResultMessage(beads.length, allPatterns.length, confidence),
    qualityTrend: qualityTrend.average !== null ? {
      average: qualityTrend.average,
      trend: qualityTrend.trend || 'stable',
      ratingCount: qualityTrend.totalRatings
    } : null
  };

  // Write patterns to learned rules
  await writeLearnedPatterns(allPatterns, result);

  return result;
}

/**
 * Build human-readable result message
 */
function buildResultMessage(beadCount: number, patternCount: number, confidence: ConfidenceLevel): string {
  if (beadCount === 0) {
    return 'No beads yet. Patterns will emerge as you use PM OS.';
  }

  if (beadCount < 5) {
    return `Found ${beadCount} beads. Keep using PM OS - patterns will emerge with more data.`;
  }

  if (patternCount === 0) {
    return `Analyzed ${beadCount} beads but no strong patterns found yet. Continue using PM OS.`;
  }

  const confidenceText = {
    none: 'preliminary',
    low: 'low confidence',
    medium: 'moderate confidence',
    high: 'high confidence'
  }[confidence];

  return `Found ${patternCount} patterns from ${beadCount} beads (${confidenceText}).`;
}

// Export for CLI integration
export { calculateQualityTrend };
