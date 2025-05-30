
import React from 'react';
import { Award, AlertCircle, CheckCircle, FileText, Settings } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ATSOptimizationProps {
  atsOptimization: {
    overallScore: number;
    formatIssues: Array<{
      issue: string;
      impact: string;
      fix: string;
    }>;
    contentIssues: Array<{
      issue: string;
      impact: string;
      fix: string;
    }>;
    keywordDensity: {
      analysis: string;
      recommendation: string;
    };
    sectionRecommendations: {
      missing: string[];
      improvements: string[];
    };
  };
}

const ATSOptimizationSection: React.FC<ATSOptimizationProps> = ({ atsOptimization }) => {
  if (!atsOptimization) return null;

  const {
    overallScore,
    formatIssues = [],
    contentIssues = [],
    keywordDensity,
    sectionRecommendations
  } = atsOptimization;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-6">
        <Award className="h-5 w-5 text-apricot mr-2" />
        <h2 className="text-lg font-semibold text-blueberry dark:text-citrus">ATS Optimization</h2>
      </div>

      {/* Overall ATS Score */}
      <div className={`rounded-lg p-4 mb-6 border ${getScoreBgColor(overallScore)}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-blueberry dark:text-citrus">ATS Compatibility Score</h3>
          <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}/100
          </span>
        </div>
        <Progress value={overallScore} className="mb-2" />
        <p className="text-sm text-blueberry/70 dark:text-apple-core/80">
          {overallScore >= 80 
            ? 'Excellent ATS compatibility. Your CV should pass most automated screening systems.'
            : overallScore >= 60
            ? 'Good ATS compatibility with room for improvement.'
            : 'Poor ATS compatibility. Consider making the recommended changes to improve your chances.'
          }
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Format Issues */}
        <div>
          <h3 className="font-semibold text-red-600 mb-3 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Format Issues ({formatIssues.length})
          </h3>
          {formatIssues.length > 0 ? (
            <div className="space-y-3">
              {formatIssues.map((issue, index) => (
                <div key={index} className="border border-red-100 rounded-lg p-3">
                  <h4 className="font-medium text-blueberry dark:text-citrus text-sm mb-1">{issue.issue}</h4>
                  <p className="text-xs text-red-600 mb-2">{issue.impact}</p>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                    <p className="text-xs text-green-700 dark:text-green-400">
                      <strong>Fix:</strong> {issue.fix}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">No format issues detected</span>
            </div>
          )}
        </div>

        {/* Content Issues */}
        <div>
          <h3 className="font-semibold text-orange-600 mb-3 flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Content Issues ({contentIssues.length})
          </h3>
          {contentIssues.length > 0 ? (
            <div className="space-y-3">
              {contentIssues.map((issue, index) => (
                <div key={index} className="border border-orange-100 rounded-lg p-3">
                  <h4 className="font-medium text-blueberry dark:text-citrus text-sm mb-1">{issue.issue}</h4>
                  <p className="text-xs text-orange-600 mb-2">{issue.impact}</p>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                    <p className="text-xs text-green-700 dark:text-green-400">
                      <strong>Fix:</strong> {issue.fix}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">No content issues detected</span>
            </div>
          )}
        </div>
      </div>

      {/* Keyword Density */}
      {keywordDensity && (
        <div className="mb-6">
          <h3 className="font-semibold text-blue-600 mb-3">Keyword Density Analysis</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blueberry/80 dark:text-apple-core mb-2">{keywordDensity.analysis}</p>
            <div className="bg-white/70 dark:bg-gray-800/50 rounded p-3">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                <strong>Recommendation:</strong> {keywordDensity.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section Recommendations */}
      {sectionRecommendations && (
        <div>
          <h3 className="font-semibold text-purple-600 mb-3">Section Recommendations</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {sectionRecommendations.missing && sectionRecommendations.missing.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-2">Missing Sections</h4>
                <ul className="space-y-1">
                  {sectionRecommendations.missing.map((section, index) => (
                    <li key={index} className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded">
                      {section}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {sectionRecommendations.improvements && sectionRecommendations.improvements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-blue-600 mb-2">Section Improvements</h4>
                <ul className="space-y-1">
                  {sectionRecommendations.improvements.map((improvement, index) => (
                    <li key={index} className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded">
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSOptimizationSection;
