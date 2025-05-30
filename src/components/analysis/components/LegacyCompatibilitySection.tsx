
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface LegacyCompatibilitySectionProps {
  result: any;
}

const LegacyCompatibilitySection: React.FC<LegacyCompatibilitySectionProps> = ({ result }) => {
  if (!result.compatibilityBreakdown) return null;

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-4">
        <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium mr-3">
          Compatibility Breakdown
        </div>
      </div>
      <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">
        Your compatibility score is calculated based on several weighted factors:
      </p>
      
      {result.compatibilityBreakdown.map((category: any, index: number) => (
        <div key={index}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-blueberry dark:text-citrus text-sm">{category.category}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-blue-600">{category.score}/10</span>
              <span className="text-xs text-blueberry/60 dark:text-apple-core/60">Weight: {category.weight}%</span>
            </div>
          </div>
          <Progress value={category.score * 10} className="mb-2" />
          <p className="text-xs text-blueberry/70 dark:text-apple-core/80">{category.feedback}</p>
        </div>
      ))}

      {/* Overall Score Summary */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
            Overall Score: {((result.compatibility_score || result.compatibilityScore) / 10).toFixed(1)}/10
          </span>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Your strongest areas are in program management and stakeholder engagement.
        </p>
      </div>
    </div>
  );
};

export default LegacyCompatibilitySection;
