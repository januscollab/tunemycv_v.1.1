
import React from 'react';
import { ArrowLeft, Download, BarChart3, CheckCircle, XCircle, TrendingUp, Star, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onStartNew}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Analyze Another CV</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>
        </div>

        {/* Main Score Card */}
        <div className={`bg-white rounded-lg shadow-lg p-8 mb-8 border-2 ${getScoreBgColor(result.compatibility_score)}`}>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className={`h-8 w-8 ${getScoreColor(result.compatibility_score)} mr-2`} />
              <h1 className="text-2xl font-bold text-gray-900">CV Compatibility Analysis</h1>
            </div>
            {result.job_title && (
              <p className="text-lg text-gray-600 mb-2">For: {result.job_title}</p>
            )}
            {result.company_name && (
              <p className="text-md text-gray-500 mb-6">At: {result.company_name}</p>
            )}
            
            <div className="flex items-center justify-center mb-6">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(result.compatibility_score)} mb-2`}>
                  {result.compatibility_score}%
                </div>
                <div className="text-gray-600">Compatibility Score</div>
              </div>
            </div>
            
            <Progress value={result.compatibility_score} className="w-full max-w-md mx-auto mb-4" />
            
            <div className="text-gray-600">
              {result.compatibility_score >= 70 && "Excellent match! Your CV aligns well with this position."}
              {result.compatibility_score >= 40 && result.compatibility_score < 70 && "Good potential! Some improvements could strengthen your application."}
              {result.compatibility_score < 40 && "Room for improvement. Consider tailoring your CV more specifically."}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Executive Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Star className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Executive Summary</h2>
            </div>
            <p className="text-gray-700">{result.executive_summary}</p>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Keywords Found:</span>
                <span className="font-semibold text-green-600">{result.keywords_found?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Keywords Missing:</span>
                <span className="font-semibold text-red-600">{result.keywords_missing?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Analysis Date:</span>
                <span className="font-semibold">{new Date(result.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Strengths</h2>
            </div>
            {result.strengths && result.strengths.length > 0 ? (
              <ul className="space-y-2">
                {result.strengths.map((strength: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No specific strengths identified.</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Areas for Improvement</h2>
            </div>
            {result.weaknesses && result.weaknesses.length > 0 ? (
              <ul className="space-y-2">
                {result.weaknesses.map((weakness: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{weakness}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No specific areas for improvement identified.</p>
            )}
          </div>
        </div>

        {/* Keyword Analysis */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Keyword Analysis</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-600 mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Found Keywords (First 5)
              </h3>
              {result.keywords_found && result.keywords_found.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.keywords_found.slice(0, 5).map((keyword: string, index: number) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No keywords found.</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-red-600 mb-3 flex items-center">
                <XCircle className="h-4 w-4 mr-1" />
                Missing Keywords (First 5)
              </h3>
              {result.keywords_missing && result.keywords_missing.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.keywords_missing.slice(0, 5).map((keyword: string, index: number) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No missing keywords identified.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Recommendations</h2>
          </div>
          {result.recommendations && result.recommendations.length > 0 ? (
            <ul className="space-y-3">
              {result.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No specific recommendations available.</p>
          )}
        </div>

        {/* Premium Features Teaser */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6 mt-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Want More Detailed Analysis?</h3>
            <p className="text-gray-600 mb-4">
              Upgrade to Premium for comprehensive keyword analysis, detailed recommendations, and advanced compatibility insights.
            </p>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-md hover:from-purple-700 hover:to-blue-700 transition-colors">
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
