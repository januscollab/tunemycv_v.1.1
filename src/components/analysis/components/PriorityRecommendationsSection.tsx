
import React from 'react';
import { Target, CheckCircle } from 'lucide-react';

interface PriorityRecommendationsSectionProps {
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
    sampleText: string;
    specificAction?: string;
  }>;
}

const PriorityRecommendationsSection: React.FC<PriorityRecommendationsSectionProps> = ({ 
  recommendations 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-6">
        <Target className="h-6 w-6 text-apricot mr-3" />
        <h2 className="text-xl font-semibold text-blueberry dark:text-citrus">
          Priority Recommendations
        </h2>
      </div>
      
      <div className="space-y-6">
        {recommendations.map((rec, index) => (
          <div key={index} className="border border-apple-core/10 dark:border-citrus/10 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-blueberry dark:text-citrus flex-1">
                {rec.title}
              </h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                {rec.priority.toUpperCase()} PRIORITY
              </div>
            </div>
            
            <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">
              {rec.description}
            </p>

            {/* Expected Impact */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-blueberry dark:text-citrus mb-2">Expected Impact:</h4>
              <p className="text-sm text-blueberry/80 dark:text-apple-core/90 bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                {rec.impact}
              </p>
            </div>

            {/* Specific Action Steps */}
            {rec.specificAction && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-blueberry dark:text-citrus mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Action Steps:
                </h4>
                <p className="text-sm text-blueberry/80 dark:text-apple-core/90 bg-purple-50 dark:bg-purple-900/20 rounded p-3">
                  {rec.specificAction}
                </p>
              </div>
            )}

            {/* Sample Text */}
            {rec.sampleText && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="text-xs font-medium text-green-800 dark:text-green-300 mb-2">
                  Sample Implementation:
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400 italic font-medium">
                  "{rec.sampleText}"
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityRecommendationsSection;
