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

  // Simple text download function to replace PDF functionality
  const downloadAnalysisAsText = () => {
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

          {/* PDF Placeholder */}
          <div className="border border-apple-core/20 dark:border-citrus/20 rounded-lg p-8 text-center mb-8 bg-surface">
            <div className="text-muted-foreground">
              <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">Analysis Report Available</h3>
              <p className="text-sm mb-4">Your CV analysis has been completed successfully.</p>
              <button 
                onClick={downloadAnalysisAsText}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Report as Text
              </button>
              {result.n8n_pdf_url && (
                <div className="mt-4">
                  <button 
                    onClick={() => window.open(result.n8n_pdf_url, '_blank', 'noopener,noreferrer')} 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View External PDF
                  </button>
                </div>
              )}
            </div>
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
