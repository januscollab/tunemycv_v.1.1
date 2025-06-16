import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ModernInput } from './ui/ModernInput';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from './ui/ModernCard';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Settings {
  openai_api_key_encrypted: string;
  preferred_model: string;
  story_generation_enabled: boolean;
  show_priority_sprint: boolean;
}

const DevSuiteSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    openai_api_key_encrypted: '',
    preferred_model: 'gpt-4',
    story_generation_enabled: true,
    show_priority_sprint: true,
  });
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_devsuite_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
        setApiKey(data.openai_api_key_encrypted ? '••••••••••••' : '');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaveLoading(true);
    try {
      const updateData = {
        ...settings,
        user_id: user?.id,
      };

      // Only update API key if it's been changed
      if (apiKey && !apiKey.includes('•')) {
        updateData.openai_api_key_encrypted = apiKey;
      }

      const { error } = await supabase
        .from('user_devsuite_settings')
        .upsert(updateData);

      if (error) throw error;

      toast.success('Settings saved successfully');
      
      // Reload to get updated data
      loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleTogglePrioritySprint = async (enabled: boolean) => {
    try {
      // Update sprint visibility
      const { error } = await supabase
        .from('sprints')
        .update({ is_hidden: !enabled })
        .eq('name', 'Priority Sprint')
        .eq('user_id', user?.id);

      if (error) throw error;

      setSettings(prev => ({ ...prev, show_priority_sprint: enabled }));
      toast.success(enabled ? 'Priority Sprint shown' : 'Priority Sprint hidden');
    } catch (error) {
      console.error('Error toggling priority sprint:', error);
      toast.error('Failed to update Priority Sprint visibility');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <ModernCard className="animate-fade-in">
        <ModernCardHeader>
          <ModernCardTitle>🤖 OpenAI Integration</ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="space-y-6">
          <div>
            <ModernInput
              label="OpenAI API Key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              description="Required for AI story generation and sprint execution features"
            />
          </div>

          <div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Preferred Model</label>
              <select
                value={settings.preferred_model}
                onChange={(e) => setSettings(prev => ({ ...prev, preferred_model: e.target.value }))}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:border-ring/50 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Story Generation</Label>
              <p className="text-sm text-muted-foreground">
                Allow AI to generate user stories for tasks
              </p>
            </div>
            <Switch
              checked={settings.story_generation_enabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, story_generation_enabled: checked }))
              }
            />
          </div>
        </ModernCardContent>
      </ModernCard>


      <Button 
        onClick={handleSaveSettings} 
        disabled={saveLoading}
        className="w-full hover-scale"
      >
        {saveLoading ? '💾 Saving...' : '💾 Save Settings'}
      </Button>
    </div>
  );
};

export default DevSuiteSettings;