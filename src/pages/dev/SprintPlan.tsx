import React, { useState } from 'react';
import DevEnvironmentGuard from '@/components/dev/DevEnvironmentGuard';
import DevNavigation from '@/components/dev/DevNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Play, ChevronRight, Download, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import TaskEditor from '@/components/dev/TaskEditor';
import EnhancedSprintBoard from '@/components/dev/EnhancedSprintBoard';
import { useSprintTasks } from '@/hooks/useSprintTasks';

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

const SprintPlan: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    moveTask, 
    clearAllTasks, 
    exportTasks,
    loadDesignSystemFixPlan
  } = useSprintTasks();
  
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<SprintItem | undefined>();
  const [defaultSprintId, setDefaultSprintId] = useState('backlog');
  const [activeTask, setActiveTask] = useState<SprintItem | null>(null);

  const sprints: Sprint[] = [
    {
      id: 'backlog',
      name: 'Backlog (Long Term)',
      color: 'bg-muted'
    },
    {
      id: 'priority',
      name: 'Priority Sprint', 
      color: 'bg-destructive-50'
    },
    {
      id: 'sprint2',
      name: 'Sprint 2',
      color: 'bg-info-50'
    },
    {
      id: 'sprint3',
      name: 'Sprint 3',
      color: 'bg-success-50'
    }
  ];

  const handleAddTask = (sprintId: string) => {
    setDefaultSprintId(sprintId);
    setEditingTask(undefined);
    setIsTaskEditorOpen(true);
  };

  const handleEditTask = (task: SprintItem) => {
    setEditingTask(task);
    setIsTaskEditorOpen(true);
  };

  const handleSaveTask = (taskData: Partial<SprintItem>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleTaskMove = (taskId: string, newSprintId: string) => {
    moveTask(taskId, newSprintId);
  };

  const handleExportTasks = () => {
    const tasksData = exportTasks();
    const dataStr = JSON.stringify(tasksData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sprint-tasks-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleClearAllTasks = () => {
    if (confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
      clearAllTasks();
    }
  };

  const getTotalTaskCount = () => {
    return tasks.length;
  };

  const getTaskCountBySprint = (sprintId: string) => {
    return tasks.filter(task => task.sprintId === sprintId).length;
  };

  return (
    <DevEnvironmentGuard>
      <DevNavigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sprint Planning</h1>
            <p className="text-muted-foreground mt-1">Manage your development backlog and sprints</p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={loadDesignSystemFixPlan}>
              <Play className="h-4 w-4 mr-2" />
              Load Fix Plan
            </Button>
            <Button variant="outline" onClick={handleExportTasks}>
              <Download className="h-4 w-4 mr-2" />
              Export Tasks
            </Button>
            <Button variant="outline" onClick={handleClearAllTasks}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button onClick={() => handleAddTask('backlog')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total tasks: <Badge variant="outline">{getTotalTaskCount()}</Badge>
          </div>
        </div>

        <EnhancedSprintBoard
          sprints={sprints}
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onTaskEdit={handleEditTask}
          onTaskDelete={handleDeleteTask}
          onAddTask={handleAddTask}
          activeTask={activeTask}
        />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleAddTask('backlog')}
            >
              <Plus className="h-5 w-5 mb-2" />
              Add to Backlog
              <Badge variant="secondary" className="mt-1">
                {getTaskCountBySprint('backlog')}
              </Badge>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleAddTask('priority')}
            >
              <Play className="h-5 w-5 mb-2" />
              Add to Priority
              <Badge variant="secondary" className="mt-1">
                {getTaskCountBySprint('priority')}
              </Badge>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleAddTask('sprint2')}
            >
              <ChevronRight className="h-5 w-5 mb-2" />
              Add to Sprint 2
              <Badge variant="secondary" className="mt-1">
                {getTaskCountBySprint('sprint2')}
              </Badge>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleAddTask('sprint3')}
            >
              <ChevronRight className="h-5 w-5 mb-2" />
              Add to Sprint 3
              <Badge variant="secondary" className="mt-1">
                {getTaskCountBySprint('sprint3')}
              </Badge>
            </Button>
          </CardContent>
        </Card>

        <TaskEditor
          isOpen={isTaskEditorOpen}
          onClose={() => setIsTaskEditorOpen(false)}
          onSave={handleSaveTask}
          task={editingTask}
          defaultSprintId={defaultSprintId}
        />
      </div>
    </DevEnvironmentGuard>
  );
};

export default SprintPlan;