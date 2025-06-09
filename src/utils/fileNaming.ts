/**
 * File naming utility functions for consistent naming across the application
 */

/**
 * Generates a standardized filename using the format: {user_id}-{filename}-{timestamp}
 * @param userId - The user's ID
 * @param originalFilename - The original filename including extension
 * @returns Formatted filename string
 */
export const generateStandardFileName = (userId: string, originalFilename: string): string => {
  // Generate timestamp in DDMMYY-HHMMSS format
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const timestamp = `${day}${month}${year}-${hours}${minutes}${seconds}`;
  
  // Clean the original filename to remove any problematic characters
  const cleanFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '-');
  
  return `${userId}-${cleanFilename}-${timestamp}`;
};

/**
 * Generates debug file names for Adobe processing
 * @param userId - The user's ID
 * @param originalFilename - The original filename
 * @param fileType - Type of debug file (zip, text, json)
 * @returns Formatted debug filename
 */
export const generateDebugFileName = (userId: string, originalFilename: string, fileType: 'zip' | 'text' | 'json'): string => {
  const baseFileName = generateStandardFileName(userId, originalFilename);
  const extension = fileType === 'zip' ? '.zip' : fileType === 'json' ? '.json' : '.txt';
  
  // Remove the original extension and add debug type
  const nameWithoutExt = baseFileName.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExt}_debug${extension}`;
};

/**
 * Extracts components from a standardized filename
 * @param filename - The standardized filename
 * @returns Object containing userId, originalName, and timestamp
 */
export const parseStandardFileName = (filename: string): { userId: string; originalName: string; timestamp: string } | null => {
  // Try new format first (with hyphens)
  let parts = filename.split('-');
  if (parts.length >= 3) {
    const userId = parts[0];
    const timestamp = parts[parts.length - 1];
    const originalName = parts.slice(1, -1).join('-');
    return { userId, originalName, timestamp };
  }
  
  // Fallback to old format (with underscores) for backward compatibility
  parts = filename.split('_');
  if (parts.length >= 3) {
    const userId = parts[0];
    const timestamp = parts[parts.length - 1];
    const originalName = parts.slice(1, -1).join('_');
    return { userId, originalName, timestamp };
  }
  
  return null;
};