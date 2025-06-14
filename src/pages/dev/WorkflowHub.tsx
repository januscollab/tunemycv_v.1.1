import React, { useState, useEffect } from 'react';
import DevEnvironmentGuard from '@/components/dev/DevEnvironmentGuard';
import DevNavigation from '@/components/dev/DevNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Workflow, 
  GitBranch, 
  Zap, 
  Settings, 
  Play,
  Pause,
  Plus,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  type: 'code_review' | 'testing' | 'deployment' | 'monitoring';
  enabled: boolean;
  trigger: string;
  actions: string[];
  lastRun: Date | null;
  status: 'idle' | 'running' | 'success' | 'error';
}

interface Integration {
  id: string;
  name: string;
  type: 'github' | 'jira' | 'slack' | 'discord' | 'webhook';
  configured: boolean;
  apiKey?: string;
  webhookUrl?: string;
  lastSync: Date | null;
}

const WorkflowHub: React.FC = () => {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load saved data
    const savedWorkflows = localStorage.getItem('dev-workflows');
    const savedIntegrations = localStorage.getItem('dev-integrations');

    if (savedWorkflows) {
      try {
        const parsed = JSON.parse(savedWorkflows).map((w: any) => ({
          ...w,
          lastRun: w.lastRun ? new Date(w.lastRun) : null
        }));
        setWorkflows(parsed);
      } catch (error) {
        console.error('Failed to load workflows:', error);
      }
    } else {
      // Initialize with default workflows
      setWorkflows([
        {
          id: 'auto-review',
          name: 'Automated Code Review',
          description: 'Automatically review code changes and create tasks for issues',
          type: 'code_review',
          enabled: false,
          trigger: 'On file change',
          actions: ['Run ESLint', 'Check TypeScript', 'Create improvement tasks'],
          lastRun: null,
          status: 'idle'
        },
        {
          id: 'test-runner',
          name: 'Continuous Testing',
          description: 'Run tests when code changes and report results',
          type: 'testing',
          enabled: false,
          trigger: 'On commit',
          actions: ['Run unit tests', 'Generate coverage report', 'Update sprint status'],
          lastRun: null,
          status: 'idle'
        },
        {
          id: 'deploy-staging',
          name: 'Auto Deploy to Staging',
          description: 'Deploy to staging environment when tasks are completed',
          type: 'deployment',
          enabled: false,
          trigger: 'Sprint completion',
          actions: ['Build project', 'Deploy to staging', 'Run smoke tests'],
          lastRun: null,
          status: 'idle'
        }
      ]);
    }

    if (savedIntegrations) {
      try {
        const parsed = JSON.parse(savedIntegrations).map((i: any) => ({
          ...i,
          lastSync: i.lastSync ? new Date(i.lastSync) : null
        }));
        setIntegrations(parsed);
      } catch (error) {
        console.error('Failed to load integrations:', error);
      }
    } else {
      // Initialize with default integrations
      setIntegrations([
        {
          id: 'github',
          name: 'GitHub',
          type: 'github',
          configured: false,
          lastSync: null
        },
        {
          id: 'jira',
          name: 'Jira',
          type: 'jira',
          configured: false,
          lastSync: null
        },
        {
          id: 'slack',
          name: 'Slack',
          type: 'slack',
          configured: false,
          lastSync: null
        }
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dev-workflows', JSON.stringify(workflows));
  }, [workflows]);

  useEffect(() => {
    localStorage.setItem('dev-integrations', JSON.stringify(integrations));
  }, [integrations]);

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, enabled: !w.enabled } : w
    ));
    
    const workflow = workflows.find(w => w.id === workflowId);
    toast({
      title: workflow?.enabled ? "Workflow Disabled" : "Workflow Enabled",
      description: `${workflow?.name} has been ${workflow?.enabled ? 'disabled' : 'enabled'}`,
    });
  };

  const runWorkflow = async (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, status: 'running' } : w
    ));

    // Simulate workflow execution
    setTimeout(() => {
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId ? { 
          ...w, 
          status: 'success',
          lastRun: new Date()
        } : w
      ));

      const workflow = workflows.find(w => w.id === workflowId);
      toast({
        title: "Workflow Completed",
        description: `${workflow?.name} executed successfully`,
      });
    }, 2000);
  };

  const addWebhookIntegration = () => {
    if (!newWebhookUrl.trim()) return;

    const newIntegration: Integration = {
      id: `webhook-${Date.now()}`,
      name: 'Custom Webhook',
      type: 'webhook',
      configured: true,
      webhookUrl: newWebhookUrl,
      lastSync: null
    };

    setIntegrations(prev => [...prev, newIntegration]);
    setNewWebhookUrl('');
    
    toast({
      title: "Webhook Added",
      description: "Custom webhook integration has been configured",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Pause className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'code_review': return 'bg-blue-100 text-blue-800';
      case 'testing': return 'bg-green-100 text-green-800';
      case 'deployment': return 'bg-purple-100 text-purple-800';
      case 'monitoring': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DevEnvironmentGuard>
      <DevNavigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workflow & Integration Hub</h1>
            <p className="text-muted-foreground mt-1">
              Automate workflows and connect external tools
            </p>
          </div>
        </div>

        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workflows">Automation Workflows</TabsTrigger>
            <TabsTrigger value="integrations">External Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center space-x-2">
                          <Workflow className="h-5 w-5" />
                          <span>{workflow.name}</span>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {workflow.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(workflow.type)}>
                          {workflow.type.replace('_', ' ')}
                        </Badge>
                        <Switch
                          checked={workflow.enabled}
                          onCheckedChange={() => toggleWorkflow(workflow.id)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">Trigger:</span>
                        <span>{workflow.trigger}</span>
                      </div>
                      <div className="mb-3">
                        <span className="text-muted-foreground block mb-2">Actions:</span>
                        <div className="space-y-1">
                          {workflow.actions.map((action, index) => (
                            <div key={index} className="text-xs bg-muted px-2 py-1 rounded">
                              {action}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(workflow.status)}
                        <span className="text-xs text-muted-foreground">
                          {workflow.lastRun 
                            ? `Last run: ${workflow.lastRun.toLocaleString()}`
                            : 'Never run'
                          }
                        </span>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runWorkflow(workflow.id)}
                        disabled={workflow.status === 'running'}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        {workflow.status === 'running' ? 'Running...' : 'Run Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {integrations.map((integration) => (
                <Card key={integration.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GitBranch className="h-5 w-5" />
                        <span>{integration.name}</span>
                      </div>
                      <Badge variant={integration.configured ? "default" : "secondary"}>
                        {integration.configured ? "Connected" : "Not Connected"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {integration.lastSync 
                        ? `Last sync: ${integration.lastSync.toLocaleString()}`
                        : 'Never synced'
                      }
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!integration.configured}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      {integration.configured && (
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Add Custom Webhook</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                  />
                  <Button 
                    onClick={addWebhookIntegration}
                    disabled={!newWebhookUrl.trim()}
                    className="w-full"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Add Webhook
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DevEnvironmentGuard>
  );
};

export default WorkflowHub;