
import React from 'react';
import { CheckCircle } from 'lucide-react';
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
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onStartNew }) => {
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

  const downloadPDF = () => {
    const pdfGenerator = new PDFGenerator();
    pdfGenerator.generatePDF(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <AnalysisHeader onStartNew={onStartNew} onDownloadPDF={downloadPDF} />

        {/* Dynamic heading based on company and position */}
        <h1 className="text-3xl font-bold text-blueberry dark:text-citrus mb-2">
          {companyName} - {position}
        </h1>
        <p className="text-blueberry/70 dark:text-apple-core/80 mb-8">CV Analysis Results</p>

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

        {/* Next Steps Section */}
        <div className="mt-12">
          <NextStepsSection onStartNew={onStartNew} />
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
