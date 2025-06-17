import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { CaptureInput } from '@/components/ui/capture-input';
import { CaptureTextarea } from '@/components/ui/capture-textarea';
import { VybeButton } from '@/components/design-system/VybeButton';
import { VybeSelect } from '@/components/design-system/VybeSelect';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Flag } from 'lucide-react';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import TaskImageUpload from './TaskImageUpload';

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
  const [isBlocked, setIsBlocked] = useState(false);
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setTags(task.tags || []);
      loadTaskImages(task.id);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setTags([]);
      setImages([]);
    }
  }, [task, open]);

  const loadTaskImages = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('task_images')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error loading task images:', error);
    }
  };

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
    setIsBlocked(true);
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
      setIsBlocked(false);
    }
  };

  const handleSave = async () => {
    if (!title || !sprint) return;

    setLoading(true);
    try {
      // Generate auto-tags based on title and description
      const autoTags = generateAutoTags(title, description);
      const finalTags = [...new Set([...tags, ...autoTags])]; // Remove duplicates

      const taskData = {
        title,
        description: description || null,
        priority,
        status,
        tags: finalTags,
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

  // Auto-tagging function
  const generateAutoTags = (title: string, description: string): string[] => {
    const content = `${title} ${description}`.toLowerCase();
    const autoTags: string[] = [];

    // UI/UX related
    if (content.match(/\b(ui|ux|design|interface|user|component|layout|responsive|mobile|desktop)\b/)) {
      autoTags.push('ui');
    }

    // Backend/API related
    if (content.match(/\b(api|backend|server|database|endpoint|integration|service)\b/)) {
      autoTags.push('backend');
    }

    // Frontend related
    if (content.match(/\b(frontend|react|component|javascript|typescript|css|html)\b/)) {
      autoTags.push('frontend');
    }

    // Bug/Fix related
    if (content.match(/\b(bug|fix|error|issue|problem|debug)\b/)) {
      autoTags.push('bug');
    }

    // Feature related
    if (content.match(/\b(feature|new|add|implement|create|build)\b/)) {
      autoTags.push('feature');
    }

    // Documentation related
    if (content.match(/\b(doc|documentation|readme|guide|manual)\b/)) {
      autoTags.push('docs');
    }

    // Testing related
    if (content.match(/\b(test|testing|unit|integration|e2e|spec)\b/)) {
      autoTags.push('testing');
    }

    // Security related
    if (content.match(/\b(security|auth|authentication|authorization|secure|vulnerability)\b/)) {
      autoTags.push('security');
    }

    // Performance related
    if (content.match(/\b(performance|optimize|speed|slow|cache|memory)\b/)) {
      autoTags.push('performance');
    }

    // Refactor related
    if (content.match(/\b(refactor|cleanup|improve|restructure|organize)\b/)) {
      autoTags.push('refactor');
    }

    return autoTags;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {/* Loading Overlay */}
        {isBlocked && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-zapier-orange border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-blueberry dark:text-citrus font-medium">Enhancing story...</p>
              <p className="text-blueberry/60 dark:text-apple-core/60 text-sm">Please wait while AI improves your task</p>
            </div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Add Task'} {sprint && `- ${sprint.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <CaptureInput
              label="Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              description="Use format: As a [user], I want [goal], so that [benefit]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Description</span>
              <VybeButton
                vybeSize="sm"
                vybeVariant="secondary"
                onClick={handleGenerateStory}
                disabled={generating || !title}
                isLoading={generating}
              >
                {generating ? 'Generating...' : 'Enhance Story'}
              </VybeButton>
            </div>
            <CaptureTextarea
              label=""
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description or user story details"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <VybeSelect
              label="Priority"
              value={priority}
              onValueChange={setPriority}
              placeholder="Select priority"
              icon={Flag}
              options={[
                { value: 'low', label: 'Low', icon: Flag },
                { value: 'medium', label: 'Medium', icon: AlertTriangle },
                { value: 'high', label: 'High', icon: AlertTriangle }
              ]}
            />
            <VybeSelect
              label="Status"
              value={status}
              onValueChange={setStatus}
              placeholder="Select status"
              icon={Clock}
              options={[
                { value: 'todo', label: 'To Do', icon: Clock },
                { value: 'in-progress', label: 'In Progress', icon: AlertTriangle },
                { value: 'completed', label: 'Completed', icon: CheckCircle }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Tags</label>
            <div className="flex gap-2 mb-2">
              <CaptureInput
                label=""
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <VybeButton vybeVariant="secondary" onClick={handleAddTag}>Add</VybeButton>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
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
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Tags are automatically suggested based on task content (ui, backend, frontend, bug, feature, docs, testing, security, performance, refactor)
            </p>
          </div>

          <TaskImageUpload
            taskId={task?.id}
            images={images}
            onImagesChange={setImages}
            disabled={isBlocked}
          />
        </div>

        <DialogFooter>
          <VybeButton vybeVariant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </VybeButton>
          <VybeButton vybeVariant="primary" onClick={handleSave} disabled={loading || !title} isLoading={loading}>
            {loading ? 'Saving...' : 'Save Task'}
          </VybeButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;