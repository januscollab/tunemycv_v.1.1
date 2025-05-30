
import React from 'react';

interface AnalysisScoreCardProps {
  score: number;
  jobTitle?: string;
  getMatchLevel: (score: number) => string;
}

const AnalysisScoreCard: React.FC<AnalysisScoreCardProps> = ({ score, jobTitle, getMatchLevel }) => {
  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20 text-center">
      {/* Large Score Circle */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-3xl font-bold">{(score / 10).toFixed(1)}</div>
            <div className="text-sm">/10</div>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-2">Compatibility Score</h3>
      <p className="text-blueberry/70 dark:text-apple-core/80 mb-4">{getMatchLevel(score)}</p>
      
      {jobTitle && (
        <p className="text-sm text-blueberry/60 dark:text-apple-core/60">
          for the {jobTitle} position
        </p>
      )}
    </div>
  );
};

export default AnalysisScoreCard;
