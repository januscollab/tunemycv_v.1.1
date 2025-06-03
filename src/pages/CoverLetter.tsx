
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdvancedGenerationOptions from '@/components/cover-letter/AdvancedGenerationOptions';
import AnalysisSelector from '@/components/cover-letter/AnalysisSelector';
import CoverLetterLoggedOut from '@/components/cover-letter/CoverLetterLoggedOut';
import EditableCoverLetter from '@/components/cover-letter/EditableCoverLetter';
import FloatingActionBar from '@/components/common/FloatingActionBar';

const CoverLetter = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('analysis');
  
  // Get analysis data from navigation state if available
  const analysisFromState = location.state?.analysis;
  const generationMethod = location.state?.generationMethod || 'analysis';

  useEffect(() => {
    if (generationMethod === 'analysis' && analysisFromState) {
      setActiveTab('analysis');
    }
  }, [generationMethod, analysisFromState]);

  if (!user) {
    return <CoverLetterLoggedOut />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/15 via-white to-citrus/5 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-left mb-8">
          <h1 className="text-4xl font-bold text-earth dark:text-white mb-4">
            Generate Cover Letter
          </h1>
          <p className="text-xl text-earth/70 dark:text-white/70">
            Create tailored cover letters that highlight your strengths and align perfectly with specific job requirements.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analysis">From Analysis</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-left text-xl font-semibold text-earth dark:text-white">
                  Job Details
                </h2>
              </CardHeader>
              <CardContent>
                <AnalysisSelector preselectedAnalysis={analysisFromState} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-left text-xl font-semibold text-earth dark:text-white">
                  Generation Settings
                </h2>
              </CardHeader>
              <CardContent>
                <AdvancedGenerationOptions />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <EditableCoverLetter />
        <FloatingActionBar />
      </div>
    </div>
  );
};

export default CoverLetter;
