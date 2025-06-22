import React, { useState, useEffect } from 'react';
import { CaptureInput } from '@/components/ui/capture-input';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from './ui/ModernCard';
import { VybeButton } from '@/components/design-system/VybeButton';
import { VybeSelect } from '@/components/design-system/VybeSelect';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

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
            <CaptureInput
              label="OpenAI API Key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              description="Required for AI story generation and sprint execution features"
            />
          </div>

          <VybeSelect
            label="Preferred Model"
            value={settings.preferred_model}
            onValueChange={(value) => setSettings(prev => ({ ...prev, preferred_model: value }))}
            placeholder="Select AI model"
            options={[
              { value: 'gpt-4', label: 'GPT-4', description: 'Most capable model for complex tasks' },
              { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'Faster and more efficient version' },
              { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and cost-effective option' }
            ]}
          />

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


      <VybeButton 
        vybeVariant="primary"
        onClick={handleSaveSettings} 
        disabled={saveLoading}
        isLoading={saveLoading}
        fullWidth
        icon={saveLoading ? undefined : Save}
      >
        {saveLoading ? 'Saving...' : 'Save Settings'}
      </VybeButton>
    </div>
  );
};

export default DevSuiteSettings;