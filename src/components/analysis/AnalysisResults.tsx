
import React from 'react';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
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

  const downloadPDF = () => {
    const pdfGenerator = new PDFGenerator();
    pdfGenerator.generatePDF(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <AnalysisHeader onStartNew={onStartNew} onDownloadPDF={downloadPDF} />

        <h1 className="text-3xl font-bold text-blueberry dark:text-citrus mb-8">CV Analysis Results</h1>

        {/* Success Alert */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-green-800">Analysis Complete!</h2>
          </div>
          <p className="text-green-700">
            {hasEnhancedData 
              ? "We've completed an enhanced AI-powered analysis of your CV with detailed insights and actionable recommendations."
              : "We've analyzed your CV against the job description and prepared a detailed compatibility report with personalized recommendations."
            }
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Score Display */}
          <div className="lg:col-span-1">
            <AnalysisScoreCard 
              score={result.compatibility_score || result.compatibilityScore}
              jobTitle={result.job_title || result.position}
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

        {/* Enhanced Analysis Sections */}
        {hasEnhancedData ? (
          <div className="space-y-8">
            {result.compatibilityBreakdown && (
              <CompatibilityBreakdownSection compatibilityBreakdown={result.compatibilityBreakdown} />
            )}

            {result.keywordAnalysis && (
              <EnhancedKeywordAnalysis keywordAnalysis={result.keywordAnalysis} />
            )}

            {result.skillsGapAnalysis && (
              <SkillsGapAnalysis skillsGapAnalysis={result.skillsGapAnalysis} />
            )}

            {result.atsOptimization && (
              <ATSOptimizationSection atsOptimization={result.atsOptimization} />
            )}

            {result.interviewPrep && (
              <InterviewPrepSection interviewPrep={result.interviewPrep} />
            )}

            {result.priorityRecommendations && result.priorityRecommendations.length > 0 && (
              <PriorityRecommendationsSection recommendations={result.priorityRecommendations} />
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <LegacyCompatibilitySection result={result} />
            <LegacyKeywordSection result={result} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
