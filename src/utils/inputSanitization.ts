
// HTML sanitization utility
export const sanitizeHtml = (input: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (s) => map[s]);
};

// General text sanitization
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potential XSS vectors
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

// Email validation and sanitization
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  return email.toLowerCase().trim();
};

// File name sanitization
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== 'string') return '';
  
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '') // Allow only alphanumeric, dots, underscores, hyphens
    .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
    .substring(0, 255); // Limit length
};

// Validate file type
export const isAllowedFileType = (fileName: string, allowedTypes: string[]): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
};

// Maximum file size validation (in bytes)
export const isValidFileSize = (size: number, maxSize: number = 10 * 1024 * 1024): boolean => {
  return size <= maxSize;
};
