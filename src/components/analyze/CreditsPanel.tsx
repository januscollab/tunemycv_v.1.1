
import React from 'react';
import { CreditCard, Zap, FileText, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CreditsPanelProps {
  credits: number;
  hasCreditsForAI: boolean;
}

const CreditsPanel: React.FC<CreditsPanelProps> = ({
  credits,
  hasCreditsForAI
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Credits</h3>
      
      {/* Credits Display */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <span className="text-blue-900 font-bold text-lg">
            Credits: {credits || 0}
          </span>
        </div>
      </div>
      
      {/* Analysis Information */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3 p-3 border rounded-lg bg-gray-50">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-gray-900">
                Comprehensive Analysis
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {hasCreditsForAI 
                ? "Get detailed AI-powered CV analysis, benchmarked against our trained models to evaluate your fit for the role."
                : "Enhanced algorithmic analysis with comprehensive feedback (Free)"
              }
            </p>
            <div className="text-base font-bold text-blue-600 mt-2 bg-blue-100 px-3 py-2 rounded-md inline-block border-2 border-blue-200">
              💳 Cost: {hasCreditsForAI ? "1 Credit" : "Free"}
            </div>
          </div>
        </div>
      </div>
      
      {/* Cover Letter CTA */}
      <div className="mt-4">
        <Link to="/cover-letter">
          <button className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-gray-900">Cover Letter</span>
          </button>
        </Link>
        <p className="text-xs text-gray-500 mt-1 text-center">
          Create a tailored cover letter that aligns your experience with the role — crafted from your CV and the job description for maximum impact.
        </p>
        <div className="text-base font-bold text-blue-600 text-center mt-2 bg-blue-100 px-3 py-2 rounded-md inline-block border-2 border-blue-200">
          💳 Cost: 1 Credit
        </div>
      </div>

      {/* Interview Prep CTA */}
      <div className="mt-3">
        <button
          className="w-full flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed"
          disabled
        >
          <MessageSquare className="h-4 w-4 text-green-600" />
          <span className="font-medium text-gray-900">Interview Prep</span>
        </button>
        <p className="text-xs text-gray-500 mt-1 text-center">
          Prepare with confidence — our bespoke analysis of the company, latest news, and interview focus areas so you walk into your interview informed and confident.
        </p>
        <div className="text-xs font-medium text-blue-600 text-center mt-1">
          Coming Soon
        </div>
      </div>
      
      {!hasCreditsForAI && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-700">
            No credits available for AI-powered analysis. Using comprehensive algorithmic analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default CreditsPanel;
