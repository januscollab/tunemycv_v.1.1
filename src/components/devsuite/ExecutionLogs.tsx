import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from './ui/ModernCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ExecutionLog {
  id: string;
  sprint_id: string;
  prompt_sent: string;
  ai_response: string;
  execution_date: string;
  model_used: string;
  sprints: {
    name: string;
  };
}

const ExecutionLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadLogs();
    }
  }, [user]);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('execution_logs')
        .select(`
          *,
          sprints (
            name
          )
        `)
        .order('execution_date', { ascending: false });

      if (error) throw error;

      setLogs(data || []);
    } catch (error) {
      console.error('Error loading execution logs:', error);
      toast.error('Failed to load execution logs');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (log: ExecutionLog) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('execution_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      setLogs(logs.filter(log => log.id !== logId));
      toast.success('Log deleted successfully');
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error('Failed to delete log');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading execution logs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Execution Logs</h2>
        <Button onClick={loadLogs}>Refresh</Button>
      </div>

      {logs.length === 0 ? (
        <ModernCard className="animate-fade-in">
          <ModernCardContent className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-muted-foreground text-lg mb-2">
              No execution logs yet
            </p>
            <p className="text-muted-foreground text-sm opacity-75">
              Execute a sprint to see logs here
            </p>
          </ModernCardContent>
        </ModernCard>
      ) : (
        <div className="space-y-6">
          {logs.map((log) => (
            <ModernCard key={log.id} className="animate-fade-in hover-scale">
              <ModernCardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <ModernCardTitle className="text-lg">
                      🚀 {log.sprints?.name || 'Unknown Sprint'}
                    </ModernCardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(log.execution_date), 'PPpp')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{log.model_used}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(log)}
                      className="hover-scale"
                    >
                      👁 View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteLog(log.id)}
                      className="hover-scale"
                    >
                      🗑 Delete
                    </Button>
                  </div>
                </div>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Prompt Preview:</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {log.prompt_sent.slice(0, 200)}...
                    </p>
                  </div>
                  {log.ai_response && (
                    <div>
                      <p className="text-sm font-medium">Response Preview:</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {log.ai_response.slice(0, 200)}...
                      </p>
                    </div>
                  )}
                </div>
              </ModernCardContent>
            </ModernCard>
          ))}
        </div>
      )}

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Execution Log Details - {selectedLog?.sprints?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6 overflow-y-auto">
              <div>
                <h4 className="font-medium mb-2">Execution Info</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date:</span>{' '}
                    {format(new Date(selectedLog.execution_date), 'PPpp')}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Model:</span>{' '}
                    {selectedLog.model_used}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Prompt Sent</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {selectedLog.prompt_sent}
                  </pre>
                </div>
              </div>

              {selectedLog.ai_response && (
                <div>
                  <h4 className="font-medium mb-2">AI Response</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap">
                      {selectedLog.ai_response}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExecutionLogs;