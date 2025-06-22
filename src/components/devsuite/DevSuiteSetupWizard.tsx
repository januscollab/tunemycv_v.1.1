import React, { useState } from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from './ui/ModernCard';
import { ModernButton } from './ui/ModernButton';
import { CaptureInput } from '@/components/ui/capture-input';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, FileCode, Package, CheckCircle, AlertCircle, Play } from 'lucide-react';

interface SetupFile {
  file: File | null;
  uploaded: boolean;
  error?: string;
}

const DevSuiteSetupWizard = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [installing, setInstalling] = useState(false);
  const [pageFile, setPageFile] = useState<SetupFile>({ file: null, uploaded: false });
  const [zipFile, setZipFile] = useState<SetupFile>({ file: null, uploaded: false });
  const [installUrl, setInstallUrl] = useState('');

  const handleFileUpload = async (fileType: 'page' | 'zip', file: File) => {
    if (!user) return;

    try {
      // Validate file types
      if (fileType === 'page' && !file.name.endsWith('.html')) {
        throw new Error('Page file must be an HTML file');
      }
      if (fileType === 'zip' && !file.name.endsWith('.zip')) {
        throw new Error('Package file must be a ZIP file');
      }

      const fileName = `${user.id}/${fileType}/${Date.now()}-${file.name}`;

      // Upload to storage
      const { data, error } = await supabase.storage
        .from('task-images') // Using existing bucket for simplicity
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('task-images')
        .getPublicUrl(fileName);

      if (fileType === 'page') {
        setPageFile({ file, uploaded: true });
        setInstallUrl(publicUrl);
      } else {
        setZipFile({ file, uploaded: true });
      }

      toast.success(`${fileType === 'page' ? 'Page' : 'Package'} uploaded successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      if (fileType === 'page') {
        setPageFile({ file, uploaded: false, error: errorMessage });
      } else {
        setZipFile({ file, uploaded: false, error: errorMessage });
      }
      
      toast.error(errorMessage);
    }
  };

  const handleInstall = async () => {
    if (!pageFile.uploaded || !zipFile.uploaded) {
      toast.error('Please upload both files before installing');
      return;
    }

    setInstalling(true);
    try {
      // Simulate installation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setStep(4);
      toast.success('DevSuite installation completed!');
    } catch (error) {
      toast.error('Installation failed');
    } finally {
      setInstalling(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return pageFile.uploaded;
      case 2: return zipFile.uploaded;
      case 3: return pageFile.uploaded && zipFile.uploaded;
      default: return false;
    }
  };

  const getProgress = () => {
    const completed = [pageFile.uploaded, zipFile.uploaded, step >= 4].filter(Boolean).length;
    return (completed / 3) * 100;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileCode className="h-16 w-16 text-zapier-orange mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Installation Page</h3>
              <p className="text-muted-foreground">
                Upload the HTML page that will serve as your DevSuite installation interface
              </p>
            </div>

            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-ring cursor-pointer transition-colors"
              onClick={() => document.getElementById('page-upload')?.click()}
            >
              <input
                id="page-upload"
                type="file"
                accept=".html"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('page', file);
                }}
              />
              
              {pageFile.file ? (
                <div className="space-y-2">
                  {pageFile.uploaded ? (
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  ) : pageFile.error ? (
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  )}
                  <p className="font-medium">{pageFile.file.name}</p>
                  {pageFile.error && (
                    <p className="text-sm text-destructive">{pageFile.error}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="font-medium">Click to upload HTML page</p>
                  <p className="text-sm text-muted-foreground">Supports .html files</p>
                </div>
              )}
            </div>

            {installUrl && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Installation URL:</p>
                <CaptureInput
                  label=""
                  value={installUrl}
                  readOnly
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This URL will be used to access your DevSuite installation page
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Package className="h-16 w-16 text-zapier-orange mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Package Files</h3>
              <p className="text-muted-foreground">
                Upload the ZIP file containing all necessary DevSuite components and assets
              </p>
            </div>

            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-ring cursor-pointer transition-colors"
              onClick={() => document.getElementById('zip-upload')?.click()}
            >
              <input
                id="zip-upload"
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('zip', file);
                }}
              />
              
              {zipFile.file ? (
                <div className="space-y-2">
                  {zipFile.uploaded ? (
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  ) : zipFile.error ? (
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  )}
                  <p className="font-medium">{zipFile.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(zipFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {zipFile.error && (
                    <p className="text-sm text-destructive">{zipFile.error}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="font-medium">Click to upload ZIP package</p>
                  <p className="text-sm text-muted-foreground">Supports .zip files up to 50MB</p>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Play className="h-16 w-16 text-zapier-orange mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Install</h3>
              <p className="text-muted-foreground">
                All files uploaded successfully. Click install to set up DevSuite.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Installation Page</span>
                </div>
                <p className="text-sm text-muted-foreground">{pageFile.file?.name}</p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Package Files</span>
                </div>
                <p className="text-sm text-muted-foreground">{zipFile.file?.name}</p>
              </div>
            </div>

            {installing && (
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-zapier-orange border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="font-medium">Installing DevSuite...</p>
                <p className="text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div>
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-500 mb-2">Installation Complete!</h3>
              <p className="text-muted-foreground">
                DevSuite has been successfully installed and is ready to use.
              </p>
            </div>

            {installUrl && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p className="font-medium mb-2">Access your DevSuite installation:</p>
                <a
                  href={installUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 dark:text-green-400 underline hover:no-underline"
                >
                  {installUrl}
                </a>
              </div>
            )}

            <ModernButton
              modernVariant="primary"
              onClick={() => {
                setStep(1);
                setPageFile({ file: null, uploaded: false });
                setZipFile({ file: null, uploaded: false });
                setInstallUrl('');
              }}
            >
              Start New Installation
            </ModernButton>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ModernCard className="animate-fade-in">
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            DevSuite Setup Wizard
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Setup Progress</span>
              <span>{Math.round(getProgress())}%</span>
            </div>
            <Progress value={getProgress()} className="w-full" />
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  stepNum === step
                    ? 'bg-zapier-orange text-white'
                    : stepNum < step
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepNum < step ? <CheckCircle className="h-4 w-4" /> : stepNum}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex justify-between pt-6">
              <ModernButton
                modernVariant="ghost"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
              >
                Previous
              </ModernButton>

              {step === 3 ? (
                <ModernButton
                  modernVariant="primary"
                  onClick={handleInstall}
                  disabled={!canProceed() || installing}
                  isLoading={installing}
                >
                  {installing ? 'Installing...' : 'Install DevSuite'}
                </ModernButton>
              ) : (
                <ModernButton
                  modernVariant="primary"
                  onClick={() => setStep(Math.min(4, step + 1))}
                  disabled={!canProceed()}
                >
                  Next
                </ModernButton>
              )}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};

export default DevSuiteSetupWizard;