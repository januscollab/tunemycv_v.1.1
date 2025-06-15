import { useEffect, useCallback } from 'react';
import { validateSecureContent, logSecurityEvent } from '@/utils/enhancedSecurityValidation';

interface SecurityMetrics {
  suspiciousActivity: number;
  blockedAttempts: number;
  lastThreatDetection: Date | null;
}

interface SecurityThreat {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
}

export const useSecurityMonitoring = () => {
  // Monitor for suspicious input patterns
  const monitorInput = useCallback((input: string, context: string): SecurityThreat[] => {
    const threats: SecurityThreat[] = [];
    
    // Validate content for security threats
    const validation = validateSecureContent(input, 'text');
    
    if (!validation.isValid) {
      validation.threats.forEach(threat => {
        threats.push({
          type: 'INPUT_VALIDATION_FAILED',
          severity: threat.includes('XSS') ? 'high' : 'medium',
          description: `Security threat detected in ${context}: ${threat}`,
          timestamp: new Date()
        });
        
        // Log security event
        logSecurityEvent('INPUT_THREAT_DETECTED', {
          context,
          threat,
          input: input.substring(0, 100) // Only log first 100 chars for privacy
        });
      });
    }
    
    return threats;
  }, []);

  // Monitor for anomalous user behavior
  const detectAnomalousActivity = useCallback((activityData: {
    rapidRequests?: number;
    failedAttempts?: number;
    suspiciousPatterns?: string[];
  }): SecurityThreat[] => {
    const threats: SecurityThreat[] = [];
    
    // Detect rapid-fire requests (potential bot activity)
    if (activityData.rapidRequests && activityData.rapidRequests > 10) {
      threats.push({
        type: 'RAPID_REQUESTS',
        severity: 'medium',
        description: `Unusually high request rate detected: ${activityData.rapidRequests} requests`,
        timestamp: new Date()
      });
    }
    
    // Detect multiple failed attempts
    if (activityData.failedAttempts && activityData.failedAttempts > 5) {
      threats.push({
        type: 'MULTIPLE_FAILURES',
        severity: 'high',
        description: `Multiple failed attempts detected: ${activityData.failedAttempts} failures`,
        timestamp: new Date()
      });
    }
    
    // Check for suspicious patterns
    if (activityData.suspiciousPatterns && activityData.suspiciousPatterns.length > 0) {
      threats.push({
        type: 'SUSPICIOUS_PATTERNS',
        severity: 'high',
        description: `Suspicious patterns detected: ${activityData.suspiciousPatterns.join(', ')}`,
        timestamp: new Date()
      });
    }
    
    return threats;
  }, []);

  // Real-time threat response
  const respondToThreat = useCallback((threat: SecurityThreat) => {
    console.warn(`Security Threat Detected: ${threat.type}`, threat);
    
    // Log to security monitoring
    logSecurityEvent(threat.type, {
      severity: threat.severity,
      description: threat.description,
      timestamp: threat.timestamp.toISOString()
    });
    
    // Trigger immediate actions for critical threats
    if (threat.severity === 'critical') {
      console.error('CRITICAL THREAT - IMMEDIATE ACTION REQUIRED', threat);
      // Could trigger immediate session termination, account suspension, etc.
    }
  }, []);

  // Initialize security monitoring
  useEffect(() => {
    // Set up global error handler for security events
    const handleSecurityError = (event: ErrorEvent) => {
      if (event.error && event.error.message) {
        const threat = monitorInput(event.error.message, 'global_error');
        threat.forEach(respondToThreat);
      }
    };

    // Set up unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && typeof event.reason === 'string') {
        const threat = monitorInput(event.reason, 'unhandled_promise');
        threat.forEach(respondToThreat);
      }
    };

    window.addEventListener('error', handleSecurityError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleSecurityError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [monitorInput, respondToThreat]);

  return {
    monitorInput,
    detectAnomalousActivity,
    respondToThreat
  };
};