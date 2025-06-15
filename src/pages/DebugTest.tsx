import React from 'react';
import { FileUploadTestPanel } from '@/components/debug/FileUploadTestPanel';
import { useAuth } from '@/contexts/AuthContext';

const DebugTest: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-citrus/10 to-apricot/10 dark:from-blueberry/20 dark:to-plum/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-display font-bold text-slate-900 dark:text-citrus mb-4">
              Professional Text Processing Test Suite
            </h1>
            <p className="text-body text-slate-600 dark:text-apple-core/80">
              Test and validate the professional text processing pipeline with real documents
            </p>
          </div>

          <FileUploadTestPanel />

          {user?.email === 'alan@januscollab.com' && (
            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Admin Test Mode</h3>
              <p className="text-caption text-amber-700 dark:text-amber-300">
                Running as admin user - you have access to comprehensive debug file testing and verification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugTest;