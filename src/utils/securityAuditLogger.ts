interface SecurityEvent {
  type: 'auth_failure' | 'suspicious_upload' | 'rate_limit_exceeded' | 'admin_action';
  userId?: string;
  details: Record<string, any>;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
}

class SecurityAuditLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;

  logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      // Note: IP address would need to be obtained from server-side
    };

    this.events.push(fullEvent);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Security Event]', fullEvent);
    }

    // In production, this could send to monitoring service
    this.sendToMonitoring(fullEvent);
  }

  private sendToMonitoring(event: SecurityEvent) {
    // Implementation would send to monitoring service
    // For now, store in localStorage for debugging
    try {
      const existingLogs = localStorage.getItem('security_audit_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(event);
      
      // Keep only last 100 events in localStorage
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('security_audit_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store security audit log:', error);
    }
  }

  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  getEventsByType(type: SecurityEvent['type']): SecurityEvent[] {
    return this.events.filter(event => event.type === type);
  }
}

export const securityLogger = new SecurityAuditLogger();

// Helper functions for common security events
export const logAuthFailure = (email: string, reason: string) => {
  securityLogger.logEvent({
    type: 'auth_failure',
    details: {
      email: email.substring(0, 3) + '***', // Partial email for privacy
      reason,
      timestamp: new Date().toISOString()
    }
  });
};

export const logSuspiciousUpload = (fileName: string, reason: string, userId?: string) => {
  securityLogger.logEvent({
    type: 'suspicious_upload',
    userId,
    details: {
      fileName: fileName.substring(0, 10) + '***', // Partial filename
      reason,
      fileSize: 'redacted'
    }
  });
};

export const logRateLimitExceeded = (identifier: string, attemptCount: number) => {
  securityLogger.logEvent({
    type: 'rate_limit_exceeded',
    details: {
      identifier: identifier.substring(0, 5) + '***',
      attemptCount,
      action: 'login_attempt'
    }
  });
};

export const logAdminAction = (userId: string, action: string, target?: string) => {
  securityLogger.logEvent({
    type: 'admin_action',
    userId,
    details: {
      action,
      target,
      adminUser: userId.substring(0, 8) + '***'
    }
  });
};
