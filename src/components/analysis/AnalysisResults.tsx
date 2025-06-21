
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
import LegacySummarySection from './components/LegacySummarySection';
import LegacyCompatibilitySection from './components/LegacyCompatibilitySection';
import LegacyKeywordSection from './components/LegacyKeywordSection';
import PriorityRecommendationsSection from './components/PriorityRecommendationsSection';
import PersonalizedMatchMessage from './components/PersonalizedMatchMessage';
import NextStepsSection from './components/NextStepsSection';
import ReactPDFViewer from '@/components/ui/react-pdf-viewer';
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
  
  // Helper function to check if job info is valid and meaningful
  const hasValidJobInfo = (jobTitle: string, companyName: string) => {
    const invalidTitles = ['unknown position', 'unknown', '', 'the position', 'position'];
    const invalidCompanies = ['unknown company', 'unknown', '', 'the company', 'company'];
    
    return jobTitle && 
           companyName && 
           !invalidTitles.includes(jobTitle.toLowerCase()) && 
           !invalidCompanies.includes(companyName.toLowerCase());
  };
  
  // Check if this is an n8n analysis result
  if (result.analysis_type === 'n8n') {
    // Extract transaction ID and analysis date
    const transactionId = result.id || result.analysis_id || 'N/A';
    const analysisDate = result.created_at ? new Date(result.created_at).toLocaleDateString() : new Date().toLocaleDateString();
    const creditsUsed = result.credits_used || 1;
    
    // Check if we have valid job information
    const validJobInfo = hasValidJobInfo(result.job_title, result.company_name);

    return (
      <div className="min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header with Start New Button */}
          {!readOnly && onStartNew && (
            <div className="flex justify-end mb-6">
              <button
                onClick={onStartNew}
                className="group flex items-center gap-2.5 px-5 py-2.5 text-muted-foreground hover:text-foreground bg-surface border border-border hover:border-border-hover rounded-lg transition-all duration-200 font-normal hover:bg-surface-hover"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="text-sm">Start New Analysis</span>
              </button>
            </div>
          )}

          {/* Analysis Header - Only show if we have valid job info */}
          {validJobInfo && (
            <div className="bg-gradient-to-r from-surface to-surface-secondary border border-border rounded-2xl p-8 mb-8 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-heading font-semibold text-foreground">
                    {result.job_title} - {result.company_name}
                  </h1>
                  {result.compatibility_score && (
                    <p className="text-subheading text-zapier-orange font-semibold">
                      {result.compatibility_score}% Compatibility Match
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-caption text-muted-foreground">
                    <span>Analyzed on {analysisDate}</span>
                    <span>•</span>
                    <span>Credits Used: {creditsUsed}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Simple header for cases without valid job info */}
          {!validJobInfo && (
            <div className="bg-gradient-to-r from-surface to-surface-secondary border border-border rounded-2xl p-8 mb-8 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-heading font-semibold text-foreground">
                    CV Analysis Report
                  </h1>
                  {result.compatibility_score && (
                    <p className="text-subheading text-zapier-orange font-semibold">
                      {result.compatibility_score}% Compatibility Match
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-caption text-muted-foreground">
                    <span>Analyzed on {analysisDate}</span>
                    <span>•</span>
                    <span>Credits Used: {creditsUsed}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PDF Viewer */}
          {result.pdf_file_data ? (
            <ReactPDFViewer
              pdfData={result.pdf_file_data}
              fileName={result.pdf_file_name || 'cv-analysis-report.pdf'}
              title="CV Analysis Report"
              className="border border-apple-core/20 dark:border-citrus/20 mb-8"
            />
          ) : (
            <div className="bg-surface border border-border rounded-lg p-8 text-center mb-8">
              <div className="text-muted-foreground">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">PDF report not available for this analysis</p>
                {result.n8n_pdf_url && (
                  <button 
                    onClick={() => window.open(result.n8n_pdf_url, '_blank', 'noopener,noreferrer')} 
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View External PDF
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-apple-core/5 dark:bg-citrus/5 border border-apple-core/20 dark:border-citrus/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-zapier-orange/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-zapier-orange" />
              </div>
              <div>
                <h4 className="text-heading font-semibold text-blueberry dark:text-citrus mb-2">
                  About Your CV Analysis
                </h4>
                <p className="text-caption text-blueberry/70 dark:text-apple-core/80">
                  Your documents were processed using our advanced analysis workflow, which provides comprehensive 
                  evaluation and generates detailed reports with actionable insights about CV-job compatibility, 
                  keyword analysis, and improvement recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* Transaction ID Note with Bug Report */}
          <div className="bg-gray-50 dark:bg-blueberry/10 border border-gray-200 dark:border-citrus/20 rounded-lg p-4">
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
  }
  
  const getMatchLevel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 70) return 'Good Match';
    if (score >= 50) return 'Moderate to Good Match';
    return 'Needs Improvement';
  };

  // Check if we have enhanced data structure for regular analysis
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
        {/* Modern Analysis Header */}
        <div className="bg-gradient-to-r from-surface to-surface-secondary border border-border rounded-2xl p-8 mb-8 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Position and Company - Modern Layout */}
              <div className="space-y-1">
                <h1 className="text-heading font-semibold text-foreground">
                  {position}
                </h1>
                <p className="text-subheading text-muted-foreground">
                  {companyName}
                </p>
                <div className="flex items-center gap-4 mt-2 text-caption text-muted-foreground">
                  <span>Analyzed on {analysisDate}</span>
                  <span>•</span>
                  <span>Credits Used: {creditsUsed}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons - Clean Modern Style */}
            <div className="flex items-center gap-3">
              {!readOnly && (
                <button
                  onClick={onStartNew}
                  className="group flex items-center gap-2.5 px-5 py-2.5 text-muted-foreground hover:text-foreground bg-surface border border-border hover:border-border-hover rounded-lg transition-all duration-200 font-normal hover:bg-surface-hover"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  <span className="text-sm">Analyze Another CV</span>
                </button>
              )}
              <button 
                onClick={downloadPDF}
                className="group flex items-center gap-2.5 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all duration-200 font-normal shadow-sm hover:shadow-md border border-primary/20"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm">Download Report</span>
              </button>
            </div>
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
