import React, { useState } from 'react';
import { CheckCircle, Download, ArrowLeft, Bug } from 'lucide-react';

import { useProfileData } from '@/hooks/useProfileData';
import { FloatingFeedbackForm } from '@/components/common/FloatingFeedbackForm';
import CompatibilityBreakdownSection from './CompatibilityBreakdownSection';
import EnhancedKeywordAnalysis from './EnhancedKeywordAnalysis';
import SkillsGapAnalysis from './SkillsGapAnalysis';
import ATSOptimizationSection from './ATSOptimizationSection';
import InterviewPrepSection from './InterviewPrepSection';
import AnalysisHeader from './components/AnalysisHeader';
import AnalysisScoreCard from './components/AnalysisScoreCard';
import LegacySummarySection from './components/LegacySummarySection';
import AnalysisSummarySection from './components/AnalysisSummarySection';
import LegacyCompatibilitySection from './components/LegacyCompatibilitySection';
import LegacyKeywordSection from './components/LegacyKeywordSection';
import PriorityRecommendationsSection from './components/PriorityRecommendationsSection';
import PersonalizedMatchMessage from './components/PersonalizedMatchMessage';
import NextStepsSection from './components/NextStepsSection';
import N8nAnalysisResults from './N8nAnalysisResults';
import PDFGenerator from './utils/PDFGenerator';

interface AnalysisResultsProps {
  result: any;
  onStartNew: () => void;
  readOnly?: boolean;
}

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  userName: string;
}

