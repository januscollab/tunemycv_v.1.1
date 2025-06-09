/**
 * Centralized File Naming Utilities
 * Standardized naming convention: {user_id} {filename} {DDMMYY-HHMMSS} {state}.{ext}
 */

export type FileState = 
  | 'uploaded-by-user'
  | 'adobe-response' 
  | 'extracted'
  | 'formatted'
  | 'transformed';

export type FileType = 'zip' | 'txt' | 'json';

/**
 * Generate timestamp in DDMMYY-HHMMSS format
 */
export function generateTimestamp(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  
  return `${dd}${mm}${yy}-${hh}${min}${ss}`;
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.substring(lastDot + 1);
}

/**
 * Remove extension from filename
 */
export function getFilenameWithoutExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? filename : filename.substring(0, lastDot);
}

/**
 * Generate standardized debug file name
 * Format: {user_id} {filename} {DDMMYY-HHMMSS} {state}.{ext}
 */
export function generateDebugFileName(
  userId: string,
  originalFileName: string,
  state: FileState,
  extension?: string
): string {
  const timestamp = generateTimestamp();
  const baseFilename = getFilenameWithoutExtension(originalFileName);
  const ext = extension || getFileExtension(originalFileName);
  
  return `${userId} ${baseFilename} ${timestamp} ${state}.${ext}`;
}

/**
 * Generate standardized user upload file name  
 * Format: {user_id} {filename} {DDMMYY-HHMMSS}.{ext}
 */
export function generateStandardFileName(
  userId: string,
  originalFileName: string
): string {
  const timestamp = generateTimestamp();
  const baseFilename = getFilenameWithoutExtension(originalFileName);
  const ext = getFileExtension(originalFileName);
  
  return `${userId} ${baseFilename} ${timestamp}.${ext}`;
}

/**
 * Generate debug file name for Adobe ZIP responses
 */
export function generateAdobeResponseFileName(
  userId: string,
  originalFileName: string
): string {
  return generateDebugFileName(userId, originalFileName, 'adobe-response', 'zip');
}

/**
 * Generate debug file name for extracted text
 */
export function generateExtractedTextFileName(
  userId: string,
  originalFileName: string
): string {
  return generateDebugFileName(userId, originalFileName, 'extracted', 'txt');
}

/**
 * Generate debug file name for formatted text
 */
export function generateFormattedTextFileName(
  userId: string,
  originalFileName: string
): string {
  return generateDebugFileName(userId, originalFileName, 'formatted', 'txt');
}

/**
 * Generate debug file name for transformed JSON
 */
export function generateTransformedJsonFileName(
  userId: string,
  originalFileName: string
): string {
  return generateDebugFileName(userId, originalFileName, 'transformed', 'json');
}

/**
 * Generate debug file name for user uploaded files
 */
export function generateUserUploadFileName(
  userId: string,
  originalFileName: string
): string {
  return generateDebugFileName(userId, originalFileName, 'uploaded-by-user');
}

/**
 * Validate file state
 */
export function isValidFileState(state: string): state is FileState {
  const validStates: FileState[] = [
    'uploaded-by-user',
    'adobe-response',
    'extracted', 
    'formatted',
    'transformed'
  ];
  return validStates.includes(state as FileState);
}

/**
 * Parse standardized filename to extract components
 */
export function parseStandardizedFilename(filename: string): {
  userId: string;
  originalName: string;
  timestamp: string;
  state?: FileState;
  extension: string;
} | null {
  // Pattern: {user_id} {filename} {DDMMYY-HHMMSS} [{state}].{ext}
  const parts = filename.split(' ');
  if (parts.length < 3) return null;
  
  const userId = parts[0];
  const extension = getFileExtension(filename);
  const lastPart = parts[parts.length - 1].replace(`.${extension}`, '');
  
  // Check if last part is a state or timestamp
  let state: FileState | undefined;
  let timestamp: string;
  
  if (isValidFileState(lastPart)) {
    state = lastPart as FileState;
    timestamp = parts[parts.length - 2];
  } else {
    timestamp = lastPart;
  }
  
  // Reconstruct original filename (everything between userId and timestamp/state)
  const startIndex = 1;
  const endIndex = state ? parts.length - 2 : parts.length - 1;
  const originalName = parts.slice(startIndex, endIndex).join(' ');
  
  return {
    userId,
    originalName,
    timestamp,
    state,
    extension
  };
}