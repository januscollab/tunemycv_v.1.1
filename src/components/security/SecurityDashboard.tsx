
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Activity, Eye, EyeOff } from 'lucide-react';
import { securityLogger } from '@/utils/securityAuditLogger';

const SecurityDashboard: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Load security events from logger
    const events = securityLogger.getRecentEvents(20);
    setSecurityEvents(events);
  }, []);

  const getEventBadgeVariant = (type: string) => {
    switch (type) {
      case 'auth_failure':
        return 'destructive';
      case 'suspicious_upload':
        return 'destructive';
      case 'rate_limit_exceeded':
        return 'secondary';
      case 'admin_action':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getEventsByType = (type: string) => {
    return securityEvents.filter(event => event.type === type).length;
  };

  const clearLogs = () => {
    localStorage.removeItem('security_audit_logs');
    setSecurityEvents([]);
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auth Failures</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getEventsByType('auth_failure')}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Uploads</CardTitle>
            <Shield className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getEventsByType('suspicious_upload')}</div>
            <p className="text-xs text-muted-foreground">Blocked attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limits</CardTitle>
            <Activity className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getEventsByType('rate_limit_exceeded')}</div>
            <p className="text-xs text-muted-foreground">Rate limited users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getEventsByType('admin_action')}</div>
            <p className="text-xs text-muted-foreground">Administrative events</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Events Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Events Log
              </CardTitle>
              <CardDescription>
                Recent security events and audit trail
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                Clear Logs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {securityEvents.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No security events recorded
            </p>
          ) : (
            <div className="space-y-2">
              {securityEvents.slice(0, 10).map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={getEventBadgeVariant(event.type)}>
                      {event.type.replace('_', ' ')}
                    </Badge>
                    <div>
                      <div className="font-medium">
                        {event.type === 'auth_failure' && 'Authentication Failed'}
                        {event.type === 'suspicious_upload' && 'Suspicious File Upload'}
                        {event.type === 'rate_limit_exceeded' && 'Rate Limit Exceeded'}
                        {event.type === 'admin_action' && 'Admin Action Performed'}
                      </div>
                      {showDetails && (
                        <div className="text-sm text-muted-foreground">
                          {JSON.stringify(event.details, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
