
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ScoreCardProps {
  score: number;
  jobTitle?: string;
  companyName?: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score, jobTitle, companyName }) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-50 border-green-200';
    if (score >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className={`bg-white dark:bg-blueberry/20 rounded-lg shadow-lg p-8 mb-8 border-2 ${getScoreBgColor(score)}`}>
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <BarChart3 className={`h-8 w-8 ${getScoreColor(score)} mr-2`} />
          <h1 className="text-2xl font-bold text-blueberry dark:text-citrus">CV Compatibility Analysis</h1>
        </div>
        {jobTitle && (
          <p className="text-lg text-blueberry/80 dark:text-apple-core mb-2">For: {jobTitle}</p>
        )}
        {companyName && companyName !== 'Company' && (
          <p className="text-md text-blueberry/70 dark:text-apple-core/80 mb-6">At: {companyName}</p>
        )}
        
        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
              {score}%
            </div>
            <div className="text-blueberry/70 dark:text-apple-core/80">Compatibility Score</div>
          </div>
        </div>
        
        <Progress value={score} className="w-full max-w-md mx-auto mb-4" />
        
        <div className="text-blueberry/70 dark:text-apple-core/80">
          {score >= 70 && "Excellent match! Your CV aligns well with this position."}
          {score >= 40 && score < 70 && "Good potential! Some improvements could strengthen your application."}
          {score < 40 && "Room for improvement. Consider tailoring your CV more specifically."}
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
