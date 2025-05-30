import React from 'react';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import ExecutiveSummarySection from './ExecutiveSummarySection';
import CompatibilityBreakdownSection from './CompatibilityBreakdownSection';
import EnhancedKeywordAnalysis from './EnhancedKeywordAnalysis';
import SkillsGapAnalysis from './SkillsGapAnalysis';
import ATSOptimizationSection from './ATSOptimizationSection';
import InterviewPrepSection from './InterviewPrepSection';

interface AnalysisResultsProps {
  result: any;
  onStartNew: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onStartNew }) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchLevel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 70) return 'Good Match';
    if (score >= 50) return 'Moderate to Good Match';
    return 'Needs Improvement';
  };

  // Check if we have enhanced data structure
  const hasEnhancedData = result.executiveSummary || result.compatibilityBreakdown || result.keywordAnalysis;

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const lineHeight = 7;
    let currentY = margin;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 12) => {
      doc.setFontSize(fontSize);
      const words = text.split(' ');
      let line = '';
      let currentLineY = y;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const testWidth = doc.getStringUnitWidth(testLine) * fontSize / doc.internal.scaleFactor;
        
        if (testWidth > maxWidth && i > 0) {
          doc.text(line.trim(), x, currentLineY);
          line = words[i] + ' ';
          currentLineY += lineHeight;
        } else {
          line = testLine;
        }
      }
      
      if (line.trim()) {
        doc.text(line.trim(), x, currentLineY);
        currentLineY += lineHeight;
      }
      
      return currentLineY;
    };

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('CV COMPATIBILITY ANALYSIS REPORT', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Job details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Position Details', margin, currentY);
    currentY += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    if (result.job_title || result.position) {
      doc.text(`Job Title: ${result.job_title || result.position}`, margin, currentY);
      currentY += lineHeight;
    }
    if (result.company_name && result.company_name !== 'Company') {
      doc.text(`Company: ${result.company_name}`, margin, currentY);
      currentY += lineHeight;
    }
    doc.text(`Analysis Date: ${new Date(result.created_at).toLocaleDateString()}`, margin, currentY);
    currentY += 15;

    // Compatibility Score
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPATIBILITY SCORE', margin, currentY);
    currentY += 10;

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(`${result.compatibility_score || result.compatibilityScore}%`, margin, currentY);
    currentY += 15;

    // Executive Summary
    const summaryText = result.executive_summary || result.executiveSummary?.overview;
    if (summaryText) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('EXECUTIVE SUMMARY', margin, currentY);
      currentY += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      currentY = addWrappedText(summaryText, margin, currentY, pageWidth - 2 * margin);
      currentY += 10;
    }

    // Keywords section
    if ((result.keywords_found && result.keywords_found.length > 0) || 
        (result.keywords_missing && result.keywords_missing.length > 0)) {
      
      if (currentY > 200) {
        doc.addPage();
        currentY = margin;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('KEYWORD ANALYSIS', margin, currentY);
      currentY += 10;

      if (result.keywords_found && result.keywords_found.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Keywords Found:', margin, currentY);
        currentY += 7;

        doc.setFont('helvetica', 'normal');
        const foundKeywords = result.keywords_found.join(', ');
        currentY = addWrappedText(foundKeywords, margin, currentY, pageWidth - 2 * margin);
        currentY += 10;
      }

      if (result.keywords_missing && result.keywords_missing.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Missing Keywords:', margin, currentY);
        currentY += 7;

        doc.setFont('helvetica', 'normal');
        const missingKeywords = result.keywords_missing.join(', ');
        currentY = addWrappedText(missingKeywords, margin, currentY, pageWidth - 2 * margin);
        currentY += 10;
      }
    }

    // Strengths
    if (result.strengths && result.strengths.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('STRENGTHS', margin, currentY);
      currentY += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      result.strengths.forEach((strength: string, index: number) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = margin;
        }
        currentY = addWrappedText(`${index + 1}. ${strength}`, margin, currentY, pageWidth - 2 * margin);
        currentY += 5;
      });
      currentY += 10;
    }

    // Areas for Improvement
    if (result.weaknesses && result.weaknesses.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AREAS FOR IMPROVEMENT', margin, currentY);
      currentY += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      result.weaknesses.forEach((weakness: string, index: number) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = margin;
        }
        currentY = addWrappedText(`${index + 1}. ${weakness}`, margin, currentY, pageWidth - 2 * margin);
        currentY += 5;
      });
      currentY += 10;
    }

    // Recommendations
    if (result.recommendations && result.recommendations.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RECOMMENDATIONS', margin, currentY);
      currentY += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      result.recommendations.forEach((rec: string, index: number) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = margin;
        }
        currentY = addWrappedText(`${index + 1}. ${rec}`, margin, currentY, pageWidth - 2 * margin);
        currentY += 5;
      });
      currentY += 10;
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Generated by TuneMyCV.com', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    // Save the PDF
    const fileName = `CV_Analysis_Report_${result.job_title || result.position || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-core/20 via-white to-citrus/10 dark:from-blueberry/10 dark:via-gray-900 dark:to-citrus/5">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onStartNew}
            className="flex items-center space-x-2 text-apricot hover:text-apricot/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Analyze Another CV</span>
          </button>
          <button 
            onClick={downloadPDF}
            className="flex items-center space-x-2 bg-apricot text-white px-4 py-2 rounded-md hover:bg-apricot/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </button>
        </div>

        {/* Page Title */}
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
            <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20 text-center">
              {/* Large Score Circle */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-3xl font-bold">{((result.compatibility_score || result.compatibilityScore) / 10).toFixed(1)}</div>
                    <div className="text-sm">/10</div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-2">Compatibility Score</h3>
              <p className="text-blueberry/70 dark:text-apple-core/80 mb-4">{getMatchLevel(result.compatibility_score || result.compatibilityScore)}</p>
              
              {(result.job_title || result.position) && (
                <p className="text-sm text-blueberry/60 dark:text-apple-core/60">
                  for the {result.job_title || result.position} position
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Enhanced or Legacy Summary */}
          <div className="lg:col-span-2">
            {hasEnhancedData && result.executiveSummary ? (
              <ExecutiveSummarySection executiveSummary={result.executiveSummary} />
            ) : (
              // Legacy summary format
              <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
                <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mb-4">Executive Summary</h2>
                <p className="text-blueberry/80 dark:text-apple-core leading-relaxed mb-6">
                  {result.executive_summary}
                </p>

                {/* Legacy strengths and weaknesses */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-green-600 mb-3">Key Strengths</h3>
                    {result.strengths && result.strengths.length > 0 ? (
                      <ul className="space-y-2">
                        {result.strengths.slice(0, 4).map((strength: string, index: number) => (
                          <li key={index} className="flex items-start text-sm">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                            <span className="text-blueberry/80 dark:text-apple-core">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-blueberry/60 dark:text-apple-core/60 text-sm">No specific strengths identified.</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-red-600 mb-3">Key Improvement Areas</h3>
                    {result.weaknesses && result.weaknesses.length > 0 ? (
                      <ul className="space-y-2">
                        {result.weaknesses.slice(0, 4).map((weakness: string, index: number) => (
                          <li key={index} className="flex items-start text-sm">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                            <span className="text-blueberry/80 dark:text-apple-core">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-blueberry/60 dark:text-apple-core/60 text-sm">No specific areas for improvement identified.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Analysis Sections */}
        {hasEnhancedData ? (
          <div className="space-y-8">
            {/* Compatibility Breakdown */}
            {result.compatibilityBreakdown && (
              <CompatibilityBreakdownSection compatibilityBreakdown={result.compatibilityBreakdown} />
            )}

            {/* Enhanced Keyword Analysis */}
            {result.keywordAnalysis && (
              <EnhancedKeywordAnalysis keywordAnalysis={result.keywordAnalysis} />
            )}

            {/* Skills Gap Analysis */}
            {result.skillsGapAnalysis && (
              <SkillsGapAnalysis skillsGapAnalysis={result.skillsGapAnalysis} />
            )}

            {/* ATS Optimization */}
            {result.atsOptimization && (
              <ATSOptimizationSection atsOptimization={result.atsOptimization} />
            )}

            {/* Interview Preparation */}
            {result.interviewPrep && (
              <InterviewPrepSection interviewPrep={result.interviewPrep} />
            )}

            {/* Priority Recommendations */}
            {result.priorityRecommendations && result.priorityRecommendations.length > 0 && (
              <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium mr-3">
                    Priority Recommendations
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {result.priorityRecommendations.map((rec: any, index: number) => (
                    <div key={index} className="border border-apple-core/10 dark:border-citrus/10 rounded-lg p-4">
                      <div className="flex items-start mb-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-blueberry dark:text-citrus mb-2">{rec.title}</h3>
                          <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-3">{rec.description}</p>
                          {rec.sampleText && (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded p-3">
                              <h4 className="text-xs font-medium text-green-800 dark:text-green-300 mb-1">Sample Text:</h4>
                              <p className="text-xs text-green-700 dark:text-green-400 italic">"{rec.sampleText}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Legacy format sections for backward compatibility
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Compatibility Breakdown */}
          {result.compatibilityBreakdown && (
            <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium mr-3">
                  Compatibility Breakdown
                </div>
              </div>
              <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">
                Your compatibility score is calculated based on several weighted factors:
              </p>
              
              {result.compatibilityBreakdown.map((category: any, index: number) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blueberry dark:text-citrus text-sm">{category.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-blue-600">{category.score}/10</span>
                      <span className="text-xs text-blueberry/60 dark:text-apple-core/60">Weight: {category.weight}%</span>
                    </div>
                  </div>
                  <Progress value={category.score * 10} className="mb-2" />
                  <p className="text-xs text-blueberry/70 dark:text-apple-core/80">{category.feedback}</p>
                </div>
              ))}

              {/* Overall Score Summary */}
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  {/* <Info className="h-4 w-4 text-blue-600 mr-2" /> */}
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Overall Score: {(result.compatibility_score / 10).toFixed(1)}/10
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Your strongest areas are in program management and stakeholder engagement.
                </p>
              </div>
            </div>
          )}

          {/* Keyword Analysis */}
          <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium mr-3">
                Keyword Analysis
              </div>
            </div>
            <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">
              We analyzed your CV for key terms from the job description. Here's what we found:
            </p>

            {result.keywordAnalysis && result.keywordAnalysis.length > 0 ? (
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-blueberry/60 dark:text-apple-core/60 border-b pb-2">
                  <span>Keyword</span>
                  <span>Importance</span>
                  <span>Present in CV</span>
                  <span></span>
                </div>
                {result.keywordAnalysis.map((keyword: any, index: number) => (
                  <div key={index} className="grid grid-cols-4 gap-2 text-sm items-center">
                    <span className="font-medium text-blueberry dark:text-apple-core">{keyword.keyword}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      keyword.importance === 'High' ? 'bg-red-100 text-red-800' :
                      keyword.importance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {keyword.importance}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      keyword.present === 'Yes' ? 'bg-green-100 text-green-800' :
                      keyword.present === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {keyword.present}
                    </span>
                    <span></span>
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback to simple keyword lists */
              <div className="space-y-4">
                {result.keywords_found && result.keywords_found.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Found Keywords ({result.keywords_found.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords_found.map((keyword: string, index: number) => (
                        <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {result.keywords_missing && result.keywords_missing.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center">
                      {/* <XCircle className="h-4 w-4 mr-1" /> */}
                      Missing Keywords ({result.keywords_missing.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords_missing.map((keyword: string, index: number) => (
                        <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Missing Key Terms Alert */}
            {result.keywords_missing && result.keywords_missing.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <div className="flex items-center mb-1">
                  {/* <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" /> */}
                  <span className="text-sm font-medium text-yellow-800">Missing Key Terms</span>
                </div>
                <p className="text-xs text-yellow-700">
                  Your CV is missing several high-importance keywords that could improve your ATS compatibility.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
