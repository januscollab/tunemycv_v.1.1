import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Search, Archive, Undo2, Eye } from 'lucide-react';
import TaskDetailModal from './TaskDetailModal';

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

const ArchivedStoriesTab = () => {
  const { user } = useAuth();
  const [archivedTasks, setArchivedTasks] = useState<ArchivedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sprintFilter, setSprintFilter] = useState<string>('all');
  const [availableSprints, setAvailableSprints] = useState<{id: string, name: string}[]>([]);
  const [selectedTask, setSelectedTask] = useState<ArchivedTask | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  useEffect(() => {
    if (user) {
      loadArchivedTasks();
      loadSprints();
    }
  }, [user]);

  const loadArchivedTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          sprints!inner(name)
        `)
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false });

      if (error) throw error;

      const tasksWithSprintName = data?.map(task => ({
        ...task,
        sprint_name: task.sprints?.name || 'Unknown Sprint'
      })) || [];

      setArchivedTasks(tasksWithSprintName);
    } catch (error) {
      console.error('Error loading archived tasks:', error);
      toast.error('Failed to load archived tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadSprints = async () => {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setAvailableSprints(data || []);
    } catch (error) {
      console.error('Error loading sprints:', error);
    }
  };

  const handleRestoreTask = async (task: ArchivedTask) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          archived_at: null,
          archived_by: null,
          archive_reason: null
        })
        .eq('id', task.id);

      if (error) throw error;

      loadArchivedTasks();
      toast.success('Task restored successfully');
    } catch (error) {
      console.error('Error restoring task:', error);
      toast.error('Failed to restore task');
    }
  };

  const handlePermanentDelete = async (task: ArchivedTask) => {
    if (!window.confirm('Are you sure you want to permanently delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      loadArchivedTasks();
      toast.success('Task permanently deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleViewTask = (task: ArchivedTask) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleCloseTaskDetail = () => {
    setSelectedTask(null);
    setShowTaskDetail(false);
  };

  // Filter tasks based on search and filters
  const filteredTasks = archivedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesSprint = sprintFilter === 'all' || task.sprint_id === sprintFilter;

    return matchesSearch && matchesPriority && matchesSprint;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-zapier-orange';
      case 'low': return 'bg-secondary';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading archived tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          <h2 className="text-2xl font-semibold">Archived Stories</h2>
          <Badge variant="secondary">{filteredTasks.length}</Badge>
        </div>
        <Button onClick={loadArchivedTasks} className="menu-text-animation">
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks, descriptions, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sprintFilter} onValueChange={setSprintFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by sprint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sprints</SelectItem>
                {availableSprints.map(sprint => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Archived Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {archivedTasks.length === 0 
                ? "No archived tasks yet." 
                : "No tasks match your search criteria."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.sprint_name}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mb-2">
                      {task.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Archived on {new Date(task.archived_at).toLocaleDateString()} at {new Date(task.archived_at).toLocaleTimeString()}
                      {task.archive_reason && ` • ${task.archive_reason}`}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewTask(task)}
                      className="menu-text-animation"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestoreTask(task)}
                      className="menu-text-animation"
                    >
                      <Undo2 className="h-4 w-4 mr-1" />
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handlePermanentDelete(task)}
                      className="menu-text-animation"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TaskDetailModal
        task={selectedTask}
        isOpen={showTaskDetail}
        onClose={handleCloseTaskDetail}
        onRestore={handleRestoreTask}
        onDelete={handlePermanentDelete}
      />
    </div>
  );
};

export default ArchivedStoriesTab;