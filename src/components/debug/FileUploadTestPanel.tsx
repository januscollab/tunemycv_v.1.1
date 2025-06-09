import React, { useState } from 'react';
import { FileText, Upload, Check, X, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp?: string;
}

const FileUploadTestPanel: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const addTestResult = (step: string, status: 'pending' | 'success' | 'error', message: string) => {
    setTestResults(prev => [
      ...prev.filter(r => r.step !== step),
      {
        step,
        status,
        message,
        timestamp: status === 'pending' ? undefined : new Date().toLocaleTimeString()
      }
    ]);
  };

  const runComprehensiveTest = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'Please log in to run tests', variant: 'destructive' });
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: CV Upload to Debug System
      addTestResult('cv-upload', 'pending', 'Testing CV upload to debug system...');
      const testCVContent = 'John Doe\nSoftware Engineer\nExperience: 5 years in React development';
      const testCVFile = new File([testCVContent], 'test-cv.txt', { type: 'text/plain' });
      const cvArrayBuffer = await testCVFile.arrayBuffer();
      const cvBase64 = btoa(String.fromCharCode(...new Uint8Array(cvArrayBuffer)));

      const cvResult = await supabase.functions.invoke('save-user-upload', {
        body: {
          fileContent: cvBase64,
          fileName: 'test-cv-debug.txt',
          fileType: 'text/plain',
          uploadType: 'cv',
          userId: user.id
        }
      });

      if (cvResult.error) throw new Error(`CV upload failed: ${cvResult.error.message}`);
      addTestResult('cv-upload', 'success', 'CV successfully saved to debug system');

      // Test 2: Job Description Upload to Debug System
      addTestResult('jd-upload', 'pending', 'Testing job description upload to debug system...');
      const testJDContent = 'Senior Software Engineer\nCompany: Tech Corp\nRequirements: React, TypeScript, 5+ years experience';
      
      const jdResult = await supabase.functions.invoke('save-job-description', {
        body: {
          content: testJDContent,
          jobTitle: 'Senior Software Engineer',
          companyName: 'Tech Corp',
          userId: user.id
        }
      });

      if (jdResult.error) throw new Error(`Job description upload failed: ${jdResult.error.message}`);
      addTestResult('jd-upload', 'success', 'Job description successfully saved to debug system');

      // Test 3: Verify Debug Files Created
      addTestResult('debug-verify', 'pending', 'Verifying debug files were created...');
      
      const { data: debugFiles, error: debugError } = await supabase
        .from('adobe_debug_files')
        .select('*')
        .eq('user_id', (await supabase.from('profiles').select('user_id').eq('id', user.id).single()).data?.user_id || 'unknown')
        .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Files created in last minute
        .order('created_at', { ascending: false });

      if (debugError) throw new Error(`Debug verification failed: ${debugError.message}`);
      
      const recentFiles = debugFiles?.filter(f => 
        f.file_name.includes('test-cv-debug') || f.file_name.includes('Job_Description')
      ) || [];

      if (recentFiles.length >= 2) {
        addTestResult('debug-verify', 'success', `Found ${recentFiles.length} debug files with correct naming`);
      } else {
        addTestResult('debug-verify', 'error', `Only found ${recentFiles.length} debug files, expected 2`);
      }

      // Test 4: State Tracking Verification
      addTestResult('state-verify', 'pending', 'Verifying state tracking...');
      
      const uploadedStateFiles = recentFiles.filter(f => f.state === 'uploaded-by-user');
      if (uploadedStateFiles.length >= 2) {
        addTestResult('state-verify', 'success', 'All files have correct "uploaded-by-user" state');
      } else {
        addTestResult('state-verify', 'error', `Only ${uploadedStateFiles.length} files have correct state`);
      }

      // Test 5: File Naming Convention Check
      addTestResult('naming-verify', 'pending', 'Verifying file naming conventions...');
      
      const namingPattern = /^\d{6} .+ \d{6}-\d{6} uploaded-by-user\./;
      const correctlyNamed = recentFiles.filter(f => namingPattern.test(f.file_name));
      
      if (correctlyNamed.length === recentFiles.length && recentFiles.length > 0) {
        addTestResult('naming-verify', 'success', 'All files follow correct naming convention');
      } else {
        addTestResult('naming-verify', 'error', `${correctlyNamed.length}/${recentFiles.length} files have correct naming`);
      }

      toast({ title: 'Test Complete', description: 'File upload pipeline test completed successfully' });

    } catch (error) {
      console.error('Test failed:', error);
      addTestResult('error', 'error', error instanceof Error ? error.message : 'Unknown error occurred');
      toast({ title: 'Test Failed', description: 'File upload pipeline test encountered errors', variant: 'destructive' });
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-apricot" />
          <h2 className="text-title font-semibold text-slate-900 dark:text-citrus">Debug File Upload Pipeline Test</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={runComprehensiveTest}
            disabled={isRunning || !user}
            className="px-4 py-2 bg-apricot text-white rounded-md hover:bg-apricot/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Run Test</span>
          </button>
          <button
            onClick={clearResults}
            disabled={isRunning}
            className="px-4 py-2 bg-slate-500 text-white rounded-md hover:bg-slate-600 disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {!user && (
        <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md mb-4">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <span className="text-caption text-yellow-700 dark:text-yellow-300">Please log in to run pipeline tests</span>
        </div>
      )}

      <div className="space-y-3">
        {testResults.length === 0 && !isRunning && (
          <p className="text-slate-600 dark:text-apple-core/80 text-center py-8">
            Click "Run Test" to validate the file upload pipeline with debug file naming
          </p>
        )}

        {testResults.map((result, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-md border ${
              result.status === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                : result.status === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(result.status)}
              <div>
                <div className="font-medium text-slate-900 dark:text-citrus capitalize">
                  {result.step.replace('-', ' ')}
                </div>
                <div className="text-caption text-slate-600 dark:text-apple-core/80">
                  {result.message}
                </div>
              </div>
            </div>
            {result.timestamp && (
              <span className="text-micro text-slate-500 dark:text-apple-core/60">
                {result.timestamp}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-slate-50 dark:bg-blueberry/10 rounded-md">
        <h3 className="font-medium text-slate-900 dark:text-citrus mb-2">Test Coverage</h3>
        <ul className="text-caption text-slate-600 dark:text-apple-core/80 space-y-1">
          <li>• CV upload to debug system with proper naming</li>
          <li>• Job description upload to debug system</li>
          <li>• Debug file creation verification</li>
          <li>• State tracking verification ("uploaded-by-user")</li>
          <li>• File naming convention compliance</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUploadTestPanel;