import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import TaskModal from './TaskModal';
import ExecuteSprintModal from './ExecuteSprintModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Sprint {
  id: string;
  name: string;
  order_index: number;
  status: string;
  is_hidden: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  tags: string[];
  status: string;
  sprint_id: string;
  order_index: number;
}

const SprintManager = () => {
  const { user } = useAuth();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [executeModalOpen, setExecuteModalOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load sprints
      const { data: sprintsData, error: sprintsError } = await supabase
        .from('sprints')
        .select('*')
        .order('order_index');

      if (sprintsError) throw sprintsError;

      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('order_index');

      if (tasksError) throw tasksError;

      setSprints(sprintsData || []);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load sprint data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    const sprint = sprints.find(s => s.id === task.sprint_id);
    setSelectedSprint(sprint || null);
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleExecuteSprint = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setExecuteModalOpen(true);
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const taskId = result.draggableId;
    const newSprintId = destination.droppableId;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          sprint_id: newSprintId,
          order_index: destination.index 
        })
        .eq('id', taskId);

      if (error) throw error;

      // Reload data to reflect changes
      loadData();
      toast.success('Task moved successfully');
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Failed to move task');
    }
  };

  const getTasksForSprint = (sprintId: string) => {
    return tasks.filter(task => task.sprint_id === sprintId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-zapier-orange';
      case 'low': return 'bg-secondary';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading sprints...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sprint Manager</h2>
        <Button onClick={() => loadData()}>Refresh</Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-6 md:grid-cols-3">
          {sprints
            .filter(sprint => !sprint.is_hidden)
            .map((sprint) => (
              <Card key={sprint.id} className="h-fit">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{sprint.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddTask(sprint)}
                      >
                        Add Task
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExecuteSprint(sprint)}
                      >
                        Execute
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId={sprint.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3 min-h-[100px]"
                      >
                        {getTasksForSprint(sprint.id).map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-3 border rounded-lg bg-card cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleEditTask(task)}
                              >
                                <div className="font-medium text-sm mb-2">
                                  {task.title}
                                </div>
                                {task.description && (
                                  <div className="text-xs text-muted-foreground mb-2">
                                    {task.description.slice(0, 100)}...
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${getPriorityColor(task.priority)}`}
                                  >
                                    {task.priority}
                                  </Badge>
                                  {task.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            ))}
        </div>
      </DragDropContext>

      <TaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        sprint={selectedSprint}
        task={editingTask}
        onSave={loadData}
      />

      <ExecuteSprintModal
        open={executeModalOpen}
        onOpenChange={setExecuteModalOpen}
        sprint={selectedSprint}
        tasks={selectedSprint ? getTasksForSprint(selectedSprint.id) : []}
      />
    </div>
  );
};

export default SprintManager;