const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose, transactionId, userName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal flex items-center justify-center p-space-1">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-border">
        <div className="p-space-1.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-space-0.75">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <Bug className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-subheading font-semibold text-foreground">
                Report Analysis Error
              </h2>
              <p className="text-caption text-muted-foreground">
                Help us improve by reporting issues
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-space-0.5 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close bug report form"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 p-space-1.5 overflow-y-auto">
          <FloatingFeedbackForm 
            onClose={onClose} 
            currentPage="analysis"
            prefilledData={{
              category: 'bug',
              subject: 'Bug Report',
              message: `I encountered an error in my CV analysis report.\n\nTransaction ID: ${transactionId}\nUser: ${userName}\n\nError details:\n`
            }}
          />
        </div>
      </div>
    </div>
  );
};

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onStartNew, readOnly = false }) => {
  const [showBugReport, setShowBugReport] = useState(false);
  const { getUserDisplayName } = useProfileData();
  
  // Check if this is an n8n analysis result
  if (result.analysis_type === 'n8n') {
    return <N8nAnalysisResults result={result} onStartNew={onStartNew} readOnly={readOnly} />;
  }
  
  const getMatchLevel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 70) return 'Good Match';
    if (score >= 50) return 'Moderate to Good Match';
    return 'Needs Improvement';
  };

  // Check if we have enhanced data structure
  const hasEnhancedData = result.executiveSummary || result.compatibilityBreakdown || result.keywordAnalysis;

  // Extract company and position information
  const companyName = result.companyName || result.company_name || 'the Company';
  const position = result.position || result.job_title || 'the Position';
  const compatibilityScore = result.compatibilityScore || result.compatibility_score || 0;

  // Extract transaction ID from result
  const transactionId = result.id || result.analysis_id || 'N/A';

  // Extract analysis date and credits used
  const analysisDate = result.created_at ? new Date(result.created_at).toLocaleDateString() : new Date().toLocaleDateString();
  const creditsUsed = result.credits_used || 1;

  const downloadPDF = () => {
    const pdfGenerator = new PDFGenerator();
    pdfGenerator.generatePDF(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with title, back button, and download icon */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {!readOnly && (
              <button
                onClick={onStartNew}
                className="flex items-center space-x-2 text-apricot hover:text-apricot/80 transition-colors mr-6"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Analyze Another CV</span>
              </button>
            )}
            <div>
              <h1 className="text-heading font-semibold text-gray-900 dark:text-citrus">
                {companyName} - {position}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-caption text-gray-600 dark:text-apple-core/70">
                <div className="flex items-center gap-1">
                  <span>Analyzed on {analysisDate}</span>
                </div>
                <span>•</span>
                <span>Match Score: {compatibilityScore}%</span>
                <span>•</span>
                <span>Credits Used: {creditsUsed}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={downloadPDF}
            className="flex items-center space-x-2 text-apricot hover:text-apricot/80 transition-colors font-normal"
          >
            <Download className="h-4 w-4" />
            <span className="font-normal">Download PDF</span>
          </button>
        </div>


        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Score Display */}
          <div className="lg:col-span-1">
            <AnalysisScoreCard 
              score={compatibilityScore}
              jobTitle={position}
              companyName={companyName}
              getMatchLevel={getMatchLevel}
            />
          </div>

          {/* Right Column - Analysis Summary */}
          <div className="lg:col-span-2">
            <AnalysisSummarySection
              compatibilityScore={compatibilityScore}
              jobTitle={position}
              companyName={companyName}
              onDownload={downloadPDF}
            />
          </div>
        </div>

        {/* Personalized Match Message */}
        <PersonalizedMatchMessage
          score={compatibilityScore}
          jobTitle={position}
          companyName={companyName}
          getMatchLevel={getMatchLevel}
        />

        {/* Enhanced Analysis Sections */}
        {hasEnhancedData ? (
          <div className="space-y-8">
            {/* Priority Recommendations - Show first as it's most actionable */}
            {result.priorityRecommendations && result.priorityRecommendations.length > 0 && (
              <PriorityRecommendationsSection recommendations={result.priorityRecommendations} />
            )}

            {/* Side-by-side sections: Compatibility Breakdown and Keyword Analysis */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Compatibility Breakdown */}
              {result.compatibilityBreakdown && (
                <CompatibilityBreakdownSection compatibilityBreakdown={result.compatibilityBreakdown} />
              )}

              {/* Keyword Analysis */}
              {result.keywordAnalysis && (
                <EnhancedKeywordAnalysis keywordAnalysis={result.keywordAnalysis} />
              )}
            </div>

            {/* Skills Gap Analysis */}
            {result.skillsGapAnalysis && (
              <SkillsGapAnalysis skillsGapAnalysis={result.skillsGapAnalysis} />
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <LegacyCompatibilitySection result={result} />
            <LegacyKeywordSection result={result} />
          </div>
        )}

        {/* Transaction ID Note with Bug Report */}
        <div className="mt-12 mb-8 bg-gray-50 dark:bg-blueberry/10 border border-gray-200 dark:border-citrus/20 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-caption text-blueberry/70 dark:text-apple-core/80">
                <strong>Note:</strong> While our AI models are well-trained, occasional errors may occur. 
                If you believe there's an error in your report, please contact us at{' '}
                <a href="mailto:hello@tunemycv.com" className="text-apricot hover:text-apricot/80 underline">
                  hello@tunemycv.com
                </a>{' '}
                and quote transaction ID: <span className="font-mono text-blueberry dark:text-citrus">{transactionId}</span> for investigation.
              </p>
            </div>
            <button
              onClick={() => setShowBugReport(true)}
              className="ml-4 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors flex items-center gap-1 text-caption font-medium"
              title="Report an error in this analysis"
            >
              <Bug className="h-4 w-4" />
              <span className="hidden sm:inline">Report Error</span>
            </button>
          </div>
        </div>

        {/* Next Steps Section - only show if not in read-only mode */}
        {!readOnly && (
          <div className="mt-12">
            <NextStepsSection onStartNew={onStartNew} />
          </div>
        )}

        {/* Bug Report Modal */}
        <BugReportModal
          isOpen={showBugReport}
          onClose={() => setShowBugReport(false)}
          transactionId={transactionId}
          userName={getUserDisplayName()}
        />
      </div>
    </div>
  );
};

export default AnalysisResults;