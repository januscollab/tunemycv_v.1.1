
import React from 'react';
import { CheckCircle, Download, ArrowLeft } from 'lucide-react';
import ExecutiveSummarySection from './ExecutiveSummarySection';
import CompatibilityBreakdownSection from './CompatibilityBreakdownSection';
import EnhancedKeywordAnalysis from './EnhancedKeywordAnalysis';
import SkillsGapAnalysis from './SkillsGapAnalysis';
import ATSOptimizationSection from './ATSOptimizationSection';
import InterviewPrepSection from './InterviewPrepSection';
import AnalysisHeader from './components/AnalysisHeader';
import AnalysisScoreCard from './components/AnalysisScoreCard';
import LegacySummarySection from './components/LegacySummarySection';
import LegacyCompatibilitySection from './components/LegacyCompatibilitySection';
import LegacyKeywordSection from './components/LegacyKeywordSection';
import PriorityRecommendationsSection from './components/PriorityRecommendationsSection';
import PersonalizedMatchMessage from './components/PersonalizedMatchMessage';
import NextStepsSection from './components/NextStepsSection';
import PDFGenerator from './utils/PDFGenerator';

interface AnalysisResultsProps {
  result: any;
  onStartNew: () => void;
  readOnly?: boolean;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onStartNew, readOnly = false }) => {
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-citrus">
                {companyName} - {position}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-apple-core/70">
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
            className="flex items-center space-x-2 text-apricot hover:text-apricot/80 transition-colors"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>

        {/* Success Alert */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-green-800">Analysis Complete!</h2>
          </div>
          <p className="text-green-700">
            {hasEnhancedData 
              ? `We've completed an enhanced AI-powered analysis of your CV for the ${position} position at ${companyName} with detailed insights and actionable recommendations.`
              : `We've analyzed your CV against the ${position} job description and prepared a detailed compatibility report with personalized recommendations.`
            }
          </p>
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

          {/* Right Column - Enhanced or Legacy Summary */}
          <div className="lg:col-span-2">
            {hasEnhancedData && result.executiveSummary ? (
              <ExecutiveSummarySection executiveSummary={result.executiveSummary} />
            ) : (
              <LegacySummarySection result={result} />
            )}
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

        {/* Transaction ID Note */}
        <div className="mt-12 mb-8 bg-gray-50 dark:bg-blueberry/10 border border-gray-200 dark:border-citrus/20 rounded-lg p-4">
          <p className="text-sm text-blueberry/70 dark:text-apple-core/80 text-center">
            <strong>Note:</strong> While our AI models are well-trained, occasional errors may occur. 
            If you believe there's an error in your report, please contact us at{' '}
            <a href="mailto:hello@tunemycv.com" className="text-apricot hover:text-apricot/80 underline">
              hello@tunemycv.com
            </a>{' '}
            and quote transaction ID: <span className="font-mono text-blueberry dark:text-citrus">{transactionId}</span> for investigation.
          </p>
        </div>

        {/* Next Steps Section - only show if not in read-only mode */}
        {!readOnly && (
          <div className="mt-12">
            <NextStepsSection onStartNew={onStartNew} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
