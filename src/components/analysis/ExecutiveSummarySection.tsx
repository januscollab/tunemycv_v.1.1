
import React from 'react';
import { FileText, TrendingUp, AlertTriangle } from 'lucide-react';

interface ExecutiveSummarySectionProps {
  executiveSummary: {
    overview: string;
    strengths: Array<{
      title: string;
      description: string;
      relevance: number;
    }>;
    weaknesses: Array<{
      title: string;
      description: string;
      impact: number;
      recommendation: string;
    }>;
  };
}

const ExecutiveSummarySection: React.FC<ExecutiveSummarySectionProps> = ({ executiveSummary }) => {
  if (!executiveSummary) return null;

  const { overview, strengths = [], weaknesses = [] } = executiveSummary;

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-6">
        <FileText className="h-5 w-5 text-apricot mr-2" />
        <h2 className="text-lg font-semibold text-blueberry dark:text-citrus">Executive Summary</h2>
      </div>

      {/* Overview */}
      {overview && (
        <div className="mb-6">
          <p className="text-blueberry/80 dark:text-apple-core leading-relaxed">{overview}</p>
        </div>
      )}

      {/* Strengths and Weaknesses Side by Side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div>
            <h3 className="font-semibold text-green-600 mb-4 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Key Strengths ({strengths.length})
            </h3>
            <div className="space-y-3">
              {strengths.map((strength, index) => (
                <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blueberry dark:text-citrus">{strength.title}</h4>
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                      {strength.relevance}% relevance
                    </span>
                  </div>
                  <p className="text-sm text-blueberry/80 dark:text-apple-core">{strength.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div>
            <h3 className="font-semibold text-red-600 mb-4 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Areas for Improvement ({weaknesses.length})
            </h3>
            <div className="space-y-3">
              {weaknesses.map((weakness, index) => (
                <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blueberry dark:text-citrus">{weakness.title}</h4>
                    <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">
                      {weakness.impact}% impact
                    </span>
                  </div>
                  <p className="text-sm text-blueberry/80 dark:text-apple-core mb-3">{weakness.description}</p>
                  <div className="bg-white/70 dark:bg-gray-800/50 rounded p-3">
                    <h5 className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-1">Recommendation:</h5>
                    <p className="text-xs text-blue-700 dark:text-blue-500">{weakness.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {strengths.length === 0 && weaknesses.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-blueberry/60 dark:text-apple-core/60">
            No detailed analysis available. Please try again with a more comprehensive job description.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExecutiveSummarySection;
