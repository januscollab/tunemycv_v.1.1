
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
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-400';
  };

  const getTextColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20 text-center">
      {/* Large Score Circle */}
      <div className="flex items-center justify-center mb-4">
        <div className={`relative w-32 h-32 ${getScoreColor(percentageScore)} rounded-full flex items-center justify-center`}>
          <div className="text-white text-center">
            <div className="text-3xl font-bold">{percentageScore}%</div>
            <div className="text-sm">Match</div>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-2">Compatibility Score</h3>
      <p className={`font-medium mb-4 ${getTextColor(percentageScore)}`}>
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
