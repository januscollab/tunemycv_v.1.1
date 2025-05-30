
import React from 'react';

interface LegacySummarySectionProps {
  result: any;
}

const LegacySummarySection: React.FC<LegacySummarySectionProps> = ({ result }) => {
  return (
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
  );
};

export default LegacySummarySection;
