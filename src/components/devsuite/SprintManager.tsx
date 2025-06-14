import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  archived_at?: string | null;
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
  const [newSprintName, setNewSprintName] = useState('');
  const [addingNewSprint, setAddingNewSprint] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // First ensure default sprints exist
      await ensureDefaultSprintsExist();

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
        .is('archived_at', null)
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

  const ensureDefaultSprintsExist = async () => {
    if (!user?.id) return;

    try {
      // Check if user has any sprints
      const { data: existingSprints, error: checkError } = await supabase
        .from('sprints')
        .select('name')
        .eq('user_id', user.id);

      if (checkError) throw checkError;

      const defaultSprints = ['Priority Sprint', 'Sprint 2', 'Backlog'];
      const existingSprintNames = existingSprints?.map(s => s.name) || [];
      
      // Create missing default sprints
      const sprintsToCreate = defaultSprints
        .filter(name => !existingSprintNames.includes(name))
        .map((name, index) => ({
          name,
          order_index: existingSprints ? existingSprints.length + index : index,
          user_id: user.id,
          status: 'active',
          is_hidden: false
        }));

      if (sprintsToCreate.length > 0) {
        const { error: insertError } = await supabase
          .from('sprints')
          .insert(sprintsToCreate);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error ensuring default sprints:', error);
      // Don't throw here to prevent blocking the main load
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

  const handleAddSprint = async () => {
    if (!newSprintName.trim()) return;

    try {
      const maxOrder = Math.max(...sprints.map(s => s.order_index), -1);
      const { error } = await supabase
        .from('sprints')
        .insert({
          name: newSprintName,
          order_index: maxOrder + 1,
          user_id: user?.id,
        });

      if (error) throw error;

      setNewSprintName('');
      setAddingNewSprint(false);
      loadData();
      toast.success('Sprint created successfully');
    } catch (error) {
      console.error('Error creating sprint:', error);
      toast.error('Failed to create sprint');
    }
  };

  const handleDeleteSprint = async (sprint: Sprint) => {
    if (sprint.name === 'Priority Sprint') {
      toast.error('Cannot delete Priority Sprint');
      return;
    }

    const tasksInSprint = getTasksForSprint(sprint.id);
    if (tasksInSprint.length > 0) {
      if (!window.confirm(`This sprint contains ${tasksInSprint.length} tasks. All tasks will be moved to the Backlog sprint. Continue?`)) {
        return;
      }
      
      // Find or create Backlog sprint
      const backlogSprint = sprints.find(s => s.name === 'Backlog');
      if (backlogSprint) {
        // Move all tasks to Backlog
        const { error: moveError } = await supabase
          .from('tasks')
          .update({ sprint_id: backlogSprint.id })
          .eq('sprint_id', sprint.id);
          
        if (moveError) throw moveError;
      }
    } else {
      if (!window.confirm('Are you sure you want to delete this sprint?')) {
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('sprints')
        .delete()
        .eq('id', sprint.id);

      if (error) throw error;

      loadData();
      toast.success('Sprint deleted successfully');
    } catch (error) {
      console.error('Error deleting sprint:', error);
      toast.error('Failed to delete sprint');
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      loadData();
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (error) throw error;

      loadData();
      toast.success(`Task marked as ${newStatus === 'completed' ? 'completed' : 'todo'}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleCloseSprint = async (sprint: Sprint) => {
    try {
      // Get all tasks in the sprint
      const sprintTasks = getTasksForSprint(sprint.id);
      
      // Update all tasks in sprint to completed status and archive them
      const { error: tasksError } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          archived_at: new Date().toISOString(),
          archived_by: user?.id,
          archive_reason: `Sprint "${sprint.name}" closed`
        })
        .eq('sprint_id', sprint.id)
        .is('archived_at', null);

      if (tasksError) throw tasksError;

      // Update sprint status to completed
      const { error: sprintError } = await supabase
        .from('sprints')
        .update({ status: 'completed' })
        .eq('id', sprint.id);

      if (sprintError) throw sprintError;

      loadData();
      toast.success(`Sprint closed successfully. ${sprintTasks.length} tasks archived.`);
    } catch (error) {
      console.error('Error closing sprint:', error);
      toast.error('Failed to close sprint');
    }
  };

  const handleArchiveCompletedTasks = async (sprint: Sprint) => {
    const completedTasks = getTasksForSprint(sprint.id).filter(task => task.status === 'completed');
    
    if (completedTasks.length === 0) {
      toast.error('No completed tasks to archive');
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          archived_at: new Date().toISOString(),
          archived_by: user?.id,
          archive_reason: `Sprint completion archival from ${sprint.name}`
        })
        .in('id', completedTasks.map(t => t.id));

      if (error) throw error;

      loadData();
      toast.success(`Archived ${completedTasks.length} completed tasks`);
    } catch (error) {
      console.error('Error archiving tasks:', error);
      toast.error('Failed to archive completed tasks');
    }
  };

  const handleClearAllTasks = async () => {
    const allActiveTasks = tasks.filter(task => !task.archived_at);
    
    if (allActiveTasks.length === 0) {
      toast.error('No active tasks to archive');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to archive ALL ${allActiveTasks.length} active tasks from all sprints? This action will move all tasks to the archive.`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          archived_at: new Date().toISOString(),
          archived_by: user?.id,
          archive_reason: 'Bulk archive - Clear all tasks operation'
        })
        .in('id', allActiveTasks.map(t => t.id));

      if (error) throw error;

      loadData();
      toast.success(`Successfully archived ${allActiveTasks.length} tasks from all sprints`);
    } catch (error) {
      console.error('Error clearing all tasks:', error);
      toast.error('Failed to archive all tasks');
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'todo': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading sprints...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sprint Manager</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setAddingNewSprint(true)}
            className="menu-text-animation"
          >
            Add Sprint
          </Button>
          <Button 
            variant="destructive"
            onClick={handleClearAllTasks}
            className="menu-text-animation"
          >
            Clear All Tasks
          </Button>
          <Button onClick={() => loadData()} className="menu-text-animation">Refresh</Button>
        </div>
      </div>

      {addingNewSprint && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
                placeholder="Enter sprint name"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSprint()}
              />
              <Button onClick={handleAddSprint} className="menu-text-animation">Create</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setAddingNewSprint(false);
                  setNewSprintName('');
                }}
                className="menu-text-animation"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-6 md:grid-cols-2">
          {sprints
            .filter(sprint => !sprint.is_hidden)
            .map((sprint) => (
              <Card key={sprint.id} className="h-fit">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{sprint.name}</CardTitle>
                      <Badge variant={sprint.status === 'completed' ? 'default' : 'secondary'}>
                        {sprint.status}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleAddTask(sprint)}
                        className="menu-text-animation"
                      >
                        Add Task
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExecuteSprint(sprint)}
                        className="menu-text-animation"
                      >
                        Execute
                      </Button>
                      {sprint.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCloseSprint(sprint)}
                          className="menu-text-animation"
                        >
                          Close
                        </Button>
                      )}
                      {sprint.name === 'Priority Sprint' && getTasksForSprint(sprint.id).some(task => task.status === 'completed') && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleArchiveCompletedTasks(sprint)}
                          className="menu-text-animation"
                        >
                          Archive Completed
                        </Button>
                      )}
                      {sprint.name !== 'Priority Sprint' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteSprint(sprint)}
                          className="menu-text-animation"
                        >
                          Delete
                        </Button>
                      )}
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
                                className={`p-3 border rounded-lg bg-card hover:shadow-md transition-shadow ${
                                  task.status === 'completed' ? 'opacity-70' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div 
                                    className={`font-medium text-sm cursor-pointer ${
                                      task.status === 'completed' ? 'line-through' : ''
                                    }`}
                                    onClick={() => handleEditTask(task)}
                                  >
                                    {task.title}
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleTaskStatus(task);
                                      }}
                                      className={`w-4 h-4 rounded border text-xs ${
                                        task.status === 'completed' 
                                          ? 'bg-green-500 text-white' 
                                          : 'border-gray-300 hover:border-green-500'
                                      }`}
                                    >
                                      {task.status === 'completed' ? '✓' : ''}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task);
                                      }}
                                      className="w-4 h-4 text-red-500 hover:text-red-700 text-xs"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                                {task.description && (
                                  <div className="text-xs text-muted-foreground mb-2">
                                    {task.description.slice(0, 100)}...
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${getStatusColor(task.status)}`}
                                  >
                                    {task.status}
                                  </Badge>
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