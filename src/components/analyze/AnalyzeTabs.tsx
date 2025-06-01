
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CVAnalysisTab from './CVAnalysisTab';
import CurrentReportTab from './CurrentReportTab';
import AnalysisHistoryTabReplica from './AnalysisHistoryTabReplica';
import { UploadedFile } from '@/types/fileTypes';

interface AnalyzeTabsProps {
  uploadedFiles: {
    cv?: UploadedFile;
    jobDescription?: UploadedFile;
  };
  jobTitle: string;
  setJobTitle: (title: string) => void;
  onCVSelect: (uploadedFile: UploadedFile) => void;
  onJobDescriptionSet: (uploadedFile: UploadedFile) => void;
  onAnalysis: () => void;
  canAnalyze: boolean;
  analyzing: boolean;
  hasCreditsForAI: boolean;
  uploading: boolean;
  analysisResult: any;
  onStartNew: () => void;
}

const AnalyzeTabs: React.FC<AnalyzeTabsProps> = ({
  uploadedFiles,
  jobTitle,
  setJobTitle,
  onCVSelect,
  onJobDescriptionSet,
  onAnalysis,
  canAnalyze,
  analyzing,
  hasCreditsForAI,
  uploading,
  analysisResult,
  onStartNew
}) => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [selectedHistoryAnalysis, setSelectedHistoryAnalysis] = useState<any>(null);

  const handleViewAnalysis = (analysis: any) => {
    setSelectedHistoryAnalysis(analysis);
    setActiveTab('report');
  };

  const getCurrentReportData = () => {
    if (selectedHistoryAnalysis) {
      return selectedHistoryAnalysis;
    }
    return analysisResult;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="analysis">CV Analysis</TabsTrigger>
        <TabsTrigger value="report">Current Report</TabsTrigger>
        <TabsTrigger value="history">Analysis History</TabsTrigger>
      </TabsList>

      <TabsContent value="analysis" className="mt-6">
        <CVAnalysisTab
          uploadedFiles={uploadedFiles}
          jobTitle={jobTitle}
          setJobTitle={setJobTitle}
          onCVSelect={onCVSelect}
          onJobDescriptionSet={onJobDescriptionSet}
          onAnalysis={onAnalysis}
          canAnalyze={canAnalyze}
          analyzing={analyzing}
          hasCreditsForAI={hasCreditsForAI}
          uploading={uploading}
        />
      </TabsContent>

      <TabsContent value="report" className="mt-6">
        <CurrentReportTab
          analysisResult={getCurrentReportData()}
          onStartNew={() => {
            setSelectedHistoryAnalysis(null);
            onStartNew();
            setActiveTab('analysis');
          }}
        />
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <AnalysisHistoryTabReplica onViewAnalysis={handleViewAnalysis} />
      </TabsContent>
    </Tabs>
  );
};

export default AnalyzeTabs;
