
import React from 'react';
import { useUserData } from '@/hooks/useUserData';
import AnalysisHistoryTab from '@/components/analyze/tabs/AnalysisHistoryTab';

const NextSteps = () => {
  const { credits, memberSince } = useUserData();

  const handleAnalysisSelect = (analysis: any) => {
    // Handle analysis selection if needed
    console.log('Analysis selected:', analysis);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/10 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blueberry dark:text-citrus mb-4">Next Steps</h1>
          <p className="text-xl text-blueberry/80 dark:text-apple-core max-w-2xl">
            Review your analysis history and take the next steps in your career journey.
          </p>
        </div>
        
        <AnalysisHistoryTab onAnalysisSelect={handleAnalysisSelect} />
      </div>
    </div>
  );
};

export default NextSteps;
