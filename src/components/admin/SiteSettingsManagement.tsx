import React, { useState, useEffect, useCallback } from 'react';
import { Save, Mail, Settings, Calendar, TrendingUp, AlertTriangle, Shield, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FloatingLabelInput } from '@/components/common/FloatingLabelInput';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProgressIndicator } from '@/components/ui/progress-indicator';

interface SiteSettings {
  id: string;
  admin_email: string;
  support_email: string;
  monthly_adobe_limit: number;
  reset_day: number;
  adobe_api_enabled: boolean;
  debug_mode: boolean;
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
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState({
    admin_email: '',
    support_email: '',
    monthly_adobe_limit: 500,
    reset_day: 1,
    adobe_api_enabled: false,
    debug_mode: true
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
          adobe_api_enabled: data.adobe_api_enabled || false,
          debug_mode: data.debug_mode ?? true
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

  // Auto-save function for immediate settings like toggle
  const autoSaveSettings = useCallback(async (updatedData: Partial<typeof formData>) => {
    if (autoSaving) return; // Prevent multiple simultaneous saves
    
    setAutoSaving(true);
    setAutoSaveStatus('saving');
    
    try {
      const dataToSave = { ...formData, ...updatedData };
      
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('site_settings')
          .update({
            admin_email: dataToSave.admin_email,
            support_email: dataToSave.support_email,
            monthly_adobe_limit: dataToSave.monthly_adobe_limit,
            reset_day: dataToSave.reset_day,
            adobe_api_enabled: dataToSave.adobe_api_enabled,
            debug_mode: dataToSave.debug_mode
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('site_settings')
          .insert({
            admin_email: dataToSave.admin_email,
            support_email: dataToSave.support_email,
            monthly_adobe_limit: dataToSave.monthly_adobe_limit,
            reset_day: dataToSave.reset_day,
            adobe_api_enabled: dataToSave.adobe_api_enabled,
            debug_mode: dataToSave.debug_mode
          });

        if (error) throw error;
      }

      setAutoSaveStatus('success');
      
      // Update settings state with the saved data
      await loadSettings();
      
      // Show success status briefly
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Error auto-saving settings:', error);
      setAutoSaveStatus('error');
      
      // Show error status briefly
      setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 3000);
    } finally {
      setAutoSaving(false);
    }
  }, [formData, settings, autoSaving]);

  // Debounced auto-save for text fields
  const debouncedAutoSave = useCallback((updatedData: Partial<typeof formData>, delay: number = 1000) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    const timeout = setTimeout(() => {
      autoSaveSettings(updatedData);
    }, delay);
    
    setDebounceTimeout(timeout);
  }, [autoSaveSettings, debounceTimeout]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  // Handle Adobe API toggle with immediate auto-save
  const handleAdobeToggleChange = useCallback(async (enabled: boolean) => {
    const updatedData = { adobe_api_enabled: enabled };
    
    // Update local state immediately for responsive UI
    setFormData(prev => ({
      ...prev,
      adobe_api_enabled: enabled
    }));
    
    // Auto-save immediately for this critical setting
    await autoSaveSettings(updatedData);
  }, [autoSaveSettings]);

  // Handle Debug mode toggle with immediate auto-save
  const handleDebugToggleChange = useCallback(async (enabled: boolean) => {
    const updatedData = { debug_mode: enabled };
    
    // Update local state immediately for responsive UI
    setFormData(prev => ({
      ...prev,
      debug_mode: enabled
    }));
    
    // Auto-save immediately for this critical setting
    await autoSaveSettings(updatedData);
  }, [autoSaveSettings]);

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
            adobe_api_enabled: formData.adobe_api_enabled,
            debug_mode: formData.debug_mode
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
            adobe_api_enabled: formData.adobe_api_enabled,
            debug_mode: formData.debug_mode
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
    if (percentage >= 100) return 'text-destructive';
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 80) return 'text-warning';
    if (percentage >= 50) return 'text-warning';
    return 'text-success';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-destructive';
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 80) return 'bg-warning';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-success';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Adobe Usage Dashboard */}
      {formData.adobe_api_enabled && adobeUsage && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-heading font-semibold text-foreground">
              <TrendingUp className="h-5 w-5 text-primary mr-space-0.5" />
              Adobe PDF Services Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-space-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-1">
              <div className="space-y-space-0.5">
                <Label className="text-caption font-medium text-foreground">
                  Current Usage
                </Label>
                <div className={`text-2xl font-bold ${getUsageStatusColor(adobeUsage.usage_percentage)}`}>
                  {adobeUsage.current_usage} / {adobeUsage.monthly_limit}
                </div>
                <ProgressIndicator 
                  value={Math.min(adobeUsage.usage_percentage, 100)} 
                  size="sm"
                  showPercentage={false}
                />
                <p className="text-micro text-muted-foreground">
                  {adobeUsage.usage_percentage.toFixed(1)}% of monthly limit
                </p>
              </div>
              
              <div className="space-y-space-0.5">
                <Label className="text-caption font-medium text-foreground">
                  Days Until Reset
                </Label>
                <div className="text-2xl font-bold text-foreground">
                  {adobeUsage.days_until_reset}
                </div>
                <p className="text-micro text-muted-foreground">
                  Resets on {new Date(adobeUsage.reset_date).toLocaleDateString()}
                </p>
              </div>
              
              <div className="space-y-space-0.5">
                <Label className="text-caption font-medium text-foreground">
                  Status
                </Label>
                <div className={`text-lg font-semibold ${getUsageStatusColor(adobeUsage.usage_percentage)}`}>
                  {adobeUsage.usage_percentage >= 100 ? (
                    <span className="flex items-center"><AlertTriangle className="h-4 w-4 mr-space-0.25" />Limit Reached</span>
                  ) : adobeUsage.usage_percentage >= 90 ? (
                    <span className="flex items-center"><AlertTriangle className="h-4 w-4 mr-space-0.25" />Critical</span>
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
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-heading font-semibold text-foreground">
            <Shield className="h-5 w-5 text-primary mr-space-0.5" />
            Adobe PDF Services Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-space-1.5">
          <div className="space-y-space-1">
            <div className="flex items-center space-x-space-0.5">
              <input
                type="checkbox"
                id="adobe_api_enabled"
                checked={formData.adobe_api_enabled}
                onChange={(e) => handleAdobeToggleChange(e.target.checked)}
                disabled={autoSaving}
                className="rounded border-input-border disabled:opacity-50"
              />
              <Label htmlFor="adobe_api_enabled" className="text-caption font-medium text-foreground">
                Enable Adobe PDF Services API
              </Label>
              {autoSaveStatus === 'saving' && (
                <div className="flex items-center ml-space-0.5">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-micro text-muted-foreground ml-space-0.25">
                    Auto-saving...
                  </span>
                </div>
              )}
              {autoSaveStatus === 'success' && (
                <div className="flex items-center ml-space-0.5">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-micro text-success ml-space-0.25">
                    Auto-saved
                  </span>
                </div>
              )}
              {autoSaveStatus === 'error' && (
                <div className="flex items-center ml-space-0.5">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-micro text-destructive ml-space-0.25">
                    Auto-save failed
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-space-0.5">
              <input
                type="checkbox"
                id="debug_mode"
                checked={formData.debug_mode}
                onChange={(e) => handleDebugToggleChange(e.target.checked)}
                disabled={autoSaving}
                className="rounded border-input-border disabled:opacity-50"
              />
              <Label htmlFor="debug_mode" className="text-caption font-medium text-foreground">
                Enable Debug Mode
              </Label>
              {autoSaveStatus === 'saving' && (
                <div className="flex items-center ml-space-0.5">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-micro text-muted-foreground ml-space-0.25">
                    Auto-saving...
                  </span>
                </div>
              )}
              {autoSaveStatus === 'success' && (
                <div className="flex items-center ml-space-0.5">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-micro text-success ml-space-0.25">
                    Auto-saved
                  </span>
                </div>
              )}
              {autoSaveStatus === 'error' && (
                <div className="flex items-center ml-space-0.5">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-micro text-destructive ml-space-0.25">
                    Auto-save failed
                  </span>
                </div>
              )}
            </div>
            <p className="text-micro text-muted-foreground -mt-space-0.25">
              When enabled, Adobe PDF extraction saves debug ZIP files to storage for inspection
            </p>

            {formData.adobe_api_enabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-1">
                  <div>
                    <Label htmlFor="monthly_adobe_limit" className="text-caption font-medium text-foreground">
                      Monthly Limit
                    </Label>
                    <FloatingLabelInput
                      id="monthly_adobe_limit"
                      label="Monthly Limit"
                      type="number"
                      value={formData.monthly_adobe_limit.toString()}
                      onChange={(e) => handleInputChange('monthly_adobe_limit', parseInt(e.target.value))}
                      placeholder="500"
                      min="1"
                      max="10000"
                    />
                    <p className="text-micro text-muted-foreground mt-space-0.25">
                      Maximum API calls per month
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="reset_day" className="text-caption font-medium text-foreground">
                      Reset Day
                    </Label>
                    <FloatingLabelInput
                      id="reset_day"
                      label="Reset Day"
                      type="number"
                      value={formData.reset_day.toString()}
                      onChange={(e) => handleInputChange('reset_day', parseInt(e.target.value))}
                      placeholder="1"
                      min="1"
                      max="31"
                    />
                    <p className="text-micro text-muted-foreground mt-space-0.25">
                      Day of month to reset usage counter
                    </p>
                  </div>
                </div>

                <div className="space-y-space-1 border-t border-border pt-space-1">
                  <h4 className="text-caption font-semibold text-foreground">
                    API Credentials
                  </h4>
                  
                  <div>
                    <Label htmlFor="client_id" className="text-caption font-medium text-foreground">
                      Client ID
                    </Label>
                    <FloatingLabelInput
                      id="client_id"
                      label="Client ID"
                      type="text"
                      value={adobeFormData.client_id}
                      onChange={(e) => handleAdobeInputChange('client_id', e.target.value)}
                      placeholder="Your Adobe Client ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="client_secret" className="text-caption font-medium text-foreground">
                      Client Secret
                    </Label>
                    <FloatingLabelInput
                      id="client_secret"
                      label="Client Secret"
                      type="password"
                      value={adobeFormData.client_secret}
                      onChange={(e) => handleAdobeInputChange('client_secret', e.target.value)}
                      placeholder={adobeCredentials ? "Enter new secret to update" : "Your Adobe Client Secret"}
                    />
                    <p className="text-micro text-muted-foreground mt-space-0.25">
                      {adobeCredentials ? "Leave blank to keep existing secret" : "This will be encrypted and stored securely"}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="organization_id" className="text-caption font-medium text-foreground">
                      Organization ID
                    </Label>
                    <FloatingLabelInput
                      id="organization_id"
                      label="Organization ID"
                      type="text"
                      value={adobeFormData.organization_id}
                      onChange={(e) => handleAdobeInputChange('organization_id', e.target.value)}
                      placeholder="Your Adobe Organization ID"
                    />
                  </div>

                  <Button
                    onClick={handleSaveAdobeCredentials}
                    disabled={saving || !adobeFormData.client_id || !adobeFormData.organization_id || (!adobeCredentials && !adobeFormData.client_secret)}
                    className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-normal"
                  >
                    <Save className="h-4 w-4 mr-space-0.5" />
                    {saving ? 'Saving...' : 'Save Adobe Credentials'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* General Site Settings */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-heading font-semibold text-foreground">
            <Settings className="h-5 w-5 text-primary mr-space-0.5" />
            General Site Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-space-1.5">
          <div className="space-y-space-1">
            <div>
              <Label htmlFor="admin_email" className="text-caption font-medium text-foreground">
                Admin Email
              </Label>
              <div className="mt-space-0.25 relative">
                <Mail className="absolute left-space-0.75 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FloatingLabelInput
                  id="admin_email"
                  label="Admin Email"
                  type="email"
                  value={formData.admin_email}
                  onChange={(e) => handleInputChange('admin_email', e.target.value)}
                  placeholder="admin@company.com"
                  className="pl-10"
                  maxLength={100}
                />
              </div>
              <p className="text-micro text-muted-foreground mt-space-0.25">
                Email address for administrative notifications and Adobe usage alerts
              </p>
            </div>

            <div>
              <Label htmlFor="support_email" className="text-caption font-medium text-foreground">
                Support Email
              </Label>
              <div className="mt-space-0.25 relative">
                <Mail className="absolute left-space-0.75 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FloatingLabelInput
                  id="support_email"
                  label="Support Email"
                  type="email"
                  value={formData.support_email}
                  onChange={(e) => handleInputChange('support_email', e.target.value)}
                  placeholder="support@company.com"
                  className="pl-10"
                  maxLength={100}
                />
              </div>
              <p className="text-micro text-muted-foreground mt-space-0.25">
                Email address for customer support and feedback forms
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-space-1 border-t border-border">
            <div className="text-caption text-muted-foreground">
              {settings && (
                <span>Last updated: {new Date(settings.updated_at).toLocaleDateString()}</span>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || autoSaving}
              className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-normal"
            >
              <Save className="h-4 w-4 mr-space-0.5" />
              {saving ? 'Saving...' : autoSaving ? 'Auto-saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettingsManagement;