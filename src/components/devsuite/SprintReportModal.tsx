import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ExecutionLog {
  id: string;
  prompt_sent: string;
  ai_response: string;
  execution_date: string;
  model_used: string;
}

interface SprintReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprintName: string;
  logs: ExecutionLog[];
}

const SprintReportModal: React.FC<SprintReportModalProps> = ({
  open,
  onOpenChange,
  sprintName,
  logs,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Sprint Report: {sprintName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Total Executions</h3>
              <p className="text-2xl font-bold text-primary">{logs.length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Latest Execution</h3>
              <p className="text-sm text-muted-foreground">
                {logs.length > 0 
                  ? format(new Date(logs[0].execution_date), 'MMM dd, yyyy')
                  : 'No executions'
                }
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Models Used</h3>
              <div className="flex flex-wrap gap-1 justify-center mt-1">
                {Array.from(new Set(logs.map(log => log.model_used))).map(model => (
                  <Badge key={model} variant="outline" className="text-xs">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {logs.length > 0 && (
            <div>
              <h3 className="font-medium mb-4">Execution History</h3>
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="outline">{log.model_used}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(log.execution_date), 'PPpp')}
                      </span>
                    </div>
                    
                    {log.ai_response && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-2">AI Summary:</h4>
                        <div className="bg-muted p-3 rounded text-sm">
                          {log.ai_response.slice(0, 300)}
                          {log.ai_response.length > 300 && '...'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {logs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No execution logs found for this sprint.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SprintReportModal;