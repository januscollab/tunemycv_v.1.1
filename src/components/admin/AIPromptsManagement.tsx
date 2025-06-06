import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Save, History, RotateCcw, FileText, MessageSquare, BrainCircuit, Target, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PromptVersion {
  id: string;
  version_number: number;
  content: string;
  description: string;
  created_at: string;
  created_by: string;
}

interface Prompt {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

const promptTabs = [
  { id: 'cv_analysis', label: 'CV Analysis', icon: <FileText className="h-4 w-4" /> },
  { id: 'cover_letter', label: 'Cover Letter', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'interview_prep', label: 'Interview Prep', icon: <BrainCircuit className="h-4 w-4" /> },
  { id: 'skills_assessment', label: 'Skills Assessment', icon: <Target className="h-4 w-4" /> },
  { id: 'career_advice', label: 'Career Advice', icon: <Users className="h-4 w-4" /> }
];

const AIPromptsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('cv_analysis');
  const [prompts, setPrompts] = useState<Record<string, Prompt>>({});
  const [promptVersions, setPromptVersions] = useState<Record<string, PromptVersion[]>>({});
  const [currentContent, setCurrentContent] = useState<Record<string, string>>({});
  const [selectedVersions, setSelectedVersions] = useState<Record<string, string>>({});
  const [saveDescription, setSaveDescription] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savingPromptId, setSavingPromptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      
      // Temporarily disable database operations until types are regenerated
      // This will be re-enabled once the database migration is complete
      setLoading(false);
      toast({ title: 'Info', description: 'AI Prompts system will be available after database setup completes', variant: 'default' });
      
      /*
      // Fetch prompts
      const { data: promptsData, error: promptsError } = await supabase
        .from('ai_prompts')
        .select('*')
        .order('name');

      if (promptsError) throw promptsError;

      // Fetch all versions
      const { data: versionsData, error: versionsError } = await supabase
        .from('ai_prompt_versions')
        .select('*')
        .order('created_at', { ascending: false });

      if (versionsError) throw versionsError;

      // Organize data
      const promptsMap: Record<string, Prompt> = {};
      const versionsMap: Record<string, PromptVersion[]> = {};
      const contentMap: Record<string, string> = {};
      const selectedVersionsMap: Record<string, string> = {};

      promptsData?.forEach(prompt => {
        promptsMap[prompt.name] = prompt;
        const promptVersions = versionsData?.filter(v => v.prompt_id === prompt.id) || [];
        versionsMap[prompt.name] = promptVersions;
        
        // Set current content to latest version
        if (promptVersions.length > 0) {
          contentMap[prompt.name] = promptVersions[0].content;
          selectedVersionsMap[prompt.name] = promptVersions[0].id;
        } else {
          contentMap[prompt.name] = '';
        }
      });

      setPrompts(promptsMap);
      setPromptVersions(versionsMap);
      setCurrentContent(contentMap);
      setSelectedVersions(selectedVersionsMap);
      */
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast({ title: 'Error', description: 'Failed to load prompts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (promptName: string, content: string) => {
    setCurrentContent(prev => ({
      ...prev,
      [promptName]: content
    }));
  };

  const handleVersionSelect = (promptName: string, versionId: string) => {
    const version = promptVersions[promptName]?.find(v => v.id === versionId);
    if (version) {
      setCurrentContent(prev => ({
        ...prev,
        [promptName]: version.content
      }));
      setSelectedVersions(prev => ({
        ...prev,
        [promptName]: versionId
      }));
    }
  };

  const handleSave = async () => {
    if (!savingPromptId || !saveDescription.trim()) {
      toast({ title: 'Error', description: 'Please provide a description for this save', variant: 'destructive' });
      return;
    }

    try {
      // Temporarily disabled until types are regenerated
      toast({ title: 'Info', description: 'Save functionality will be available after database setup completes', variant: 'default' });
      
      /*
      const prompt = prompts[savingPromptId];
      const content = currentContent[savingPromptId];
      
      if (!prompt || !content.trim()) {
        toast({ title: 'Error', description: 'Content cannot be empty', variant: 'destructive' });
        return;
      }

      // Get next version number
      const currentVersions = promptVersions[savingPromptId] || [];
      const nextVersionNumber = currentVersions.length > 0 
        ? Math.max(...currentVersions.map(v => v.version_number)) + 1 
        : 1;

      // Save new version
      const { data, error } = await supabase
        .from('ai_prompt_versions')
        .insert({
          prompt_id: prompt.id,
          version_number: nextVersionNumber,
          content: content.trim(),
          description: saveDescription.trim(),
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh data
      await fetchPrompts();
      
      toast({ title: 'Success', description: `Prompt saved as version ${nextVersionNumber}` });
      */
      
      setSaveDescription('');
      setShowSaveDialog(false);
      setSavingPromptId(null);
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({ title: 'Error', description: 'Failed to save prompt', variant: 'destructive' });
    }
  };

  const initiateSave = (promptName: string) => {
    setSavingPromptId(promptName);
    setSaveDescription('');
    setShowSaveDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zapier-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blueberry flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-zapier-orange" />
            AI Prompts Management
          </CardTitle>
          <p className="text-blueberry/70">
            Manage and version control AI prompts used throughout the system. Each prompt maintains a complete version history.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {promptTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {promptTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-blueberry">{tab.label} Prompt</h3>
                    <p className="text-sm text-blueberry/70">{prompts[tab.id]?.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={selectedVersions[tab.id] || ''}
                      onValueChange={(value) => handleVersionSelect(tab.id, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>
                      <SelectContent>
                        {promptVersions[tab.id]?.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            v{version.version_number} - {version.description} ({formatDate(version.created_at)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => initiateSave(tab.id)}
                      className="bg-zapier-orange hover:bg-zapier-orange/90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`prompt-${tab.id}`}>Prompt Content</Label>
                  <Textarea
                    id={`prompt-${tab.id}`}
                    value={currentContent[tab.id] || ''}
                    onChange={(e) => handleContentChange(tab.id, e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                    placeholder="Enter your AI prompt here..."
                  />
                </div>

                {promptVersions[tab.id]?.length > 0 && (
                  <div className="text-sm text-blueberry/70">
                    Total versions: {promptVersions[tab.id].length} | 
                    Current: v{promptVersions[tab.id].find(v => v.id === selectedVersions[tab.id])?.version_number || 1} | 
                    Last updated: {formatDate(promptVersions[tab.id][0]?.created_at || '')}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Prompt Version</DialogTitle>
            <DialogDescription>
              Provide a description for this version to help track changes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="save-description">Version Description</Label>
              <Input
                id="save-description"
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="e.g., Updated to include new keyword analysis"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-zapier-orange hover:bg-zapier-orange/90"
              disabled={!saveDescription.trim()}
            >
              Save Version
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIPromptsManagement;