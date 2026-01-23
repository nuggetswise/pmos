/**
 * PM OS CLI Type Definitions
 */

// State schema
export interface State {
  version: number;
  daemon: DaemonStatus;
  phase: AlgorithmPhase;
  current_job: Job | null;
  brief: Brief;
  next_action: string;
  ingest_index: IngestEntry[];
  last_job: LastJob | null;
  errors: ErrorEntry[];
  session_start_time: string | null;
}

// Error log entry
export interface ErrorEntry {
  timestamp: string;
  job_id: string;
  source_path: string;
  error_message: string;
}

export interface DaemonStatus {
  status: 'running' | 'stopped' | 'error';
  pid: number | null;
  last_heartbeat_at: string | null;
  started_at: string | null;
}

export type AlgorithmPhase = 'OBSERVE' | 'THINK' | 'PLAN' | 'BUILD' | 'EXECUTE' | 'VERIFY' | 'LEARN';

export interface Job {
  id: string;
  type: JobType;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  inputs: string[];
}

export type JobType =
  | 'ingest'
  | 'mirror'
  | 'learn'
  | 'summarize'
  | 'delta-feedback'
  | 'delta-ops'
  | 'delta-roadmap'
  | 'delta-competitive'
  | 'delta-general';

export interface Brief {
  top_themes: string[];
  risk_flags: string[];
  latest_delta: string | null;
}

export interface IngestEntry {
  source_path: string;
  ingest_path: string;
  content_hash: string;
  fingerprint: string; // mtime:size for quick change detection
  status: 'ok' | 'failed' | 'pending';
  extracted_at: string;
}

export interface LastJob {
  id: string;
  result: 'ok' | 'failed';
  finished_at: string;
}

// Source configuration
export interface SourcesConfig {
  version: number;
  scan_interval_sec: number;
  stability_window_sec: number;
  sources: Source[];
}

export interface Source {
  path: string;
  include: string[];
  mode: 'recursive' | 'non_recursive';
  description?: string;
}

// Input routing rules
export interface InputRulesConfig {
  version: number;
  rules: InputRule[];
}

export interface InputRule {
  name: string;
  description?: string;
  match: RuleMatch;
  job: JobType;
  priority: number;
}

export interface RuleMatch {
  path_contains?: string[];
  extensions?: string[];
}

// Extraction result
export interface ExtractionResult {
  success: boolean;
  text: string;
  metadata: Record<string, unknown>;
  error?: string;
}

// Scan result
export interface ScanResult {
  path: string;
  hash: string;
  fingerprint: string; // mtime:size for quick change detection
  stable: boolean;
  alreadyIngested: boolean;
  jobType: JobType;
}
