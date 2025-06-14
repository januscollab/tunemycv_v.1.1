import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

// Security: Input validation and sanitization utilities
export const validateInput = (input: any, fieldName: string, maxLength: number = 50000): string => {
  if (!input || typeof input !== 'string') {
    throw new Error(`Invalid ${fieldName}: must be a non-empty string`)
  }
  
  const trimmed = input.trim()
  if (trimmed.length === 0) {
    throw new Error(`${fieldName} cannot be empty`)
  }
  
  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} too long: maximum ${maxLength} characters allowed`)
  }
  
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
  
  if (suspiciousPatterns.some(pattern => pattern.test(trimmed))) {
    throw new Error(`Invalid content detected in ${fieldName}`)
  }
  
  return trimmed
}

// Security: Email validation
export const validateEmail = (email: any): string => {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email: must be a non-empty string')
  }
  
  const trimmed = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(trimmed) || trimmed.length > 254) {
    throw new Error('Invalid email format')
  }
  
  return trimmed
}

// Security: File name validation
export const validateFileName = (fileName: any): string => {
  if (!fileName || typeof fileName !== 'string') {
    throw new Error('Invalid file name: must be a non-empty string')
  }
  
  const trimmed = fileName.trim()
  
  // Check for path traversal attempts
  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) {
    throw new Error('Invalid file name: contains illegal characters')
  }
  
  // Check for dangerous extensions
  const dangerousExtensions = /\.(exe|bat|cmd|scr|pif|jar|js|vbs|ps1|sh)$/i
  if (dangerousExtensions.test(trimmed)) {
    throw new Error('File type not allowed for security reasons')
  }
  
  if (trimmed.length > 255) {
    throw new Error('File name too long')
  }
  
  return trimmed
}

// Security: Authenticate user and get Supabase client
export const authenticateUser = async (req: Request) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header')
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  )

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  return { user, supabaseClient }
}

// Security: Enhanced rate limiting using database
export const checkEnhancedRateLimit = async (
  supabaseClient: any,
  identifier: string,
  endpoint: string,
  maxRequests: number = 60,
  windowMinutes: number = 1
): Promise<boolean> => {
  try {
    const { data: allowed, error } = await supabaseClient.rpc('check_enhanced_rate_limit', {
      identifier_key: identifier,
      endpoint_name: endpoint,
      max_requests: maxRequests,
      window_minutes: windowMinutes
    });
    
    if (error) {
      console.error('Rate limiting check failed:', error);
      return false; // Fail closed for security
    }
    
    return allowed;
  } catch (error) {
    console.error('Rate limiting error:', error);
    return false; // Fail closed for security
  }
};

// Security: Log security events with enhanced incident tracking
export const logSecurityEvent = async (
  supabaseClient: any,
  eventType: string,
  details: any,
  userId?: string,
  severity: string = 'info',
  endpoint?: string,
  userAgent?: string
) => {
  try {
    await supabaseClient.rpc('log_security_incident', {
      incident_type: eventType,
      incident_details: details,
      target_user_id: userId,
      severity: severity,
      endpoint_name: endpoint
    });
    
    // For high severity incidents, also trigger immediate alerts
    if (severity === 'high' || severity === 'critical') {
      console.error(`SECURITY ALERT [${severity.toUpperCase()}]: ${eventType}`, {
        details,
        userId,
        endpoint,
        userAgent,
        timestamp: new Date().toISOString()
      });
      
      // Real-time threat detection - trigger immediate response
      if (severity === 'critical') {
        // Could trigger immediate user session termination or account suspension
        console.error('CRITICAL SECURITY THREAT DETECTED - IMMEDIATE ACTION REQUIRED');
      }
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Security: Sanitize error responses
export const getSecureErrorResponse = (error: any, endpoint: string) => {
  const message = error.message || ''
  
  if (message === 'Unauthorized' || message === 'Missing or invalid authorization header') {
    return { message: 'Unauthorized', status: 401 }
  }
  if (message === 'Insufficient credits') {
    return { message: 'Insufficient credits', status: 400 }
  }
  if (message === 'User ID mismatch') {
    return { message: 'Invalid request', status: 400 }
  }
  if (message.includes('Invalid') && message.includes('content detected')) {
    return { message: 'Invalid input detected', status: 400 }
  }
  if (message.includes('too long')) {
    return { message: 'Input exceeds maximum length', status: 400 }
  }
  if (message.includes('Invalid email')) {
    return { message: 'Invalid email format', status: 400 }
  }
  if (message.includes('File type not allowed')) {
    return { message: 'File type not allowed', status: 400 }
  }
  if (message.includes('File name too long')) {
    return { message: 'File name too long', status: 400 }
  }
  if (message.includes('cannot be empty')) {
    return { message: 'Required field is empty', status: 400 }
  }
  
  // Generic error for unexpected issues - don't leak internal details
  console.error(`${endpoint} error:`, error)
  return { message: 'An error occurred processing your request', status: 500 }
}

// Security: Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export const checkRateLimit = (identifier: string, maxRequests: number = 60, windowMs: number = 60000): boolean => {
  const now = Date.now()
  const windowStart = now - windowMs
  
  const current = rateLimitMap.get(identifier)
  
  if (!current || current.resetTime < windowStart) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

// Security: Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key)
    }
  }
}, 300000) // Clean up every 5 minutes