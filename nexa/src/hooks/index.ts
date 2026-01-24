/**
 * PM OS Hooks
 *
 * Deterministic automation triggered by lifecycle events.
 *
 * Architecture:
 * - Hooks automate the mechanical; Claude owns the reasoning
 * - Hooks are non-blocking, idempotent, and deterministic
 * - Hooks signal Claude to perform reasoning tasks
 *
 * Categories:
 * - lifecycle/: Session start/end, context loading
 * - workflow/: Skill execution, output mirroring, rating capture
 * - scheduled/: Weekly learning, staleness checks
 * - guardrails/: Scope validation, evidence checks
 */

// Types
export * from './types.js';

// Shared utilities
export * from './lib/index.js';

// Lifecycle hooks
export * from './lifecycle/index.js';

// Workflow hooks
export * from './workflow/index.js';

// Scheduled hooks
export * from './scheduled/index.js';

// Guardrail hooks
export * from './guardrails/index.js';

// Hook registry
import { LoadContextHook } from './lifecycle/LoadContext.hook.js';
import { SessionSummaryHook } from './lifecycle/SessionSummary.hook.js';
import { AutoMirrorHook } from './workflow/AutoMirror.hook.js';
import { PostSkillSignalHook } from './workflow/PostSkillSignal.hook.js';
import { RatingCaptureHook } from './workflow/RatingCapture.hook.js';
import { DecisionSignalHook } from './workflow/DecisionSignal.hook.js';
import { WeeklyLearningHook } from './scheduled/WeeklyLearning.hook.js';
import { StalenessCheckHook } from './scheduled/StalenessCheck.hook.js';
import { ScopeValidatorHook } from './guardrails/ScopeValidator.hook.js';
import { EvidenceCheckHook } from './guardrails/EvidenceCheck.hook.js';
import { ExtractBeadsFromOutputHook } from './lifecycle/ExtractBeadsFromOutput.hook.js';
import type { HookDefinition } from './types.js';

/**
 * All registered hooks
 */
export const HOOKS: Record<string, HookDefinition> = {
  'load-context': LoadContextHook,
  'session-summary': SessionSummaryHook,
  'extract-beads-from-output': ExtractBeadsFromOutputHook,
  'auto-mirror': AutoMirrorHook,
  'post-skill-signal': PostSkillSignalHook,
  'rating-capture': RatingCaptureHook,
  'decision-signal': DecisionSignalHook,
  'weekly-learning': WeeklyLearningHook,
  'staleness-check': StalenessCheckHook,
  'scope-validator': ScopeValidatorHook,
  'evidence-check': EvidenceCheckHook,
};

/**
 * Get hook by ID
 */
export function getHook(id: string): HookDefinition | undefined {
  return HOOKS[id];
}

/**
 * Get all hooks for an event
 */
export function getHooksForEvent(event: string): HookDefinition[] {
  return Object.values(HOOKS).filter(hook => {
    const triggers = Array.isArray(hook.meta.trigger)
      ? hook.meta.trigger
      : [hook.meta.trigger];
    return triggers.includes(event as any);
  });
}

/**
 * List all hook IDs
 */
export function listHookIds(): string[] {
  return Object.keys(HOOKS);
}
