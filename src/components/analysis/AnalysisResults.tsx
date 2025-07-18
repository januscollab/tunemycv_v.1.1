import React, { useState } from 'react';
import { CheckCircle, Download, ArrowLeft, Bug, X, Send } from 'lucide-react';

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
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FloatingLabelTextarea } from '@/components/common/FloatingLabelTextarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ComingSoonPDF } from '@/components/ui/coming-soon-pdf';
import { EnhancedPDFViewer } from '@/components/ui/enhanced-pdf-viewer';

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
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please describe the issue you encountered',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-feedback-email', {
        body: {
          name: userName,
          email: '',
          subject: 'Analysis Error Report',
          message: `I encountered an error in my CV analysis report.\n\nTransaction ID: ${transactionId}\nUser: ${userName}\n\nError details:\n${description.trim()}`,
          category: 'bug',
          currentPage: 'analysis',
          allowContact: false
        }
      });

      if (error) throw error;

      toast({
        title: 'Report sent',
        description: 'Thank you for reporting this issue. Our team will investigate it.'
      });

      onClose();
      setDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit error report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-base">
            <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <Bug className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            Report Analysis Error
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium">Transaction ID:</span> {transactionId}
            </p>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              What went wrong with your analysis?
            </Label>
            <FloatingLabelTextarea
              id="description"
              label="Describe the issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the error or issue you encountered..."
              className="mt-2 min-h-[100px]"
              required
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              This will help our team investigate and fix the issue.
            </p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={submitting || !description.trim()}
              className="flex-1"
            >
              {submitting ? (
                'Sending...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Report
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
  
  // IMPROVED: Check if PDF data is available with comprehensive debugging
  const hasPdfData = () => {
    console.log('=== PDF DATA AVAILABILITY CHECK ===');
    console.log('Result object keys:', Object.keys(result));
    console.log('result.pdf_file_data:', !!result.pdf_file_data, result.pdf_file_data ? result.pdf_file_data.length : 'null');
    console.log('result.html_file_data:', !!result.html_file_data, result.html_file_data ? result.html_file_data.length : 'null');
    console.log('result.n8n_pdf_url:', result.n8n_pdf_url);
    console.log('result.n8n_html_url:', result.n8n_html_url);
    console.log('result.analysis_type:', result.analysis_type);
    
    const hasData = result.pdf_file_data || result.html_file_data || result.n8n_pdf_url || result.n8n_html_url;
    console.log('Has PDF data overall:', hasData);
    console.log('=== PDF DATA AVAILABILITY CHECK END ===');
    
    return hasData;
  };
  
  // Check if this is an n8n analysis result
  if (result.analysis_type === 'n8n') {
    // Extract transaction ID and analysis date
    const transactionId = result.id || result.analysis_id || 'N/A';
    const analysisDate = result.created_at ? new Date(result.created_at).toLocaleDateString() : new Date().toLocaleDateString();
    const creditsUsed = result.credits_used || 1;
    
    // Check if we have valid job information
    const validJobInfo = hasValidJobInfo(result.job_title, result.company_name);

    console.log('=== N8N ANALYSIS RESULT RENDERING ===');
    console.log('About to render EnhancedPDFViewer with:');
    console.log('- pdfData (pdf_file_data):', !!result.pdf_file_data, result.pdf_file_data ? result.pdf_file_data.length : 'null');
    console.log('- pdfUrl (n8n_pdf_url):', result.n8n_pdf_url);
    console.log('- fileName calculation base:', result.job_title, result.company_name);
    
    const fileName = `CV_Analysis_${result.job_title || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('- Final fileName:', fileName);
    console.log('=== N8N ANALYSIS RESULT RENDERING END ===');

    return (
      <div className="min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Start New Button */}
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

          {/* PDF Viewer or Coming Soon - FIXED PROPERTY MAPPING */}
          <div className="mb-8">
            {hasPdfData() ? (
              <EnhancedPDFViewer
                pdfData={result.pdf_file_data}
                pdfUrl={result.n8n_pdf_url}
                fileName={fileName}
                onDownload={() => {
                  console.log('PDF download triggered from AnalysisResults');
                  // Use existing download logic - this will be called by the PDF viewer
                  downloadAnalysisAsText();
                }}
              />
            ) : (
              <ComingSoonPDF />
            )}
          </div>

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
                className="ml-4 flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-md transition-colors border border-red-200 dark:border-red-800"
                title="Report an error in this analysis"
              >
                <Bug className="h-3 w-3" />
                <span>Report Error</span>
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

  const downloadAnalysisAsText = () => {
    console.log('=== DOWNLOAD ANALYSIS AS TEXT START ===');
    const analysisDate = result.created_at ? new Date(result.created_at).toLocaleDateString() : new Date().toLocaleDateString();
    
    let content = `CV COMPATIBILITY ANALYSIS REPORT\n\n`;
    
    // Position Details
    content += `POSITION DETAILS\n`;
    if (result.job_title) content += `Job Title: ${result.job_title}\n`;
    if (result.company_name && result.company_name !== 'Company') content += `Company: ${result.company_name}\n`;
    content += `Analysis Date: ${analysisDate}\n\n`;
    
    // Compatibility Score
    content += `COMPATIBILITY SCORE\n${result.compatibility_score || 0}%\n\n`;
    
    // Executive Summary
    if (result.executive_summary) {
      content += `EXECUTIVE SUMMARY\n${result.executive_summary}\n\n`;
    }
    
    // Strengths
    if (result.strengths && result.strengths.length > 0) {
      content += `STRENGTHS\n`;
      result.strengths.forEach((strength, index) => {
        content += `${index + 1}. ${strength}\n`;
      });
      content += `\n`;
    }
    
    // Areas for Improvement
    if (result.weaknesses && result.weaknesses.length > 0) {
      content += `AREAS FOR IMPROVEMENT\n`;
      result.weaknesses.forEach((weakness, index) => {
        content += `${index + 1}. ${weakness}\n`;
      });
      content += `\n`;
    }
    
    // Recommendations
    if (result.recommendations && result.recommendations.length > 0) {
      content += `RECOMMENDATIONS\n`;
      result.recommendations.forEach((rec, index) => {
        content += `${index + 1}. ${rec}\n`;
      });
    }
    
    content += `\n\nGenerated by TuneMyCV.com`;
    
    const fileName = `CV_Analysis_Report_${result.job_title || 'Report'}_${new Date().toISOString().split('T')[0]}.txt`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('Download completed:', fileName);
    console.log('=== DOWNLOAD ANALYSIS AS TEXT END ===');
  };

  const downloadPDF = () => {
    downloadAnalysisAsText();
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
              className="ml-4 flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-md transition-colors border border-red-200 dark:border-red-800"
              title="Report an error in this analysis"
            >
              <Bug className="h-3 w-3" />
              <span>Report Error</span>
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
