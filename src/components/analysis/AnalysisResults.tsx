import React from 'react';
import { ArrowLeft, Download, BarChart3, CheckCircle, XCircle, TrendingUp, Star, AlertCircle, Target, BookOpen, Users } from 'lucide-react';
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
      <div className="max-w-4xl mx-auto px-4 py-8">
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
            <span>Download PDF Report</span>
          </button>
        </div>

        {/* Main Score Card */}
        <div className={`bg-white dark:bg-blueberry/20 rounded-lg shadow-lg p-8 mb-8 border-2 ${getScoreBgColor(result.compatibility_score)}`}>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className={`h-8 w-8 ${getScoreColor(result.compatibility_score)} mr-2`} />
              <h1 className="text-2xl font-bold text-blueberry dark:text-citrus">CV Compatibility Analysis</h1>
            </div>
            {result.job_title && (
              <p className="text-lg text-blueberry/80 dark:text-apple-core mb-2">For: {result.job_title}</p>
            )}
            {result.company_name && result.company_name !== 'Company' && (
              <p className="text-md text-blueberry/70 dark:text-apple-core/80 mb-6">At: {result.company_name}</p>
            )}
            
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(result.compatibility_score)} mb-2`}>
                  {result.compatibility_score}%
                </div>
                <div className="text-blueberry/70 dark:text-apple-core/80">Compatibility Score</div>
              </div>
            </div>
            
            <Progress value={result.compatibility_score} className="w-full max-w-md mx-auto mb-4" />
            
            <div className="text-blueberry/70 dark:text-apple-core/80">
              {result.compatibility_score >= 70 && "Excellent match! Your CV aligns well with this position."}
              {result.compatibility_score >= 40 && result.compatibility_score < 70 && "Good potential! Some improvements could strengthen your application."}
              {result.compatibility_score < 40 && "Room for improvement. Consider tailoring your CV more specifically."}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Executive Summary */}
          <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
            <div className="flex items-center mb-4">
              <Star className="h-5 w-5 text-apricot mr-2" />
              <h2 className="text-xl font-semibold text-blueberry dark:text-citrus">Executive Summary</h2>
            </div>
            <p className="text-blueberry/80 dark:text-apple-core">{result.executive_summary}</p>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
            <h2 className="text-xl font-semibold text-blueberry dark:text-citrus mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blueberry/70 dark:text-apple-core/80">Keywords Found:</span>
                <span className="font-semibold text-green-600">{result.keywords_found?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blueberry/70 dark:text-apple-core/80">Keywords Missing:</span>
                <span className="font-semibold text-red-600">{result.keywords_missing?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blueberry/70 dark:text-apple-core/80">Analysis Date:</span>
                <span className="font-semibold text-blueberry dark:text-citrus">{new Date(result.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-blueberry dark:text-citrus">Strengths</h2>
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

        {/* Keyword Analysis */}
        <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 mb-8 border border-apple-core/20 dark:border-citrus/20">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-apricot mr-2" />
            <h2 className="text-xl font-semibold text-blueberry dark:text-citrus">Keyword Analysis</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-600 mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Found Keywords
              </h3>
              {result.keywords_found && result.keywords_found.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.keywords_found.slice(0, 10).map((keyword: string, index: number) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-blueberry/60 dark:text-apple-core/60">No keywords found.</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-red-600 mb-3 flex items-center">
                <XCircle className="h-4 w-4 mr-1" />
                Missing Keywords
              </h3>
              {result.keywords_missing && result.keywords_missing.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.keywords_missing.slice(0, 10).map((keyword: string, index: number) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-blueberry/60 dark:text-apple-core/60">No missing keywords identified.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 mb-8 border border-apple-core/20 dark:border-citrus/20">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-apricot mr-2" />
            <h2 className="text-xl font-semibold text-blueberry dark:text-citrus">Recommendations</h2>
          </div>
          {result.recommendations && result.recommendations.length > 0 ? (
            <ul className="space-y-3">
              {result.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-apricot/20 text-apricot rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-blueberry/80 dark:text-apple-core">{recommendation}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-blueberry/60 dark:text-apple-core/60">No specific recommendations available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
