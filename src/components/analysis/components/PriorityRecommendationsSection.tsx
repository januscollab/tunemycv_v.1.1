
import React from 'react';
import { Lightbulb } from 'lucide-react';

interface PriorityRecommendationsSectionProps {
  recommendations: any[];
}

const PriorityRecommendationsSection: React.FC<PriorityRecommendationsSectionProps> = ({ recommendations }) => {
  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-6">
        <Lightbulb className="h-5 w-5 text-apricot mr-2" />
        <h2 className="text-subheading font-semibold text-blueberry dark:text-citrus">Priority Recommendations</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {recommendations.map((rec: any, index: number) => (
          <div key={index} className="border border-apple-core/10 dark:border-citrus/10 rounded-lg p-4">
            <div className="flex items-start mb-3">
              <div className="w-6 h-6 bg-apricot text-white rounded-full flex items-center justify-center text-micro font-bold mr-3 mt-0.5 flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blueberry dark:text-citrus mb-2">{rec.title}</h3>
                <p className="text-caption text-blueberry/70 dark:text-apple-core/80 mb-3">{rec.description}</p>
                {rec.sampleText && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded p-3">
                    <h4 className="text-micro font-medium text-green-800 dark:text-green-300 mb-1">Sample Text:</h4>
                    <p className="text-micro text-green-700 dark:text-green-400 italic">"{rec.sampleText}"</p>
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
