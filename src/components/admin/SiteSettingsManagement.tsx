import React, { useState, useEffect } from 'react';
import { Save, Mail, Settings, Calendar, TrendingUp, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UnifiedInput } from '@/components/ui/unified-input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

interface SiteSettings {
  id: string;
  admin_email: string;
  support_email: string;
  monthly_adobe_limit: number;
  reset_day: number;
  adobe_api_enabled: boolean;
  updated_at: string;
}

interface AdobeCredentials {
  id: string;
  client_id: string;
  organization_id: string;
  is_active: boolean;
}

interface AdobeUsage {
  current_usage: number;
  monthly_limit: number;
  usage_percentage: number;
  days_until_reset: number;
  reset_date: string;
}

const SiteSettingsManagement: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [adobeCredentials, setAdobeCredentials] = useState<AdobeCredentials | null>(null);
  const [adobeUsage, setAdobeUsage] = useState<AdobeUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    admin_email: '',
    support_email: '',
    monthly_adobe_limit: 500,
    reset_day: 1,
    adobe_api_enabled: false
  });
  const [adobeFormData, setAdobeFormData] = useState({
    client_id: '',
    client_secret: '',
    organization_id: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    loadAdobeCredentials();
    loadAdobeUsage();
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
          support_email: data.support_email || '',
          monthly_adobe_limit: data.monthly_adobe_limit || 500,
          reset_day: data.reset_day || 1,
          adobe_api_enabled: data.adobe_api_enabled || false
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

  const loadAdobeCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('adobe_credentials')
        .select('id, client_id, organization_id, is_active')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setAdobeCredentials(data);
        setAdobeFormData(prev => ({
          ...prev,
          client_id: data.client_id,
          organization_id: data.organization_id
        }));
      }
    } catch (error) {
      console.error('Error loading Adobe credentials:', error);
    }
  };

  const loadAdobeUsage = async () => {
    try {
      const { data, error } = await supabase.rpc('get_current_adobe_usage');
      
      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setAdobeUsage(data[0]);
      }
    } catch (error) {
      console.error('Error loading Adobe usage:', error);
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
            support_email: formData.support_email,
            monthly_adobe_limit: formData.monthly_adobe_limit,
            reset_day: formData.reset_day,
            adobe_api_enabled: formData.adobe_api_enabled
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('site_settings')
          .insert({
            admin_email: formData.admin_email,
            support_email: formData.support_email,
            monthly_adobe_limit: formData.monthly_adobe_limit,
            reset_day: formData.reset_day,
            adobe_api_enabled: formData.adobe_api_enabled
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

  const handleSaveAdobeCredentials = async () => {
    setSaving(true);
    try {
      if (adobeCredentials) {
        // Update existing credentials
        const { error } = await supabase
          .from('adobe_credentials')
          .update({
            client_id: adobeFormData.client_id,
            organization_id: adobeFormData.organization_id,
            ...(adobeFormData.client_secret && { client_secret_encrypted: adobeFormData.client_secret })
          })
          .eq('id', adobeCredentials.id);

        if (error) throw error;
      } else {
        // Create new credentials
        const { error } = await supabase
          .from('adobe_credentials')
          .insert({
            client_id: adobeFormData.client_id,
            client_secret_encrypted: adobeFormData.client_secret,
            organization_id: adobeFormData.organization_id
          });

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Adobe credentials saved successfully'
      });

      // Clear the client secret from form
      setAdobeFormData(prev => ({ ...prev, client_secret: '' }));
      await loadAdobeCredentials();
    } catch (error) {
      console.error('Error saving Adobe credentials:', error);
      toast({
        title: 'Error',
        description: 'Failed to save Adobe credentials',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdobeInputChange = (field: string, value: string) => {
    setAdobeFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getUsageStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 80) return 'text-orange-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 90) return 'bg-red-400';
    if (percentage >= 80) return 'bg-orange-400';
    if (percentage >= 50) return 'bg-yellow-400';
    return 'bg-green-500';
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
      {/* Adobe Usage Dashboard */}
      {formData.adobe_api_enabled && adobeUsage && (
        <Card className="border border-apple-core/20 dark:border-citrus/20">
          <CardHeader>
            <CardTitle className="flex items-center text-heading font-semibold text-blueberry dark:text-citrus">
              <TrendingUp className="h-5 w-5 text-apricot mr-2" />
              Adobe PDF Services Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-caption font-medium text-blueberry dark:text-apple-core">
                  Current Usage
                </Label>
                <div className={`text-2xl font-bold ${getUsageStatusColor(adobeUsage.usage_percentage)}`}>
                  {adobeUsage.current_usage} / {adobeUsage.monthly_limit}
                </div>
                <Progress 
                  value={Math.min(adobeUsage.usage_percentage, 100)} 
                  className="h-2"
                />
                <p className="text-micro text-blueberry/60 dark:text-apple-core/60">
                  {adobeUsage.usage_percentage.toFixed(1)}% of monthly limit
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-caption font-medium text-blueberry dark:text-apple-core">
                  Days Until Reset
                </Label>
                <div className="text-2xl font-bold text-blueberry dark:text-apple-core">
                  {adobeUsage.days_until_reset}
                </div>
                <p className="text-micro text-blueberry/60 dark:text-apple-core/60">
                  Resets on {new Date(adobeUsage.reset_date).toLocaleDateString()}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-caption font-medium text-blueberry dark:text-apple-core">
                  Status
                </Label>
                <div className={`text-lg font-semibold ${getUsageStatusColor(adobeUsage.usage_percentage)}`}>
                  {adobeUsage.usage_percentage >= 100 ? (
                    <span className="flex items-center"><AlertTriangle className="h-4 w-4 mr-1" />Limit Reached</span>
                  ) : adobeUsage.usage_percentage >= 90 ? (
                    <span className="flex items-center"><AlertTriangle className="h-4 w-4 mr-1" />Critical</span>
                  ) : adobeUsage.usage_percentage >= 80 ? (
                    'High Usage'
                  ) : adobeUsage.usage_percentage >= 50 ? (
                    'Moderate Usage'
                  ) : (
                    'Normal'
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adobe PDF Services Configuration */}
      <Card className="border border-apple-core/20 dark:border-citrus/20">
        <CardHeader>
          <CardTitle className="flex items-center text-heading font-semibold text-blueberry dark:text-citrus">
            <Shield className="h-5 w-5 text-apricot mr-2" />
            Adobe PDF Services Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="adobe_api_enabled"
                checked={formData.adobe_api_enabled}
                onChange={(e) => handleInputChange('adobe_api_enabled', e.target.checked)}
                className="rounded border-apple-core/30"
              />
              <Label htmlFor="adobe_api_enabled" className="text-caption font-medium text-blueberry dark:text-apple-core">
                Enable Adobe PDF Services API
              </Label>
            </div>

            {formData.adobe_api_enabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthly_adobe_limit" className="text-caption font-medium text-blueberry dark:text-apple-core">
                      Monthly Limit
                    </Label>
                    <UnifiedInput
                      id="monthly_adobe_limit"
                      type="number"
                      value={formData.monthly_adobe_limit}
                      onChange={(e) => handleInputChange('monthly_adobe_limit', parseInt(e.target.value))}
                      placeholder="500"
                      min="1"
                      max="10000"
                      secure={true}
                    />
                    <p className="text-micro text-blueberry/60 dark:text-apple-core/60 mt-1">
                      Maximum API calls per month
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="reset_day" className="text-caption font-medium text-blueberry dark:text-apple-core">
                      Reset Day
                    </Label>
                    <UnifiedInput
                      id="reset_day"
                      type="number"
                      value={formData.reset_day}
                      onChange={(e) => handleInputChange('reset_day', parseInt(e.target.value))}
                      placeholder="1"
                      min="1"
                      max="31"
                      secure={true}
                    />
                    <p className="text-micro text-blueberry/60 dark:text-apple-core/60 mt-1">
                      Day of month to reset usage counter
                    </p>
                  </div>
                </div>

                <div className="space-y-4 border-t border-apple-core/20 dark:border-citrus/20 pt-4">
                  <h4 className="text-caption font-semibold text-blueberry dark:text-apple-core">
                    API Credentials
                  </h4>
                  
                  <div>
                    <Label htmlFor="client_id" className="text-caption font-medium text-blueberry dark:text-apple-core">
                      Client ID
                    </Label>
                    <UnifiedInput
                      id="client_id"
                      type="text"
                      value={adobeFormData.client_id}
                      onChange={(e) => handleAdobeInputChange('client_id', e.target.value)}
                      placeholder="Your Adobe Client ID"
                      secure={true}
                    />
                  </div>

                  <div>
                    <Label htmlFor="client_secret" className="text-caption font-medium text-blueberry dark:text-apple-core">
                      Client Secret
                    </Label>
                    <UnifiedInput
                      id="client_secret"
                      type="password"
                      value={adobeFormData.client_secret}
                      onChange={(e) => handleAdobeInputChange('client_secret', e.target.value)}
                      placeholder={adobeCredentials ? "Enter new secret to update" : "Your Adobe Client Secret"}
                      secure={true}
                    />
                    <p className="text-micro text-blueberry/60 dark:text-apple-core/60 mt-1">
                      {adobeCredentials ? "Leave blank to keep existing secret" : "This will be encrypted and stored securely"}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="organization_id" className="text-caption font-medium text-blueberry dark:text-apple-core">
                      Organization ID
                    </Label>
                    <UnifiedInput
                      id="organization_id"
                      type="text"
                      value={adobeFormData.organization_id}
                      onChange={(e) => handleAdobeInputChange('organization_id', e.target.value)}
                      placeholder="Your Adobe Organization ID"
                      secure={true}
                    />
                  </div>

                  <Button
                    onClick={handleSaveAdobeCredentials}
                    disabled={saving || !adobeFormData.client_id || !adobeFormData.organization_id || (!adobeCredentials && !adobeFormData.client_secret)}
                    className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Adobe Credentials'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* General Site Settings */}
      <Card className="border border-apple-core/20 dark:border-citrus/20">
        <CardHeader>
          <CardTitle className="flex items-center text-heading font-semibold text-blueberry dark:text-citrus">
            <Settings className="h-5 w-5 text-apricot mr-2" />
            General Site Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin_email" className="text-caption font-medium text-blueberry dark:text-apple-core">
                Admin Email
              </Label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blueberry/60 dark:text-apple-core/60" />
                <UnifiedInput
                  id="admin_email"
                  type="email"
                  value={formData.admin_email}
                  onChange={(e) => handleInputChange('admin_email', e.target.value)}
                  placeholder="admin@company.com"
                  className="pl-10"
                  maxLength={100}
                  secure={true}
                />
              </div>
              <p className="text-micro text-blueberry/60 dark:text-apple-core/60 mt-1">
                Email address for administrative notifications and Adobe usage alerts
              </p>
            </div>

            <div>
              <Label htmlFor="support_email" className="text-caption font-medium text-blueberry dark:text-apple-core">
                Support Email
              </Label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blueberry/60 dark:text-apple-core/60" />
                <UnifiedInput
                  id="support_email"
                  type="email"
                  value={formData.support_email}
                  onChange={(e) => handleInputChange('support_email', e.target.value)}
                  placeholder="support@company.com"
                  className="pl-10"
                  maxLength={100}
                  secure={true}
                />
              </div>
              <p className="text-micro text-blueberry/60 dark:text-apple-core/60 mt-1">
                Email address for customer support and feedback forms
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-apple-core/20 dark:border-citrus/20">
            <div className="text-caption text-blueberry/60 dark:text-apple-core/60">
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