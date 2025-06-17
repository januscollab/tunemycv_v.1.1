import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { VybeButton } from '@/components/design-system/VybeButton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Copy, Send } from 'lucide-react';

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
}

interface ExecuteSprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint: Sprint | null;
  tasks: Task[];
}

const ExecuteSprintModal: React.FC<ExecuteSprintModalProps> = ({
  open,
  onOpenChange,
  sprint,
  tasks,
}) => {
  const { user } = useAuth();
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (open && sprint && tasks.length > 0) {
      generatePrompt();
    }
  }, [open, sprint, tasks]);

  const generatePrompt = () => {
    if (!sprint || tasks.length === 0) return;

    const prompt = `Sprint Execution: ${sprint.name}

Please review and help execute the following tasks:

${tasks.map((task, index) => `
${index + 1}. **${task.title}** (Priority: ${task.priority})
   ${task.description ? `Description: ${task.description}` : 'No description provided'}
   ${task.tags.length > 0 ? `Tags: ${task.tags.join(', ')}` : ''}
`).join('\n')}

Please provide:
1. Analysis of task complexity and dependencies
2. Suggested execution order
3. Potential blockers or considerations
4. Estimated effort for each task
5. Recommendations for implementation approach

Format your response to help track progress and completion status.`;

    setGeneratedPrompt(prompt);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast.success('Prompt copied to clipboard');
  };

  const handleSendToLovable = async () => {
    // This would integrate with Lovable's API if available
    // For now, we'll just copy to clipboard and show instructions
    navigator.clipboard.writeText(generatedPrompt);
    toast.success('Prompt copied! Paste it into your Lovable chat to execute the sprint.');
  };

  const handleProcessAIResponse = async () => {
    if (!aiResponse || !sprint) return;

    setLoading(true);
    try {
      // Save execution log
      const { error } = await supabase
        .from('execution_logs')
        .insert({
          user_id: user?.id,
          sprint_id: sprint.id,
          prompt_sent: generatedPrompt,
          ai_response: aiResponse,
        });

      if (error) throw error;

      // Parse AI response for task completion indicators
      const completionKeywords = ['completed', 'finished', 'done', 'implemented', 'delivered'];
      const taskCompletions: { [key: string]: boolean } = {};

      // Analyze AI response for each task
      tasks.forEach((task) => {
        const taskMentioned = aiResponse.toLowerCase().includes(task.title.toLowerCase());
        const hasCompletionIndicator = completionKeywords.some(keyword => 
          aiResponse.toLowerCase().includes(`${task.title.toLowerCase()} ${keyword}`) ||
          aiResponse.toLowerCase().includes(`${keyword} ${task.title.toLowerCase()}`)
        );
        
        if (taskMentioned && hasCompletionIndicator) {
          taskCompletions[task.id] = true;
        }
      });

      // Update task statuses based on AI analysis
      if (Object.keys(taskCompletions).length > 0) {
        const updatePromises = Object.keys(taskCompletions).map(taskId =>
          supabase
            .from('tasks')
            .update({ status: 'completed' })
            .eq('id', taskId)
        );

        await Promise.all(updatePromises);
        toast.success(`AI response processed! Updated ${Object.keys(taskCompletions).length} tasks as completed.`);
      } else {
        toast.success('AI response processed and logged');
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error processing AI response:', error);
      toast.error('Failed to process AI response');
    } finally {
      setLoading(false);
    }
  };

  if (!sprint) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Execute Sprint: {sprint.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="prompt" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prompt">Generated Prompt</TabsTrigger>
            <TabsTrigger value="response">AI Response</TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="space-y-4">
            <div>
              <Label>Generated Prompt for AI Execution</Label>
              <Textarea
                value={generatedPrompt}
                onChange={(e) => setGeneratedPrompt(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <VybeButton onClick={handleCopyPrompt} vybeVariant="outline" icon={Copy}>
                Copy Prompt
              </VybeButton>
              <VybeButton onClick={handleSendToLovable} vybeVariant="primary" icon={Send}>
                Send to Lovable
              </VybeButton>
            </div>
          </TabsContent>

          <TabsContent value="response" className="space-y-4">
            <div>
              <Label>Paste AI Response Here</Label>
              <Textarea
                value={aiResponse}
                onChange={(e) => setAiResponse(e.target.value)}
                placeholder="Paste the AI response from Lovable or ChatGPT here..."
                rows={15}
                className="font-mono text-sm"
              />
            </div>
            <VybeButton 
              onClick={handleProcessAIResponse} 
              disabled={loading || !aiResponse}
              isLoading={loading}
              vybeVariant="primary"
            >
              {loading ? 'Processing...' : 'Process Response & Update Tasks'}
            </VybeButton>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <VybeButton vybeVariant="outline" onClick={() => onOpenChange(false)}>
            Close
          </VybeButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExecuteSprintModal;