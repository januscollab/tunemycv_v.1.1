import { z } from 'zod';

// Enhanced input validation schemas
export const secureTextSchema = z
  .string()
  .min(1, 'This field is required')
  .max(50000, 'Text exceeds maximum length')
  .refine(
    (value) => {
      // Check for potential XSS patterns
      const suspiciousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
        /eval\s*\(/gi,
        /expression\s*\(/gi,
      ];
      
      return !suspiciousPatterns.some(pattern => pattern.test(value));
    },
    {
      message: 'Invalid content detected. Please remove any script tags or suspicious code.',
    }
  );

export const secureCVTextSchema = z
  .string()
  .min(50, 'CV text must be at least 50 characters long')
  .max(50000, 'CV text exceeds maximum length of 50,000 characters')
  .refine(
    (value) => {
      // Check for potential XSS patterns
      const suspiciousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
        /eval\s*\(/gi,
        /expression\s*\(/gi,
      ];
      
      return !suspiciousPatterns.some(pattern => pattern.test(value));
    },
    {
      message: 'Invalid content detected. Please remove any script tags or suspicious code.',
    }
  );

export const secureJobDescriptionSchema = z
  .string()
  .min(50, 'Job description must be at least 50 characters long')
  .max(20000, 'Job description exceeds maximum length of 20,000 characters')
  .refine(
    (value) => {
      // Check for potential XSS patterns
      const suspiciousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
        /eval\s*\(/gi,
        /expression\s*\(/gi,
      ];
      
      return !suspiciousPatterns.some(pattern => pattern.test(value));
    },
    {
      message: 'Invalid content detected. Please remove any script tags or suspicious code.',
    }
  );

export const secureJobTitleSchema = z
  .string()
  .min(1, 'Job title is required')
  .max(100, 'Job title exceeds maximum length')
  .refine(
    (value) => {
      // Basic sanitization for job titles
      const cleaned = value.trim();
      return cleaned.length > 0 && !/[<>]/g.test(cleaned);
    },
    {
      message: 'Invalid characters detected in job title',
    }
  );

export const secureEmailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long')
  .refine(
    (value) => {
      // Additional email security checks
      const suspicious = [
        /javascript:/gi,
        /<script/gi,
        /on\w+\s*=/gi,
      ];
      
      return !suspicious.some(pattern => pattern.test(value));
    },
    {
      message: 'Invalid email format detected',
    }
  );

export const secureNameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name is too long')
  .refine(
    (value) => {
      // Only allow letters, spaces, hyphens, and apostrophes
      return /^[a-zA-Z\s\-']+$/.test(value.trim());
    },
    {
      message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    }
  );

export const securePhoneSchema = z
  .string()
  .optional()
  .refine(
    (value) => {
      if (!value) return true; // Optional field
      // Only allow digits, spaces, hyphens, parentheses, and plus signs
      return /^[\d\s\-\(\)\+]+$/.test(value);
    },
    {
      message: 'Phone number can only contain digits, spaces, hyphens, parentheses, and plus signs',
    }
  );

export const secureUrlSchema = z
  .string()
  .optional()
  .refine(
    (value) => {
      if (!value) return true; // Optional field
      
      try {
        const url = new URL(value);
        // Only allow https and http protocols
        return ['https:', 'http:'].includes(url.protocol);
      } catch {
        return false;
      }
    },
    {
      message: 'Please enter a valid URL starting with http:// or https://',
    }
  );

// Utility function to sanitize text input
export const sanitizeTextInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/script/gi, '') // Remove script references
    .replace(/eval\s*\(/gi, '') // Remove eval calls
    .replace(/expression\s*\(/gi, ''); // Remove CSS expressions
};

// Rate limiting helper for frontend
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }
    
    const userRequests = requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
    
    return true; // Request allowed
  };
};

// Enhanced file validation
export const validateFileSecurely = (file: File): { isValid: boolean; error?: string } => {
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }
  
  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only PDF, DOC, DOCX, and TXT files are allowed' };
  }
  
  // Check file name for suspicious patterns
  const suspiciousExtensions = /\.(exe|bat|cmd|scr|pif|jar|js|vbs|ps1|sh)$/i;
  if (suspiciousExtensions.test(file.name)) {
    return { isValid: false, error: 'File type not allowed for security reasons' };
  }
  
  // Check for path traversal attempts in filename
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return { isValid: false, error: 'Invalid file name' };
  }
  
  return { isValid: true };
};