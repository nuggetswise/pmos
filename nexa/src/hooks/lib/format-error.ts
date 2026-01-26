/**
 * Error Formatting for User-Facing Messages
 *
 * Translates technical errors into user-friendly messages that can be
 * injected into Claude context via systemMessage field.
 */

import type { ErrorSeverity } from '../types.js';

/**
 * Format error as user-friendly system message
 *
 * Maps technical errors to actionable messages users can understand
 */
export function formatErrorForUser(
  hookName: string,
  error: string,
  severity: ErrorSeverity
): string {
  const prefixMap: Record<ErrorSeverity, string> = {
    fatal: '🚨 PM OS Fatal Error:',
    degraded: '⚠️ PM OS Warning:',
    info: 'ℹ️ PM OS Note:',
  };
  const prefix = prefixMap[severity];

  // Common patterns with user-friendly replacements
  const message = mapErrorToUserMessage(error);

  return `${prefix} ${message}`;
}

/**
 * Map technical error patterns to user-friendly messages
 */
function mapErrorToUserMessage(error: string): string {
  // File system errors
  if (error.includes('ENOENT') || error.includes('not found')) {
    return 'File missing or inaccessible. Try running `pm-os scan` to refresh your documents.';
  }

  if (error.includes('EACCES') || error.includes('permission denied')) {
    return 'Permission denied. Check file permissions or contact support.';
  }

  if (error.includes('EISDIR') || error.includes('is a directory')) {
    return 'Tried to read a directory as a file. This is a system issue.';
  }

  // JSON/parsing errors
  if (error.includes('JSON')) {
    return 'Data corruption detected in system files. Try running `pm-os repair-beads` to recover.';
  }

  if (error.includes('parse')) {
    return 'Could not parse file format. The file may be corrupted.';
  }

  // Timeout/performance errors
  if (error.includes('timeout') || error.includes('ETIMEDOUT')) {
    return 'Operation timed out. Try again or contact support if this persists.';
  }

  // State/concurrency errors
  if (error.includes('state') || error.includes('State')) {
    return 'System state is inconsistent. Try running `pm-os init` to reset if problem persists.';
  }

  // Generic fallback: just add a prefix
  return `System error: ${error.substring(0, 100)}${error.length > 100 ? '...' : ''}`;
}

/**
 * Determine severity from error type
 */
export function determineSeverity(error: string): ErrorSeverity {
  // Fatal errors (must stop work)
  if (
    error.includes('EACCES') ||
    error.includes('state') ||
    error.includes('invariant') ||
    error.includes('fatal')
  ) {
    return 'fatal';
  }

  // Degraded (work can continue with reduced functionality)
  if (
    error.includes('ENOENT') ||
    error.includes('timeout') ||
    error.includes('JSON') ||
    error.includes('parse')
  ) {
    return 'degraded';
  }

  // Info (just notify user)
  return 'info';
}
