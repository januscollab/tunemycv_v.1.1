
import React from 'react';

interface PriorityRecommendationsSectionProps {
  recommendations: any[];
}

const PriorityRecommendationsSection: React.FC<PriorityRecommendationsSectionProps> = ({ recommendations }) => {
  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-6">
        <h2 className="text-xl font-semibold text-blueberry dark:text-citrus">
          Priority Recommendations
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {recommendations.map((rec: any, index: number) => (
          <div key={index} className="border border-apple-core/10 dark:border-citrus/10 rounded-lg p-4">
            <div className="flex items-start mb-3">
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
  );
};

export default PriorityRecommendationsSection;
