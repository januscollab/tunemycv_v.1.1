
import React from 'react';

interface PersonalizedMatchMessageProps {
  score: number;
  jobTitle: string;
  companyName: string;
  getMatchLevel: (score: number) => string;
}

const PersonalizedMatchMessage: React.FC<PersonalizedMatchMessageProps> = ({
  score,
  jobTitle,
  companyName,
  getMatchLevel
}) => {
  // Convert score to percentage if needed
  const percentageScore = score > 1 ? score : Math.round(score * 100);
  const matchLevel = getMatchLevel(percentageScore);
  
  const getMessageColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatCompanyName = (name: string) => {
    return name === 'the Company' ? 'this company' : name;
  };

  return (
    <div className="text-center py-6">
      <h2 className="text-title font-bold text-blueberry dark:text-citrus mb-2">
        You are a{' '}
        <span className={getMessageColor(percentageScore)}>
          {matchLevel}
        </span>
        {' '}for the role of
      </h2>
      <p className="text-heading font-semibold text-blueberry/90 dark:text-apple-core">
        <span className="text-apricot">{jobTitle}</span> at{' '}
        <span className="text-apricot">{formatCompanyName(companyName)}</span>
      </p>
    </div>
  );
};

export default PersonalizedMatchMessage;
