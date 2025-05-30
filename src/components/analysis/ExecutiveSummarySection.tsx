
import React from 'react';
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface ExecutiveSummaryProps {
  executiveSummary: {
    overview: string;
    strengths?: Array<{
      title: string;
      description: string;
      relevance: number;
    }>;
    weaknesses?: Array<{
      title: string;
      description: string;
      impact: number;
      recommendation: string;
    }>;
  };
}

const ExecutiveSummarySection: React.FC<ExecutiveSummaryProps> = ({ executiveSummary }) => {
  if (!executiveSummary) return null;

  const { overview, strengths = [], weaknesses = [] } = executiveSummary;

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <h2 className="text-2xl font-semibold text-blueberry dark:text-citrus mb-4">Executive Summary</h2>
      
      {overview && (
        <p className="text-blueberry/80 dark:text-apple-core leading-relaxed mb-6">
          {overview}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div>
          <h3 className="font-semibold text-green-600 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Key Strengths ({strengths.length})
          </h3>
          {strengths.length > 0 ? (
            <div className="space-y-3">
              {strengths.map((strength, index) => (
                <div key={index} className="border border-green-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blueberry dark:text-citrus text-sm">{strength.title}</h4>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      {strength.relevance}% relevance
                    </span>
                  </div>
                  <p className="text-sm text-blueberry/70 dark:text-apple-core/80">{strength.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-blueberry/60 dark:text-apple-core/60 text-sm">No specific strengths identified.</p>
          )}
        </div>

        {/* Weaknesses */}
        <div>
          <h3 className="font-semibold text-red-600 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Areas for Improvement ({weaknesses.length})
          </h3>
          {weaknesses.length > 0 ? (
            <div className="space-y-3">
              {weaknesses.map((weakness, index) => (
                <div key={index} className="border border-red-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blueberry dark:text-citrus text-sm">{weakness.title}</h4>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                      {weakness.impact}% impact
                    </span>
                  </div>
                  <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-2">{weakness.description}</p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                    <div className="flex items-start">
                      <TrendingUp className="h-3 w-3 text-blue-600 mr-1 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700 dark:text-blue-400">{weakness.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-blueberry/60 dark:text-apple-core/60 text-sm">No specific areas for improvement identified.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummarySection;
