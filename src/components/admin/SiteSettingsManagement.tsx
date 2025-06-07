import React, { useState, useEffect } from 'react';
import { Settings, Mail, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [adminEmail, setAdminEmail] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
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
        setAdminEmail(data.admin_email || '');
        setSupportEmail(data.support_email || '');
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

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const settingsData = {
        admin_email: adminEmail,
        support_email: supportEmail
      };

      let result;
      if (settings?.id) {
        result = await supabase
          .from('site_settings')
          .update(settingsData)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('site_settings')
          .insert([settingsData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setSettings(result.data);
      toast({
        title: 'Success',
        description: 'Site settings updated successfully'
      });
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

  const handleReset = () => {
    if (settings) {
      setAdminEmail(settings.admin_email || '');
      setSupportEmail(settings.support_email || '');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6 text-apricot" />
        <h1 className="text-2xl font-bold text-blueberry">Site Settings</h1>
      </div>

      <Card className="border border-apple-core/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-apricot" />
            <span>Email Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                className="border-apple-core/30 focus:border-citrus"
              />
              <p className="text-xs text-blueberry/60">
                Email address for administrative communications and error reports
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@example.com"
                className="border-apple-core/30 focus:border-citrus"
              />
              <p className="text-xs text-blueberry/60">
                Email address for customer support and feedback forms
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-citrus text-blueberry hover:bg-citrus/90 border border-citrus"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
              className="border-apple-core/30 hover:bg-apple-core/10"
            >
              Reset
            </Button>
          </div>

          {settings?.updated_at && (
            <p className="text-xs text-blueberry/60 pt-2">
              Last updated: {new Date(settings.updated_at).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettingsManagement;