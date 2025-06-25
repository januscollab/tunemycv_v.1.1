// Enhanced Security Validation for XSS and Prompt Injection Prevention

// Enhanced HTML sanitization configuration
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  ALLOWED_ATTR: ['style'],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onsubmit'],
  ALLOW_DATA_ATTR: false,
  WHOLE_DOCUMENT: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false
};

// Comprehensive XSS patterns
const XSS_PATTERNS = [
  // Script injection
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  
  // Event handlers
  /on\w+\s*=/gi,
  /fscommand/gi,
  /seeksegmenttime/gi,
  
  // Meta and style injection
  /<meta\b[^>]*>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /expression\s*\(/gi,
  /@import/gi,
  /behavior\s*:/gi,
  
  // Object/embed injection
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi,
  
  // Form injection
  /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
  /<input\b[^>]*>/gi,
  /<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi,
  
  // Protocol handlers
  /mocha:/gi,
  /livescript:/gi,
  /disk:/gi,
  /about:/gi,
  
  // SQL Injection patterns
  /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/gi,
  /(--|\#|\/\*|\*\/)/g,
  
  // Command injection
  /(\||&|;|\$\(|\`|\\)/g,
  
  // Path traversal
  /\.\.[\/\\]/g,
  /\%2e\%2e[\/\\]/gi,
  /\%252e\%252e[\/\\]/gi
];

// Prompt injection patterns for AI content
const PROMPT_INJECTION_PATTERNS = [
  // Direct command injection
  /ignore\s+(previous|all)\s+(instructions?|prompts?)/gi,
  /forget\s+(everything|all)\s+(above|before)/gi,
  /new\s+instructions?:/gi,
  /system\s*:\s*/gi,
  /assistant\s*:\s*/gi,
  /human\s*:\s*/gi,
  /<\|.*?\|>/gi, // Special tokens
  
  // Role manipulation
  /act\s+as\s+(if\s+you\s+are\s+)?a?\s*(different|new|another)/gi,
  /pretend\s+(to\s+be|you\s+are)/gi,
  /roleplay\s+as/gi,
  /you\s+are\s+now\s+a/gi,
  
  // Instruction overrides
  /override\s+(all|previous)\s+(rules|instructions)/gi,
  /disable\s+(safety|content)\s+(filters?|restrictions?)/gi,
  /bypass\s+(safety|security)\s+(measures?|restrictions?)/gi,
  
  // Information extraction
  /tell\s+me\s+(about\s+)?(your|the)\s+(system|instructions|prompts?)/gi,
  /what\s+(are\s+)?(your|the)\s+(original\s+)?(instructions|prompts?|rules)/gi,
  /reveal\s+(your|the)\s+(prompt|instructions|system)/gi,
  
  // Jailbreak attempts
  /jailbreak/gi,
  /DAN\s+(mode|prompt)/gi,
  /developer\s+mode/gi,
  /admin\s+mode/gi,
  
  // Encoding attempts
  /\\x[0-9a-f]{2}/gi,
  /&#x?[0-9a-f]+;/gi,
  /%[0-9a-f]{2}/gi,
  
  // Base64 encoded payloads
  /[A-Za-z0-9+\/]{20,}={0,2}/g // Potential base64
];

// Enhanced HTML sanitization (manual implementation for better compatibility)
export const sanitizeHtmlContent = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  // First pass: Remove dangerous patterns
  let sanitized = html;
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Second pass: Manual sanitization with whitelist approach
  const allowedTags = SANITIZE_CONFIG.ALLOWED_TAGS;
  const forbiddenTags = SANITIZE_CONFIG.FORBID_TAGS;
  const forbiddenAttrs = SANITIZE_CONFIG.FORBID_ATTR;
  
  // Remove forbidden tags
  forbiddenTags.forEach(tag => {
    const regex = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Remove forbidden attributes
  forbiddenAttrs.forEach(attr => {
    const regex = new RegExp(`\\s${attr}\\s*=\\s*[^>]*`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Remove any remaining script-like content
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  return sanitized;
};

// Prompt injection detection and prevention
export const validatePromptContent = (content: string): { isValid: boolean; threats: string[] } => {
  if (!content || typeof content !== 'string') {
    return { isValid: false, threats: ['Empty or invalid content'] };
  }
  
  const threats: string[] = [];
  const contentLower = content.toLowerCase();
  
  // Check for prompt injection patterns
  PROMPT_INJECTION_PATTERNS.forEach((pattern, index) => {
    if (pattern.test(content)) {
      switch (index) {
        case 0:
        case 1:
        case 2:
          threats.push('Instruction override attempt detected');
          break;
        case 3:
        case 4:
        case 5:
          threats.push('Special token injection detected');
          break;
        case 6:
        case 7:
        case 8:
        case 9:
          threats.push('Role manipulation attempt detected');
          break;
        case 10:
        case 11:
        case 12:
          threats.push('Security bypass attempt detected');
          break;
        case 13:
        case 14:
        case 15:
          threats.push('Information extraction attempt detected');
          break;
        case 16:
        case 17:
        case 18:
        case 19:
          threats.push('Jailbreak attempt detected');
          break;
        case 20:
        case 21:
        case 22:
          threats.push('Encoded payload detected');
          break;
        case 23:
          threats.push('Potential base64 encoded payload detected');
          break;
        default:
          threats.push('Suspicious pattern detected');
      }
    }
  });
  
  // Check for excessive special characters (potential obfuscation)
  const specialCharRatio = (content.match(/[^\w\s]/g) || []).length / content.length;
  if (specialCharRatio > 0.3) {
    threats.push('High special character ratio - potential obfuscation');
  }
  
  // Check for excessive repetition (potential token stuffing)
  const repeatedPatterns = content.match(/(.{3,})\1{3,}/g);
  if (repeatedPatterns && repeatedPatterns.length > 0) {
    threats.push('Repeated pattern detected - potential token stuffing');
  }
  
  // Check for extremely long inputs (potential overflow attack)
  if (content.length > 50000) {
    threats.push('Content exceeds maximum safe length');
  }
  
  return {
    isValid: threats.length === 0,
    threats
  };
};

// Comprehensive content validation
export const validateSecureContent = (content: string, type: 'html' | 'prompt' | 'text' = 'text'): {
  isValid: boolean;
  sanitizedContent?: string;
  threats: string[];
} => {
  const threats: string[] = [];
  let sanitizedContent = content;
  
  if (!content || typeof content !== 'string') {
    return { isValid: false, threats: ['Invalid content type'], sanitizedContent: '' };
  }
  
  // Basic XSS check for all content types
  XSS_PATTERNS.forEach(pattern => {
    if (pattern.test(content)) {
      threats.push('XSS pattern detected');
      sanitizedContent = sanitizedContent.replace(pattern, '');
    }
  });
  
  // Type-specific validation
  switch (type) {
    case 'html':
      sanitizedContent = sanitizeHtmlContent(sanitizedContent);
      break;
      
    case 'prompt':
      const promptValidation = validatePromptContent(sanitizedContent);
      threats.push(...promptValidation.threats);
      break;
      
    case 'text':
      // Additional text-specific sanitization
      sanitizedContent = sanitizedContent
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
      break;
  }
  
  return {
    isValid: threats.length === 0,
    sanitizedContent,
    threats
  };
};

// Rate limiting for security operations
class SecurityRateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  
  constructor(maxAttempts = 10, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }
  
  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);
    
    if (!attempt || now - attempt.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return false;
    }
    
    if (attempt.count >= this.maxAttempts) {
      return true;
    }
    
    attempt.count++;
    attempt.lastAttempt = now;
    return false;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const securityRateLimiter = new SecurityRateLimiter();

// Security event logging for frontend
export const logSecurityEvent = (eventType: string, details: any = {}) => {
  console.warn(`Security Event: ${eventType}`, details);
  
  // In production, this could send to a security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service
    // fetch('/api/security-events', { method: 'POST', body: JSON.stringify({ eventType, details }) });
  }
};
