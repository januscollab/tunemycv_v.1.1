import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Archive, Tag } from 'lucide-react';
import { ModernButton } from './ui/ModernButton';

interface ArchivedTask {
  id: string;
  title: string;
  description: string;
  priority: string;
  tags: string[];
  status: string;
  sprint_id: string;
  archived_at: string;
  archived_by: string;
  archive_reason: string;
  sprint_name?: string;
}

interface TaskDetailModalProps {
  task: ArchivedTask | null;
  isOpen: boolean;
  onClose: () => void;
  onRestore?: (task: ArchivedTask) => void;
  onDelete?: (task: ArchivedTask) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onRestore,
  onDelete
}) => {
  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-slate-500 text-white';
      case 'low': return 'bg-slate-300 text-slate-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Archive className="h-5 w-5 text-muted-foreground" />
            Task Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Title and Basic Info */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {task.title}
            </h2>
            <div className="flex items-center gap-2 mb-3">
              <Badge 
                variant="secondary" 
                className={getPriorityColor(task.priority)}
              >
                {task.priority} priority
              </Badge>
              <Badge variant="outline">
                {task.sprint_name || 'Unknown Sprint'}
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500 text-white">
                {task.status}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h3 className="font-medium text-foreground mb-2">Description</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Archive Information */}
          <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archive Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <Calendar className="h-3 w-3" />
                <span>Archived on: {new Date(task.archived_at).toLocaleDateString()} at {new Date(task.archived_at).toLocaleTimeString()}</span>
              </div>
              {task.archive_reason && (
                <div className="text-orange-700 dark:text-orange-300">
                  <span className="font-medium">Reason:</span> {task.archive_reason}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <ModernButton modernVariant="ghost" onClick={onClose}>
              Close
            </ModernButton>
            <div className="flex gap-2">
              {onRestore && (
                <ModernButton
                  modernVariant="success"
                  onClick={() => onRestore(task)}
                >
                  Restore Task
                </ModernButton>
              )}
              {onDelete && (
                <ModernButton
                  modernVariant="destructive"
                  onClick={() => onDelete(task)}
                >
                  Delete Permanently
                </ModernButton>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;