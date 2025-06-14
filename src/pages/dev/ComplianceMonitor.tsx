import React, { useState, useEffect } from 'react';
import { Monitor, Play, Pause, Settings, Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface MonitorEvent {
  id: string;
  timestamp: Date;
  type: 'violation_detected' | 'violation_fixed' | 'rule_updated' | 'auto_fix_applied';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  file?: string;
  element?: string;
}

interface MonitorRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'critical' | 'warning' | 'minor';
  category: 'colors' | 'spacing' | 'typography' | 'components';
}

const ComplianceMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [events, setEvents] = useState<MonitorEvent[]>([]);
  const [rules, setRules] = useState<MonitorRule[]>([
    {
      id: '1',
      name: 'Hardcoded Colors',
      description: 'Detect usage of hardcoded color classes like bg-blue-500',
      enabled: true,
      severity: 'critical',
      category: 'colors'
    },
    {
      id: '2',
      name: 'Inline Styles',
      description: 'Detect inline style attributes that should use design system classes',
      enabled: true,
      severity: 'warning',
      category: 'components'
    },
    {
      id: '3',
      name: 'Non-Standard Spacing',
      description: 'Detect spacing values outside the design system scale',
      enabled: true,
      severity: 'warning',
      category: 'spacing'
    },
    {
      id: '4',
      name: 'Custom Typography',
      description: 'Detect custom font definitions not using design system tokens',
      enabled: false,
      severity: 'minor',
      category: 'typography'
    }
  ]);
  const [stats, setStats] = useState({
    violationsToday: 12,
    violationsFixed: 8,
    autoFixesApplied: 5,
    complianceScore: 87
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isMonitoring) {
      // Simulate real-time monitoring events
      const interval = setInterval(() => {
        const mockEvent: MonitorEvent = {
          id: Date.now().toString(),
          timestamp: new Date(),
          type: Math.random() > 0.5 ? 'violation_detected' : 'violation_fixed',
          severity: Math.random() > 0.7 ? 'critical' : 'warning',
          message: Math.random() > 0.5 
            ? 'Hardcoded color detected in Button component'
            : 'Inline style violation fixed automatically',
          file: `src/components/${Math.random() > 0.5 ? 'ui' : 'layout'}/Component.tsx`,
          element: Math.random() > 0.5 ? 'Button' : 'div'
        };

        setEvents(prev => [mockEvent, ...prev.slice(0, 49)]); // Keep last 50 events
      }, 3000 + Math.random() * 7000); // Random interval 3-10 seconds

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    toast({
      title: isMonitoring ? 'Monitoring Stopped' : 'Monitoring Started',
      description: isMonitoring 
        ? 'Real-time compliance monitoring has been stopped'
        : 'Real-time compliance monitoring is now active',
    });
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const clearEvents = () => {
    setEvents([]);
    toast({
      title: 'Events Cleared',
      description: 'All monitoring events have been cleared',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-destructive';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-info';
      default:
        return 'text-muted-foreground';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'violation_detected':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'violation_fixed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'auto_fix_applied':
        return <Settings className="h-4 w-4 text-info" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      colors: 'bg-destructive-50 text-destructive',
      spacing: 'bg-warning-50 text-warning',
      typography: 'bg-info-50 text-info',
      components: 'bg-success-50 text-success'
    };
    
    return (
      <Badge variant="outline" className={colors[category as keyof typeof colors] || ''}>
        {category}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-space-1.5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-space-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-title font-bold text-foreground mb-space-0.5">
                Compliance Monitor
              </h1>
              <p className="text-muted-foreground">
                Real-time monitoring of design system compliance violations
              </p>
            </div>
            <div className="flex items-center gap-space-0.75">
              <div className="flex items-center gap-space-0.5">
                <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-success animate-pulse' : 'bg-muted'}`} />
                <span className="text-caption text-muted-foreground">
                  {isMonitoring ? 'Active' : 'Inactive'}
                </span>
              </div>
              <Button
                onClick={toggleMonitoring}
                variant={isMonitoring ? "destructive" : "default"}
                className="flex items-center gap-space-0.5"
              >
                {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isMonitoring ? 'Stop' : 'Start'} Monitor
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-1.5 mb-space-2">
          <Card>
            <CardContent className="p-space-1.5">
              <div className="flex items-center gap-space-0.75">
                <div className="p-space-0.75 rounded-lg bg-destructive-50 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-caption font-medium text-muted-foreground">Violations Today</p>
                  <p className="text-subheading font-semibold text-foreground">
                    {stats.violationsToday}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-space-1.5">
              <div className="flex items-center gap-space-0.75">
                <div className="p-space-0.75 rounded-lg bg-success-50 text-success">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-caption font-medium text-muted-foreground">Fixed</p>
                  <p className="text-subheading font-semibold text-foreground">
                    {stats.violationsFixed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-space-1.5">
              <div className="flex items-center gap-space-0.75">
                <div className="p-space-0.75 rounded-lg bg-info-50 text-info">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-caption font-medium text-muted-foreground">Auto Fixes</p>
                  <p className="text-subheading font-semibold text-foreground">
                    {stats.autoFixesApplied}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-space-1.5">
              <div className="flex items-center gap-space-0.75">
                <div className="p-space-0.75 rounded-lg bg-primary-50 text-primary">
                  <Monitor className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-caption font-medium text-muted-foreground">Compliance</p>
                  <p className="text-subheading font-semibold text-foreground">
                    {stats.complianceScore}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-1.5">
          {/* Events Stream */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Live Events</CardTitle>
                    <CardDescription>
                      Real-time stream of compliance events
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearEvents}>
                    Clear Events
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-space-0.75 max-h-96 overflow-y-auto">
                  {events.length === 0 ? (
                    <div className="text-center py-space-2 text-muted-foreground">
                      {isMonitoring ? 'Monitoring for events...' : 'Start monitoring to see events'}
                    </div>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="flex items-start gap-space-0.75 p-space-0.75 border border-border rounded-lg">
                        {getEventIcon(event.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-space-0.5 mb-space-0.25">
                            <p className="text-caption font-medium text-foreground">
                              {event.message}
                            </p>
                            <Badge variant="outline" className={getSeverityColor(event.severity)}>
                              {event.severity}
                            </Badge>
                          </div>
                          {event.file && (
                            <p className="text-micro text-muted-foreground font-mono">
                              {event.file}
                            </p>
                          )}
                          <div className="flex items-center gap-space-0.25 mt-space-0.25">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-micro text-muted-foreground">
                              {event.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rules Configuration */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Monitoring Rules</CardTitle>
                <CardDescription>
                  Configure which violations to monitor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-space-1">
                  {rules.map((rule) => (
                    <div key={rule.id} className="space-y-space-0.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-space-0.5">
                          <h4 className="text-caption font-medium text-foreground">
                            {rule.name}
                          </h4>
                          {getCategoryBadge(rule.category)}
                        </div>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => toggleRule(rule.id)}
                        />
                      </div>
                      <p className="text-micro text-muted-foreground">
                        {rule.description}
                      </p>
                      <div className="flex items-center gap-space-0.5">
                        <Badge variant="outline" className={
                          rule.severity === 'critical' ? 'text-destructive' :
                          rule.severity === 'warning' ? 'text-warning' :
                          'text-info'
                        }>
                          {rule.severity}
                        </Badge>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceMonitor;