
import React from 'react';

interface AnalysisScoreCardProps {
  score: number;
  jobTitle?: string;
  companyName?: string;
  getMatchLevel: (score: number) => string;
}

const AnalysisScoreCard: React.FC<AnalysisScoreCardProps> = ({ 
  score, 
  jobTitle, 
  companyName, 
  getMatchLevel 
}) => {
  // Convert score to percentage if it's out of 100, otherwise assume it's already a percentage
  const percentageScore = score > 1 ? score : Math.round(score * 100);
  
  const getScoreColors = (score: number) => {
    if (score >= 70) {
      return {
        bg: 'bg-green-500',
        text: 'text-green-600',
        lightBg: 'bg-green-50 dark:bg-green-900/20'
      };
    }
    if (score >= 50) {
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-600',
        lightBg: 'bg-amber-50 dark:bg-amber-900/20'
      };
    }
    return {
      bg: 'bg-red-400',
      text: 'text-red-600',
      lightBg: 'bg-red-50 dark:bg-red-900/20'
    };
  };

  const colors = getScoreColors(percentageScore);

  return (
    <div className={`${colors.lightBg} rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20 text-center`}>
      {/* Large Score Circle */}
      <div className="flex items-center justify-center mb-4">
        <div className={`relative w-32 h-32 ${colors.bg} rounded-full flex items-center justify-center shadow-lg`}>
          <div className="text-white text-center">
            <div className="text-3xl font-bold">{percentageScore}%</div>
            <div className="text-sm">Match</div>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-2">Compatibility Score</h3>
      <p className={`font-medium mb-4 ${colors.text}`}>
        {getMatchLevel(percentageScore)}
      </p>
      
      {jobTitle && (
        <div className="text-sm text-blueberry/60 dark:text-apple-core/60">
          <p>for the <span className="font-medium">{jobTitle}</span> position</p>
          {companyName && companyName !== 'the Company' && (
            <p>at <span className="font-medium">{companyName}</span></p>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisScoreCard;
