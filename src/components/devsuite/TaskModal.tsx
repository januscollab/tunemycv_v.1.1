import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CaptureInput } from '@/components/ui/capture-input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Sprint {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  tags: string[];
  status: string;
  sprint_id: string;
}

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint: Sprint | null;
  task: Task | null;
  onSave: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  open,
  onOpenChange,
  sprint,
  task,
  onSave,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [status, setStatus] = useState('todo');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setTags(task.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setTags([]);
    }
  }, [task, open]);

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleGenerateStory = async () => {
    if (!title) {
      toast.error('Please enter a task title first');
      return;
    }

    setGenerating(true);
    try {
      // Get user settings for OpenAI integration
      const { data: settings } = await supabase
        .from('user_devsuite_settings')
        .select('*')
        .single();

      if (!settings?.openai_api_key_encrypted) {
        toast.error('Please configure your OpenAI API key in settings');
        return;
      }

      // Call edge function to generate story
      const { data, error } = await supabase.functions.invoke('generate-task-story', {
        body: { 
          title, 
          existingDescription: description,
          context: sprint?.name || 'General'
        }
      });

      if (error) throw error;

      if (data?.story) {
        setDescription(data.story);
        toast.success('Story generated successfully');
      }
    } catch (error) {
      console.error('Error generating story:', error);
      toast.error('Failed to generate story');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title || !sprint) return;

    setLoading(true);
    try {
      const taskData = {
        title,
        description: description || null,
        priority,
        status,
        tags,
        sprint_id: sprint.id,
        user_id: user?.id,
      };

      if (task) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', task.id);

        if (error) throw error;
        toast.success('Task updated successfully');
      } else {
        // Create new task
        const { error } = await supabase
          .from('tasks')
          .insert(taskData);

        if (error) throw error;
        toast.success('Task created successfully');
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Add Task'} {sprint && `- ${sprint.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <CaptureInput
              label=""
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="description">Description</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleGenerateStory}
                disabled={generating || !title}
                className="menu-text-animation"
              >
                {generating ? 'Generating...' : 'Generate Story'}
              </Button>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description or user story"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <CaptureInput
                label=""
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button type="button" onClick={handleAddTag} className="menu-text-animation">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="menu-text-animation">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !title} className="menu-text-animation">
            {loading ? 'Saving...' : 'Save Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;