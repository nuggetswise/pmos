/**
 * PM OS Hooks Type Definitions
 *
 * Defines the event model, hook structure, and context types for PM OS hooks.
 */

/**
 * PM OS Hook Events
 *
 * These events correspond to lifecycle moments in the PM OS workflow.
 */
export type PMOSHookEvent =
  | 'session:startup' // Session begins
  | 'session:shutdown' // Session ends
  | 'skill:started' // Skill execution begins
  | 'skill:completed' // Skill execution ends
  | 'output:created' // File written to outputs/
  | 'output:rated' // User rates an output (1-5)
  | 'history:mirrored' // Output copied to history/
  | 'decision:logged' // Decision record created
  | 'time:daily' // Daily scheduled task
  | 'time:weekly'; // Weekly scheduled task (learning)

/**
 * Hook metadata following the PAI (Purpose-API-Implementation) pattern
 */
export interface HookMeta {
  /** Unique identifier for the hook */
  id: string;
  /** Event that triggers this hook */
  trigger: PMOSHookEvent | PMOSHookEvent[];
  /** Human-readable explanation of what this hook does */
  intent: string;
  /** Guarantees this hook provides */
  guarantees: HookGuarantee[];
  /** Scope of file access */
  scope: HookScope;
  /** Message shown to user when hook runs (optional) */
  userMessage?: string;
}

export type HookGuarantee =
  | 'non-blocking' // Hook will not block user interaction
  | 'idempotent' // Running multiple times has same effect
  | 'read-only' // Hook does not modify files
  | 'deterministic'; // Same input produces same output

export interface HookScope {
  /** Glob patterns for files this hook may read */
  read: string[];
  /** Glob patterns for files this hook may write */
  write: string[];
}

/**
 * Context passed to hook run function
 */
export interface HookContext {
  /** The event that triggered this hook */
  event: PMOSHookEvent;
  /** Timestamp when the event occurred */
  timestamp: string;
  /** Path to the project root */
  projectRoot: string;
  /** Path to nexa directory */
  nexaDir: string;
  /** Event-specific payload */
  payload: HookPayload;
  /** Environment variables */
  env: NodeJS.ProcessEnv;
}

/**
 * Event-specific payloads
 */
export type HookPayload =
  | SessionStartupPayload
  | SessionShutdownPayload
  | SkillPayload
  | OutputCreatedPayload
  | OutputRatedPayload
  | DecisionLoggedPayload
  | ScheduledPayload;

export interface SessionStartupPayload {
  type: 'session:startup';
  sessionId?: string;
  resuming?: boolean;
}

export interface SessionShutdownPayload {
  type: 'session:shutdown';
  sessionId?: string;
  reason?: 'explicit' | 'timeout' | 'error';
}

export interface SkillPayload {
  type: 'skill:started' | 'skill:completed';
  skillName: string;
  outputPath?: string;
  success?: boolean;
}

export interface OutputCreatedPayload {
  type: 'output:created';
  filePath: string;
  skillName?: string;
}

export interface OutputRatedPayload {
  type: 'output:rated';
  filePath: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
}

export interface DecisionLoggedPayload {
  type: 'decision:logged';
  decisionPath: string;
  title: string;
}

export interface ScheduledPayload {
  type: 'time:daily' | 'time:weekly';
  lastRun?: string;
}

/**
 * Result returned by hook run function
 */
export interface HookResult {
  /** Whether the hook succeeded */
  success: boolean;
  /** Message to inject into Claude's context (optional) */
  contextInjection?: string;
  /** Error message if failed */
  error?: string;
  /** Files modified by this hook */
  filesModified?: string[];
  /** Files read by this hook */
  filesRead?: string[];
}

/**
 * JSON output format for Claude Code hooks
 * This is the format that hooks return to stdout
 */
export interface ClaudeHookOutput {
  hookSpecificOutput?: {
    hookEventName: string;
    additionalContext: string;
  };
}

/**
 * Hook definition interface for implementing hooks
 */
export interface HookDefinition {
  meta: HookMeta;
  run: (ctx: HookContext) => Promise<HookResult>;
}
