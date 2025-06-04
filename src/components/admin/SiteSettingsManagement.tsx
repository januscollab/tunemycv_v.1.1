import React from 'react';
import { Settings, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const SiteSettingsManagement = () => {
  const { settings, loading, updateSetting } = useSiteSettings();

  const handleCopyFunctionToggle = async (enabled: boolean) => {
    await updateSetting('allow_copy_function', enabled);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="h-6 w-6 text-blueberry" />
        <h1 className="text-2xl font-bold text-blueberry">Site Settings</h1>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure site-wide settings that affect all users. Changes take effect immediately.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Security</CardTitle>
            <CardDescription>
              Control how users can interact with content on the site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="copy-function" className="text-base font-medium">
                  Allow Copy Function
                </Label>
                <p className="text-sm text-gray-600">
                  When disabled, users cannot copy text content from analysis results, cover letters, and other sensitive areas
                </p>
              </div>
              <Switch
                id="copy-function"
                checked={settings?.allow_copy_function === true}
                onCheckedChange={handleCopyFunctionToggle}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Management</CardTitle>
            <CardDescription>
              Configure file upload and storage settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  Maximum File Size
                </Label>
                <p className="text-sm text-gray-600">
                  Current limit: {settings?.max_file_size_mb || 10} MB
                </p>
              </div>
              <span className="text-sm text-gray-500">Coming Soon</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance</CardTitle>
            <CardDescription>
              Control site availability and maintenance modes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">
                  Maintenance Mode
                </Label>
                <p className="text-sm text-gray-600">
                  Currently: {settings?.maintenance_mode ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <span className="text-sm text-gray-500">Coming Soon</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SiteSettingsManagement;