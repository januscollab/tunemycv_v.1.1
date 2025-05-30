
import React from 'react';
import { ArrowLeft, Download, BarChart3, CheckCircle, XCircle, TrendingUp, Star, AlertCircle, Target, BookOpen, Users, Award, Lightbulb } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import jsPDF from 'jspdf';

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

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-50 border-green-200';
    if (score >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getMatchLevel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 70) return 'Good Match';
    if (score >= 50) return 'Moderate Match';
    return 'Needs Improvement';
  };

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
    if (result.job_title) {
      doc.text(`Job Title: ${result.job_title}`, margin, currentY);
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
    doc.text(`${result.compatibility_score}%`, margin, currentY);
    currentY += 15;

    // Executive Summary
    if (result.executive_summary) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('EXECUTIVE SUMMARY', margin, currentY);
      currentY += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      currentY = addWrappedText(result.executive_summary, margin, currentY, pageWidth - 2 * margin);
      currentY += 10;
    }

    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = margin;
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

    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = margin;
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

    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = margin;
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
    const fileName = `CV_Analysis_Report_${result.job_title || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
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

        {/* Main Score Card */}
        <div className={`bg-white dark:bg-blueberry/20 rounded-lg shadow-lg p-8 mb-8 border-2 ${getScoreBgColor(result.compatibility_score)}`}>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className={`h-8 w-8 ${getScoreColor(result.compatibility_score)} mr-2`} />
              <h1 className="text-3xl font-bold text-blueberry dark:text-citrus">Comprehensive CV Analysis</h1>
            </div>
            {result.job_title && (
              <p className="text-lg text-blueberry/80 dark:text-apple-core mb-2">Position: {result.job_title}</p>
            )}
            {result.company_name && result.company_name !== 'Company' && (
              <p className="text-md text-blueberry/70 dark:text-apple-core/80 mb-6">Company: {result.company_name}</p>
            )}
            
            <div className="grid md:grid-cols-2 gap-8 items-center mb-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(result.compatibility_score)} mb-2`}>
                  {result.compatibility_score}%
                </div>
                <div className="text-blueberry/70 dark:text-apple-core/80">Compatibility Score</div>
                <div className={`text-lg font-semibold mt-2 ${getScoreColor(result.compatibility_score)}`}>
                  {getMatchLevel(result.compatibility_score)}
                </div>
              </div>
              <div className="space-y-3">
                <Progress value={result.compatibility_score} className="w-full h-3" />
                <div className="text-sm text-blueberry/70 dark:text-apple-core/80 text-center">
                  Analysis completed on {new Date(result.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 mb-8 border border-apple-core/20 dark:border-citrus/20">
          <div className="flex items-center mb-4">
            <Star className="h-6 w-6 text-apricot mr-3" />
            <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus">Executive Summary</h2>
          </div>
          <p className="text-lg text-blueberry/80 dark:text-apple-core leading-relaxed">{result.executive_summary}</p>
        </div>

        {/* Compatibility Breakdown */}
        {result.compatibilityBreakdown && result.compatibilityBreakdown.length > 0 && (
          <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 mb-8 border border-apple-core/20 dark:border-citrus/20">
            <div className="flex items-center mb-6">
              <Target className="h-6 w-6 text-apricot mr-3" />
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus">Compatibility Breakdown</h2>
            </div>
            <div className="grid gap-4">
              {result.compatibilityBreakdown.map((category: any, index: number) => (
                <div key={index} className="border border-apple-core/10 dark:border-citrus/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blueberry dark:text-citrus">{category.category}</h3>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-blueberry/60 dark:text-apple-core/60">Weight: {category.weight}%</span>
                      <span className={`font-bold ${category.score >= 7 ? 'text-green-600' : category.score >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {category.score}/10
                      </span>
                    </div>
                  </div>
                  <Progress value={category.score * 10} className="mb-3" />
                  <p className="text-sm text-blueberry/70 dark:text-apple-core/80">{category.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Priority Recommendations */}
        {result.priorityRecommendations && result.priorityRecommendations.length > 0 && (
          <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 mb-8 border border-apple-core/20 dark:border-citrus/20">
            <div className="flex items-center mb-6">
              <Lightbulb className="h-6 w-6 text-apricot mr-3" />
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus">Priority Recommendations</h2>
            </div>
            <div className="space-y-6">
              {result.priorityRecommendations.map((rec: any, index: number) => (
                <div key={index} className="border border-apple-core/10 dark:border-citrus/10 rounded-lg p-5">
                  <div className="flex items-start mb-3">
                    <div className="w-8 h-8 bg-apricot/20 text-apricot rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                      {rec.priority}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blueberry dark:text-citrus mb-2">{rec.title}</h3>
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-blueberry/80 dark:text-apple-core mb-2">Action Items:</h4>
                        <ul className="space-y-1">
                          {rec.actionItems.map((item: string, itemIndex: number) => (
                            <li key={itemIndex} className="flex items-start text-sm text-blueberry/70 dark:text-apple-core/80">
                              <div className="w-1.5 h-1.5 bg-apricot rounded-full mt-2 mr-2 flex-shrink-0"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {rec.example && (
                        <div className="bg-apple-core/5 dark:bg-citrus/5 rounded p-3">
                          <h4 className="text-sm font-medium text-blueberry/80 dark:text-apple-core mb-1">Example:</h4>
                          <p className="text-sm text-blueberry/70 dark:text-apple-core/80 italic">{rec.example}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keyword Analysis */}
        {result.keywordAnalysis && result.keywordAnalysis.length > 0 && (
          <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 mb-8 border border-apple-core/20 dark:border-citrus/20">
            <div className="flex items-center mb-6">
              <BarChart3 className="h-6 w-6 text-apricot mr-3" />
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus">Keyword Analysis</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-apple-core/20 dark:border-citrus/20">
                    <th className="text-left p-3 font-semibold text-blueberry dark:text-citrus">Keyword</th>
                    <th className="text-left p-3 font-semibold text-blueberry dark:text-citrus">Importance</th>
                    <th className="text-left p-3 font-semibold text-blueberry dark:text-citrus">Present</th>
                    <th className="text-left p-3 font-semibold text-blueberry dark:text-citrus">Context</th>
                  </tr>
                </thead>
                <tbody>
                  {result.keywordAnalysis.map((keyword: any, index: number) => (
                    <tr key={index} className="border-b border-apple-core/10 dark:border-citrus/10">
                      <td className="p-3 font-medium text-blueberry dark:text-apple-core">{keyword.keyword}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          keyword.importance === 'High' ? 'bg-red-100 text-red-800' :
                          keyword.importance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {keyword.importance}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          keyword.present === 'Yes' ? 'bg-green-100 text-green-800' :
                          keyword.present === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {keyword.present}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-blueberry/70 dark:text-apple-core/80">{keyword.context}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Skills Gap Analysis */}
        {result.skillsGapAnalysis && result.skillsGapAnalysis.length > 0 && (
          <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 mb-8 border border-apple-core/20 dark:border-citrus/20">
            <div className="flex items-center mb-6">
              <BookOpen className="h-6 w-6 text-apricot mr-3" />
              <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus">Skills Gap Analysis</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {result.skillsGapAnalysis.map((gap: any, index: number) => (
                <div key={index} className="border border-apple-core/10 dark:border-citrus/10 rounded-lg p-4">
                  <h3 className="font-semibold text-blueberry dark:text-citrus mb-3">{gap.category}</h3>
                  {gap.missing && gap.missing.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-red-600 mb-2">Missing Skills:</h4>
                      <div className="flex flex-wrap gap-1">
                        {gap.missing.map((skill: string, skillIndex: number) => (
                          <span key={skillIndex} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {gap.suggestions && gap.suggestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-600 mb-2">Suggestions:</h4>
                      <ul className="space-y-1">
                        {gap.suggestions.map((suggestion: string, suggestionIndex: number) => (
                          <li key={suggestionIndex} className="text-sm text-blueberry/70 dark:text-apple-core/80 flex items-start">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Sections Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* ATS Optimization */}
          {result.atsOptimization && result.atsOptimization.length > 0 && (
            <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
              <div className="flex items-center mb-4">
                <Award className="h-5 w-5 text-apricot mr-2" />
                <h2 className="text-xl font-semibold text-blueberry dark:text-citrus">ATS Optimization</h2>
              </div>
              <ul className="space-y-2">
                {result.atsOptimization.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start text-sm text-blueberry/80 dark:text-apple-core">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interview Preparation */}
          {result.interviewPrep && result.interviewPrep.length > 0 && (
            <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 text-apricot mr-2" />
                <h2 className="text-xl font-semibold text-blueberry dark:text-citrus">Interview Preparation</h2>
              </div>
              <ul className="space-y-2">
                {result.interviewPrep.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start text-sm text-blueberry/80 dark:text-apple-core">
                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Traditional Strengths and Weaknesses Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-blueberry dark:text-citrus">Key Strengths</h2>
            </div>
            {result.strengths && result.strengths.length > 0 ? (
              <ul className="space-y-2">
                {result.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-blueberry/80 dark:text-apple-core">{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-blueberry/60 dark:text-apple-core/60">No specific strengths identified.</p>
            )}
          </div>

          <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <h2 className="text-xl font-semibold text-blueberry dark:text-citrus">Areas for Improvement</h2>
            </div>
            {result.weaknesses && result.weaknesses.length > 0 ? (
              <ul className="space-y-2">
                {result.weaknesses.map((weakness: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-blueberry/80 dark:text-apple-core">{weakness}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-blueberry/60 dark:text-apple-core/60">No specific areas for improvement identified.</p>
            )}
          </div>
        </div>

        {/* Quick Keywords Summary */}
        <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 mb-8 border border-apple-core/20 dark:border-citrus/20">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-apricot mr-2" />
            <h2 className="text-xl font-semibold text-blueberry dark:text-citrus">Keywords Summary</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-600 mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Found Keywords ({result.keywords_found?.length || 0})
              </h3>
              {result.keywords_found && result.keywords_found.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.keywords_found.slice(0, 10).map((keyword: string, index: number) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                  {result.keywords_found.length > 10 && (
                    <span className="text-sm text-blueberry/60 dark:text-apple-core/60">
                      +{result.keywords_found.length - 10} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-blueberry/60 dark:text-apple-core/60">No keywords found.</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-red-600 mb-3 flex items-center">
                <XCircle className="h-4 w-4 mr-1" />
                Missing Keywords ({result.keywords_missing?.length || 0})
              </h3>
              {result.keywords_missing && result.keywords_missing.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.keywords_missing.slice(0, 10).map((keyword: string, index: number) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                  {result.keywords_missing.length > 10 && (
                    <span className="text-sm text-blueberry/60 dark:text-apple-core/60">
                      +{result.keywords_missing.length - 10} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-blueberry/60 dark:text-apple-core/60">No missing keywords identified.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
