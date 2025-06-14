import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DraggableTask from './DraggableTask';

interface SprintItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  sprintId: string;
  tags: string[];
  createdAt: Date;
}

interface Sprint {
  id: string;
  name: string;
  color: string;
}

interface SprintColumnProps {
  sprint: Sprint;
  tasks: SprintItem[];
  onTaskEdit: (task: SprintItem) => void;
  onTaskDelete: (taskId: string) => void;
  onAddTask: (sprintId: string) => void;
  getPriorityColor: (priority: string) => string;
}

const SprintColumn: React.FC<SprintColumnProps> = ({
  sprint,
  tasks,
  onTaskEdit,
  onTaskDelete,
  onAddTask,
  getPriorityColor
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: sprint.id,
  });

  return (
    <Card 
      ref={setNodeRef}
      className={`h-fit transition-colors ${isOver ? 'ring-2 ring-primary' : ''}`}
    >
      <CardHeader className="bg-muted rounded-t-lg">
        <CardTitle className="flex items-center justify-between text-sm font-semibold">
          {sprint.name}
          <Badge variant="secondary">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No tasks yet</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={() => onAddTask(sprint.id)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add first task
              </Button>
            </div>
          ) : (
            tasks.map((task) => (
              <DraggableTask
                key={task.id}
                task={task}
                onEdit={onTaskEdit}
                onDelete={onTaskDelete}
                getPriorityColor={getPriorityColor}
              />
            ))
          )}
        </SortableContext>
        
        {tasks.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3"
            onClick={() => onAddTask(sprint.id)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add task
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SprintColumn;