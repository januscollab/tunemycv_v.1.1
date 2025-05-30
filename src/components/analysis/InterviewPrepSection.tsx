
import React from 'react';
import { Users, HelpCircle, TrendingUp, AlertTriangle } from 'lucide-react';

interface InterviewPrepProps {
  interviewPrep: {
    likelyQuestions: Array<{
      question: string;
      rationale: string;
      preparationTips: string;
    }>;
    strengthsToEmphasize: Array<{
      strength: string;
      relevance: string;
      talkingPoints: string[];
    }>;
    weaknessesToAddress: Array<{
      weakness: string;
      strategy: string;
      talkingPoints: string[];
    }>;
  };
}

const InterviewPrepSection: React.FC<InterviewPrepProps> = ({ interviewPrep }) => {
  if (!interviewPrep) return null;

  const { likelyQuestions = [], strengthsToEmphasize = [], weaknessesToAddress = [] } = interviewPrep;

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-6">
        <Users className="h-5 w-5 text-apricot mr-2" />
        <h2 className="text-lg font-semibold text-blueberry dark:text-citrus">Interview Preparation</h2>
      </div>

      <div className="space-y-6">
        {/* Likely Questions */}
        {likelyQuestions.length > 0 && (
          <div>
            <h3 className="font-semibold text-blue-600 mb-4 flex items-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              Likely Interview Questions ({likelyQuestions.length})
            </h3>
            <div className="space-y-4">
              {likelyQuestions.map((item, index) => (
                <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="font-medium text-blueberry dark:text-citrus mb-2">"{item.question}"</h4>
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-1">Why this might be asked:</h5>
                    <p className="text-xs text-blue-700 dark:text-blue-500">{item.rationale}</p>
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/50 rounded p-3">
                    <h5 className="text-xs font-medium text-green-800 dark:text-green-400 mb-1">Preparation Tips:</h5>
                    <p className="text-xs text-green-700 dark:text-green-500">{item.preparationTips}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths to Emphasize */}
        {strengthsToEmphasize.length > 0 && (
          <div>
            <h3 className="font-semibold text-green-600 mb-4 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Strengths to Emphasize ({strengthsToEmphasize.length})
            </h3>
            <div className="space-y-4">
              {strengthsToEmphasize.map((item, index) => (
                <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                  <h4 className="font-medium text-blueberry dark:text-citrus mb-2">{item.strength}</h4>
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-green-800 dark:text-green-400 mb-1">Relevance:</h5>
                    <p className="text-xs text-green-700 dark:text-green-500">{item.relevance}</p>
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/50 rounded p-3">
                    <h5 className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-2">Key Talking Points:</h5>
                    <ul className="space-y-1">
                      {item.talkingPoints.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start text-xs text-blue-700 dark:text-blue-500">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses to Address */}
        {weaknessesToAddress.length > 0 && (
          <div>
            <h3 className="font-semibold text-orange-600 mb-4 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Areas to Address ({weaknessesToAddress.length})
            </h3>
            <div className="space-y-4">
              {weaknessesToAddress.map((item, index) => (
                <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
                  <h4 className="font-medium text-blueberry dark:text-citrus mb-2">{item.weakness}</h4>
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-orange-800 dark:text-orange-400 mb-1">Strategy:</h5>
                    <p className="text-xs text-orange-700 dark:text-orange-500">{item.strategy}</p>
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/50 rounded p-3">
                    <h5 className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-2">Key Talking Points:</h5>
                    <ul className="space-y-1">
                      {item.talkingPoints.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start text-xs text-blue-700 dark:text-blue-500">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {likelyQuestions.length === 0 && strengthsToEmphasize.length === 0 && weaknessesToAddress.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-blueberry/60 dark:text-apple-core/60">
              Interview preparation insights will be available with enhanced analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrepSection;
