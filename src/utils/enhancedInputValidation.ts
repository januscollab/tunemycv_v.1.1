
import { sanitizeText, sanitizeEmail } from '@/utils/inputSanitization';

// Enhanced content length limits
export const CONTENT_LIMITS = {
  CV_TEXT: 50000, // 50KB
  JOB_DESCRIPTION_TEXT: 25000, // 25KB
  USER_INPUT: 10000, // 10KB for general user input
  ANALYSIS_PROMPT: 15000, // 15KB for AI analysis prompts
};

interface ValidationResult {
  isValid: boolean;
  sanitizedValue?: string;
  errors: string[];
  warnings: string[];
}

export const validateAndSanitizeContent = (
  content: string,
  type: keyof typeof CONTENT_LIMITS,
  additionalRules?: {
    minLength?: number;
    requireAlphanumeric?: boolean;
    allowHtml?: boolean;
  }
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!content || typeof content !== 'string') {
    errors.push('Content is required and must be text');
    return { isValid: false, errors, warnings };
  }

  // Check length limits
  const maxLength = CONTENT_LIMITS[type];
  if (content.length > maxLength) {
    errors.push(`Content exceeds maximum length of ${maxLength} characters`);
  }

  // Check minimum length if specified
  if (additionalRules?.minLength && content.trim().length < additionalRules.minLength) {
    errors.push(`Content must be at least ${additionalRules.minLength} characters long`);
  }

  // Sanitize content
  let sanitizedValue = additionalRules?.allowHtml ? content : sanitizeText(content);
  
  // Check for alphanumeric requirement
  if (additionalRules?.requireAlphanumeric && !/[a-zA-Z0-9]/.test(sanitizedValue)) {
    errors.push('Content must contain at least one alphanumeric character');
  }

  // Detect potential security issues
  const suspiciousPatterns = [
    { pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/gi, message: 'Script tags detected' },
    { pattern: /javascript:/gi, message: 'JavaScript protocol detected' },
    { pattern: /vbscript:/gi, message: 'VBScript protocol detected' },
    { pattern: /on\w+\s*=\s*["'][^"']*["']/gi, message: 'Event handlers detected' },
    { pattern: /<iframe[\s\S]*?>/gi, message: 'Iframe tags detected' },
  ];

  suspiciousPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(content)) {
      if (!additionalRules?.allowHtml) {
        errors.push(`Security risk: ${message}`);
      } else {
        warnings.push(`Potential security risk: ${message}`);
      }
    }
  });

  // Check for excessively long lines (potential DoS)
  const lines = sanitizedValue.split('\n');
  const longLines = lines.filter(line => line.length > 1000);
  if (longLines.length > 0) {
    warnings.push(`${longLines.length} line(s) exceed recommended length`);
  }

  // Check for repeated patterns (potential spam/DoS)
  const repeatedPatterns = /(.{10,})\1{5,}/g;
  if (repeatedPatterns.test(sanitizedValue)) {
    warnings.push('Repeated content patterns detected');
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue: errors.length === 0 ? sanitizedValue : undefined,
    errors,
    warnings
  };
};

export const validateAnalysisInput = (cvText: string, jobDescription: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate CV text
  const cvValidation = validateAndSanitizeContent(cvText, 'CV_TEXT', {
    minLength: 100,
    requireAlphanumeric: true
  });
  
  if (!cvValidation.isValid) {
    errors.push(...cvValidation.errors.map(e => `CV: ${e}`));
  }
  warnings.push(...cvValidation.warnings.map(w => `CV: ${w}`));

  // Validate job description
  const jobValidation = validateAndSanitizeContent(jobDescription, 'JOB_DESCRIPTION_TEXT', {
    minLength: 50,
    requireAlphanumeric: true
  });
  
  if (!jobValidation.isValid) {
    errors.push(...jobValidation.errors.map(e => `Job Description: ${e}`));
  }
  warnings.push(...jobValidation.warnings.map(w => `Job Description: ${w}`));

  // Check total combined length
  const totalLength = cvText.length + jobDescription.length;
  if (totalLength > CONTENT_LIMITS.ANALYSIS_PROMPT) {
    errors.push('Combined content exceeds analysis limit');
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue: cvValidation.isValid && jobValidation.isValid 
      ? JSON.stringify({ cv: cvValidation.sanitizedValue, job: jobValidation.sanitizedValue })
      : undefined,
    errors,
    warnings
  };
};

export const validateEmailSecurely = (email: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
    return { isValid: false, errors, warnings };
  }

  const sanitizedEmail = sanitizeEmail(email);
  
  // Enhanced email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(sanitizedEmail)) {
    errors.push('Invalid email format');
  }

  if (sanitizedEmail.length > 254) {
    errors.push('Email address too long');
  }

  // Check for suspicious email patterns
  const suspiciousPatterns = [
    /\+.*\+/g, // Multiple plus signs
    /\.{2,}/g, // Multiple consecutive dots
    /@.*@/g, // Multiple @ symbols
  ];

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(sanitizedEmail)) {
      warnings.push('Unusual email format detected');
    }
  });

  return {
    isValid: errors.length === 0,
    sanitizedValue: errors.length === 0 ? sanitizedEmail : undefined,
    errors,
    warnings
  };
};
