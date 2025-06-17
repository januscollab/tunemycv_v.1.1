import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { CaptureInput } from '@/components/ui/capture-input';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from './ui/ModernCard';
import { VybeButton } from '@/components/design-system/VybeButton';
import { VybeIconButton } from '@/components/design-system/VybeIconButton';
import { Grid2X2, Plus, RefreshCw } from 'lucide-react';
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
  const [sprintLayout, setSprintLayout] = useState<'one' | 'two'>('two');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // First ensure default sprints exist
      await ensureDefaultSprintsExist();

      // Load sprints with proper ordering (Priority first, Backlog last)
      const { data: sprintsData, error: sprintsError } = await supabase
        .from('sprints')
        .select('*')
        .order('order_index');

      if (sprintsError) throw sprintsError;

      // Sort sprints: Priority Sprint first, Backlog last, others in between by order_index
      const sortedSprints = (sprintsData || []).sort((a, b) => {
        if (a.name === 'Priority Sprint') return -1;
        if (b.name === 'Priority Sprint') return 1;
        if (a.name === 'Backlog') return 1;
        if (b.name === 'Backlog') return -1;
        return a.order_index - b.order_index;
      });

      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .is('archived_at', null)
        .order('order_index');

      if (tasksError) throw tasksError;

      setSprints(sortedSprints);
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
        .select('name, id')
        .eq('user_id', user.id);

      if (checkError) throw checkError;

      const existingSprintNames = existingSprints?.map(s => s.name) || [];
      
      // Enhanced validation: ensure ONLY ONE of each core sprint exists
      const defaultSprints = ['Priority Sprint', 'Backlog'];
      const sprintsToCreate = [];
      
      for (const sprintName of defaultSprints) {
        const existingCount = existingSprintNames.filter(name => name === sprintName).length;
        
        if (existingCount === 0) {
          // Sprint doesn't exist, create it
          sprintsToCreate.push({
            name: sprintName,
            order_index: existingSprints ? existingSprints.length + sprintsToCreate.length : sprintsToCreate.length,
            user_id: user.id,
            status: 'active',
            is_hidden: false
          });
        } else if (existingCount > 1) {
          // Multiple sprints with same name exist, remove duplicates
          console.warn(`Multiple ${sprintName} sprints found. Removing duplicates.`);
          const duplicates = existingSprints?.filter(s => s.name === sprintName).slice(1) || [];
          
          // Delete duplicate sprints
          if (duplicates.length > 0) {
            const { error: deleteError } = await supabase
              .from('sprints')
              .delete()
              .in('id', duplicates.map(s => s.id));
            
            if (deleteError) console.error('Error removing duplicate sprints:', deleteError);
          }
        }
      }

      if (sprintsToCreate.length > 0) {
        const { error: insertError } = await supabase
          .from('sprints')
          .insert(sprintsToCreate);

        if (insertError) throw insertError;
        console.log(`Created ${sprintsToCreate.length} default sprints`);
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

    // Enhanced validation: prevent duplicate core sprints
    const trimmedName = newSprintName.trim();
    if (trimmedName === 'Priority Sprint' || trimmedName === 'Backlog') {
      const existingSprint = sprints.find(s => s.name === trimmedName);
      if (existingSprint) {
        toast.error(`A ${trimmedName} already exists. Only one ${trimmedName} is allowed per user.`);
        return;
      }
    }

    try {
      // Calculate proper order_index (between Priority Sprint and Backlog)
      const prioritySprint = sprints.find(s => s.name === 'Priority Sprint');
      const backlogSprint = sprints.find(s => s.name === 'Backlog');
      const userSprints = sprints.filter(s => s.name !== 'Priority Sprint' && s.name !== 'Backlog');
      
      // New user sprints should be placed between Priority Sprint and Backlog
      const maxUserOrder = userSprints.length > 0 ? Math.max(...userSprints.map(s => s.order_index)) : (prioritySprint?.order_index || 0);
      const newOrderIndex = maxUserOrder + 1;

      const { error } = await supabase
        .from('sprints')
        .insert({
          name: trimmedName,
          order_index: newOrderIndex,
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
    // Enhanced protection logic - prevent deletion of core sprints
    if (sprint.name === 'Priority Sprint' || sprint.name === 'Backlog') {
      toast.error(`Cannot delete ${sprint.name} - this is a protected system sprint`);
      return;
    }

    const tasksInSprint = getTasksForSprint(sprint.id);
    if (tasksInSprint.length > 0) {
      if (!window.confirm(`This sprint contains ${tasksInSprint.length} tasks. All tasks will be moved to the Backlog sprint. Continue?`)) {
        return;
      }
      
      // Find Backlog sprint (guaranteed to exist due to ensureDefaultSprintsExist)
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
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-slate-500 text-white';
      case 'low': return 'bg-slate-300 text-slate-700';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500 text-white';
      case 'in-progress': return 'bg-slate-600 text-white';
      case 'todo': return 'bg-slate-400 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading sprints...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sprint Manager</h2>
        <div className="flex gap-2 items-center">
          <VybeIconButton
            icon={sprintLayout === 'one' ? Grid2X2 : Grid2X2}
            tooltip={sprintLayout === 'one' ? '2 Per Row' : '1 Per Row'}
            variant="outline"
            onClick={() => setSprintLayout(sprintLayout === 'one' ? 'two' : 'one')}
          />
          <VybeIconButton
            icon={Plus}
            tooltip="Add Sprint"
            variant="secondary"
            onClick={() => setAddingNewSprint(true)}
          />
          <VybeIconButton
            icon={RefreshCw}
            tooltip="Refresh"
            variant="ghost"
            onClick={() => loadData()}
          />
        </div>
      </div>

      {addingNewSprint && (
        <ModernCard className="animate-fade-in">
          <ModernCardContent className="pt-6">
            <div className="flex gap-2">
              <CaptureInput
                label="Sprint Name"
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
                placeholder="Enter sprint name"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSprint()}
              />
              <VybeButton onClick={handleAddSprint} vybeVariant="primary">Create</VybeButton>
              <VybeButton 
                vybeVariant="ghost" 
                onClick={() => {
                  setAddingNewSprint(false);
                  setNewSprintName('');
                }}
              >
                Cancel
              </VybeButton>
            </div>
          </ModernCardContent>
        </ModernCard>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className={`grid gap-6 ${sprintLayout === 'two' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          {sprints
            .filter(sprint => !sprint.is_hidden)
            .map((sprint) => (
              <ModernCard key={sprint.id} className="h-fit animate-fade-in">
                <ModernCardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <ModernCardTitle className="text-lg">{sprint.name}</ModernCardTitle>
                  </div>
                </ModernCardHeader>
                <ModernCardContent>
                  <Droppable droppableId={sprint.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3 min-h-[100px] mb-4"
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
                  
                   {/* Sprint Action Buttons - Moved to Bottom */}
                  <div className="flex gap-2 pt-4 border-t border-border/50">
                    <VybeButton
                      vybeSize="sm"
                      vybeVariant="primary"
                      onClick={() => handleAddTask(sprint)}
                    >
                      Add Task
                    </VybeButton>
                    <VybeButton
                      vybeSize="sm"
                      vybeVariant="secondary"
                      onClick={() => handleExecuteSprint(sprint)}
                    >
                      Execute
                    </VybeButton>
                    {sprint.status !== 'completed' && (
                      <VybeButton
                        vybeSize="sm"
                        vybeVariant="outline"
                        onClick={() => handleCloseSprint(sprint)}
                      >
                        Close
                      </VybeButton>
                    )}
                    {sprint.name === 'Priority Sprint' && getTasksForSprint(sprint.id).some(task => task.status === 'completed') && (
                      <VybeButton
                        vybeSize="sm"
                        vybeVariant="ghost"
                        onClick={() => handleArchiveCompletedTasks(sprint)}
                      >
                        Archive Completed
                      </VybeButton>
                    )}
                    {sprint.name !== 'Priority Sprint' && sprint.name !== 'Backlog' && (
                      <VybeButton
                        vybeSize="sm"
                        vybeVariant="destructive"
                        onClick={() => handleDeleteSprint(sprint)}
                      >
                        Delete
                      </VybeButton>
                    )}
                  </div>
                </ModernCardContent>
              </ModernCard>
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