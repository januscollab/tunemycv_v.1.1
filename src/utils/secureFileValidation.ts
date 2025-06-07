
import { validateFile, formatFileSize } from '@/utils/fileUtils';
import { sanitizeFileName, isAllowedFileType, isValidFileSize } from '@/utils/inputSanitization';

interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedName?: string;
}

// Comprehensive file type validation
const ALLOWED_CV_EXTENSIONS = ['pdf', 'docx', 'txt'];
const ALLOWED_JOB_DESC_EXTENSIONS = ['pdf', 'docx', 'txt'];
const DANGEROUS_EXTENSIONS = ['exe', 'bat', 'cmd', 'com', 'scr', 'vbs', 'js', 'jar'];

// MIME type validation for additional security
const ALLOWED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt'
};

export const validateFileSecurely = (file: File, type: 'cv' | 'job_description'): FileValidationResult => {
  const errors: string[] = [];
  
  // Basic file existence check
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }

  // Sanitize filename
  const sanitizedName = sanitizeFileName(file.name);
  if (!sanitizedName) {
    errors.push('Invalid filename');
    return { isValid: false, errors };
  }

  // Check for dangerous file extensions
  const extension = sanitizedName.split('.').pop()?.toLowerCase();
  if (extension && DANGEROUS_EXTENSIONS.includes(extension)) {
    errors.push('File type not allowed for security reasons');
    return { isValid: false, errors };
  }

  // Validate file extension
  const allowedExtensions = type === 'cv' ? ALLOWED_CV_EXTENSIONS : ALLOWED_JOB_DESC_EXTENSIONS;
  if (!isAllowedFileType(sanitizedName, allowedExtensions)) {
    errors.push(`File must be one of: ${allowedExtensions.join(', ').toUpperCase()}`);
  }

  // Validate MIME type
  if (file.type && !Object.keys(ALLOWED_MIME_TYPES).includes(file.type)) {
    errors.push('Invalid file format detected');
  }

  // Validate file size (5MB for CV, 10MB for job descriptions)
  const maxSize = type === 'cv' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
  if (!isValidFileSize(file.size, maxSize)) {
    errors.push(`File size must be less than ${formatFileSize(maxSize)}`);
  }

  // Additional security checks
  if (file.size === 0) {
    errors.push('File appears to be empty');
  }

  if (file.size > 50 * 1024 * 1024) { // Hard limit of 50MB
    errors.push('File size exceeds maximum allowed limit');
  }

  // Check filename length
  if (sanitizedName.length > 255) {
    errors.push('Filename is too long');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedName
  };
};

export const createSecureFileObject = (file: File, sanitizedName: string): File => {
  // Create a new File object with sanitized name
  return new File([file], sanitizedName, {
    type: file.type,
    lastModified: file.lastModified
  });
};
