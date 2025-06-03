
import React from 'react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';

interface AnalysisResult {
  id: string;
  job_title: string;
  company_name: string;
  compatibility_score: number;
  created_at: string;
  executive_summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface AnalysisDetailModalProps {
  analysis: AnalysisResult | null;
  onClose: () => void;
}

const AnalysisDetailModal: React.FC<AnalysisDetailModalProps> = ({ analysis, onClose }) => {
  if (!analysis) return null;

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
    if (analysis.job_title) {
      doc.text(`Job Title: ${analysis.job_title}`, margin, currentY);
      currentY += lineHeight;
    }
    if (analysis.company_name && analysis.company_name !== 'Company') {
      doc.text(`Company: ${analysis.company_name}`, margin, currentY);
      currentY += lineHeight;
    }
    doc.text(`Analysis Date: ${new Date(analysis.created_at).toLocaleDateString()}`, margin, currentY);
    currentY += 15;

    // Compatibility Score
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPATIBILITY SCORE', margin, currentY);
    currentY += 10;

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(`${analysis.compatibility_score}%`, margin, currentY);
    currentY += 15;

    // Executive Summary
    if (analysis.executive_summary) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('EXECUTIVE SUMMARY', margin, currentY);
      currentY += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      currentY = addWrappedText(analysis.executive_summary, margin, currentY, pageWidth - 2 * margin);
      currentY += 10;
    }

    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = margin;
    }

    // Strengths
    if (analysis.strengths && analysis.strengths.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('STRENGTHS', margin, currentY);
      currentY += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      analysis.strengths.forEach((strength: string, index: number) => {
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
    if (analysis.weaknesses && analysis.weaknesses.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AREAS FOR IMPROVEMENT', margin, currentY);
      currentY += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      analysis.weaknesses.forEach((weakness: string, index: number) => {
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
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RECOMMENDATIONS', margin, currentY);
      currentY += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      analysis.recommendations.forEach((rec: string, index: number) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = margin;
        }
        currentY = addWrappedText(`${index + 1}. ${rec}`, margin, currentY, pageWidth - 2 * margin);
        currentY += 5;
      });
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
    const fileName = `CV_Analysis_Report_${analysis.job_title || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Analysis Details</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadPDF}
              className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {analysis.job_title || 'Untitled Position'}
            </h3>
            <p className="text-gray-600">{analysis.company_name || 'Company not specified'}</p>
            <p className="text-sm text-gray-500">
              Analyzed on {new Date(analysis.created_at).toLocaleDateString()}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Compatibility Score</h4>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${analysis.compatibility_score}%` }}
                ></div>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {analysis.compatibility_score}%
              </span>
            </div>
          </div>

          {analysis.executive_summary && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Executive Summary</h4>
              <p className="text-gray-700">{analysis.executive_summary}</p>
            </div>
          )}

          {analysis.strengths && analysis.strengths.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {analysis.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.weaknesses && analysis.weaknesses.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Areas for Improvement</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {analysis.weaknesses.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetailModal;
