/**
 * File naming utilities for process-adobe-queue
 * Re-exports centralized naming utilities with backwards compatibility
 */

export * from '../shared/fileNaming.ts';

// Backwards compatibility exports
export { generateStandardFileName as generateStandardFileName } from '../shared/fileNaming.ts';
export { parseStandardizedFilename as parseStandardFileName } from '../shared/fileNaming.ts';