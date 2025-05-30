
import React from 'react';
import { AlertTriangle, TrendingUp, Target, Lightbulb } from 'lucide-react';

interface SkillsGapAnalysisProps {
  skillsGapAnalysis: {
    criticalGaps: Array<{
      skill: string;
      importance: 'high' | 'medium' | 'low';
      description: string;
      bridgingStrategy: string;
    }>;
    developmentAreas: Array<{
      area: string;
      description: string;
      relevance: string;
      actionPlan: string;
    }>;
  };
}

const SkillsGapAnalysis: React.FC<SkillsGapAnalysisProps> = ({ skillsGapAnalysis }) => {
  if (!skillsGapAnalysis) return null;

  const { criticalGaps = [], developmentAreas = [] } = skillsGapAnalysis;

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-6">
        <Target className="h-5 w-5 text-apricot mr-2" />
        <h2 className="text-lg font-semibold text-blueberry dark:text-citrus">Skills Gap Analysis</h2>
      </div>

      <div className="space-y-6">
        {/* Critical Gaps */}
        {criticalGaps.length > 0 && (
          <div>
            <h3 className="font-semibold text-red-600 mb-4 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Critical Skills Gaps ({criticalGaps.length})
            </h3>
            <div className="space-y-3">
              {criticalGaps.map((gap, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getImportanceColor(gap.importance)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blueberry dark:text-citrus">{gap.skill}</h4>
                    <span className="text-xs px-2 py-1 rounded bg-white/50">
                      {gap.importance} priority
                    </span>
                  </div>
                  <p className="text-sm text-blueberry/80 dark:text-apple-core mb-3">{gap.description}</p>
                  <div className="bg-white/70 dark:bg-gray-800/50 rounded p-3">
                    <div className="flex items-start">
                      <TrendingUp className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-1">Bridging Strategy:</h5>
                        <p className="text-xs text-blue-700 dark:text-blue-500">{gap.bridgingStrategy}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Development Areas */}
        {developmentAreas.length > 0 && (
          <div>
            <h3 className="font-semibold text-blue-600 mb-4 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Development Areas ({developmentAreas.length})
            </h3>
            <div className="space-y-3">
              {developmentAreas.map((area, index) => (
                <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                  <h4 className="font-medium text-blueberry dark:text-citrus mb-2">{area.area}</h4>
                  <p className="text-sm text-blueberry/80 dark:text-apple-core mb-2">{area.description}</p>
                  
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-1">Relevance:</h5>
                    <p className="text-xs text-blue-700 dark:text-blue-500">{area.relevance}</p>
                  </div>
                  
                  <div className="bg-white/70 dark:bg-gray-800/50 rounded p-3">
                    <h5 className="text-xs font-medium text-green-800 dark:text-green-400 mb-1">Action Plan:</h5>
                    <p className="text-xs text-green-700 dark:text-green-500">{area.actionPlan}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {criticalGaps.length === 0 && developmentAreas.length === 0 && (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-blueberry/60 dark:text-apple-core/60">
              No significant skills gaps identified. Your profile shows strong alignment with the role requirements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsGapAnalysis;
