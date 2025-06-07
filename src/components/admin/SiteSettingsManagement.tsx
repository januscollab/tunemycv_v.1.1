import React, { useState, useEffect } from 'react';
import { Save, Mail, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  id: string;
  admin_email: string;
  support_email: string;
  updated_at: string;
}

const SiteSettingsManagement: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    admin_email: '',
    support_email: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
        setFormData({
          admin_email: data.admin_email || '',
          support_email: data.support_email || ''
        });
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load site settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('site_settings')
          .update({
            admin_email: formData.admin_email,
            support_email: formData.support_email
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('site_settings')
          .insert({
            admin_email: formData.admin_email,
            support_email: formData.support_email
          });

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Site settings saved successfully'
      });

      // Reload settings to get updated data
      await loadSettings();
    } catch (error) {
      console.error('Error saving site settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save site settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zapier-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-apple-core/20 dark:border-citrus/20">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-semibold text-blueberry dark:text-citrus">
            <Settings className="h-5 w-5 text-apricot mr-2" />
            Site Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin_email" className="text-sm font-medium text-blueberry dark:text-apple-core">
                Admin Email
              </Label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blueberry/60 dark:text-apple-core/60" />
                <Input
                  id="admin_email"
                  type="email"
                  value={formData.admin_email}
                  onChange={(e) => handleInputChange('admin_email', e.target.value)}
                  placeholder="admin@company.com"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-blueberry/60 dark:text-apple-core/60 mt-1">
                Email address for administrative notifications and error reports
              </p>
            </div>

            <div>
              <Label htmlFor="support_email" className="text-sm font-medium text-blueberry dark:text-apple-core">
                Support Email
              </Label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blueberry/60 dark:text-apple-core/60" />
                <Input
                  id="support_email"
                  type="email"
                  value={formData.support_email}
                  onChange={(e) => handleInputChange('support_email', e.target.value)}
                  placeholder="support@company.com"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-blueberry/60 dark:text-apple-core/60 mt-1">
                Email address for customer support and feedback forms
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-apple-core/20 dark:border-citrus/20">
            <div className="text-sm text-blueberry/60 dark:text-apple-core/60">
              {settings && (
                <span>Last updated: {new Date(settings.updated_at).toLocaleDateString()}</span>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettingsManagement;