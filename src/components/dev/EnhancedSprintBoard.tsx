import React from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import SprintColumn from './SprintColumn';
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

interface EnhancedSprintBoardProps {
  sprints: Sprint[];
  tasks: SprintItem[];
  onTaskMove: (taskId: string, newSprintId: string) => void;
  onTaskEdit: (task: SprintItem) => void;
  onTaskDelete: (taskId: string) => void;
  onAddTask: (sprintId: string) => void;
  activeTask: SprintItem | null;
}

const EnhancedSprintBoard: React.FC<EnhancedSprintBoardProps> = ({
  sprints,
  tasks,
  onTaskMove,
  onTaskEdit,
  onTaskDelete,
  onAddTask,
  activeTask
}) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const taskId = active.id as string;
    const newSprintId = over.id as string;
    
    // Check if we're dropping over a sprint column
    if (sprints.some(sprint => sprint.id === newSprintId)) {
      onTaskMove(taskId, newSprintId);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTasksBySprintId = (sprintId: string) => {
    return tasks.filter(task => task.sprintId === sprintId);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sprints.map((sprint) => {
          const sprintTasks = getTasksBySprintId(sprint.id);
          
          return (
            <SprintColumn
              key={sprint.id}
              sprint={sprint}
              tasks={sprintTasks}
              onTaskEdit={onTaskEdit}
              onTaskDelete={onTaskDelete}
              onAddTask={onAddTask}
              getPriorityColor={getPriorityColor}
            />
          );
        })}
      </div>
      
      <DragOverlay>
        {activeTask ? (
          <Card className="rotate-3 opacity-90">
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm text-foreground">{activeTask.title}</h4>
                <Badge className={`text-xs ${getPriorityColor(activeTask.priority)}`}>
                  {activeTask.priority}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {activeTask.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {activeTask.status}
                </Badge>
                <div className="flex flex-wrap gap-1">
                  {activeTask.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default EnhancedSprintBoard;