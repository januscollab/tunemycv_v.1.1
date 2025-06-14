
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
      case 'high': return 'bg-destructive-50 text-destructive border-destructive';
      case 'medium': return 'bg-warning-50 text-warning border-warning';
      case 'low': return 'bg-info-50 text-info border-info';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow p-6 border border-border">
      <div className="flex items-center mb-6">
        <Target className="h-5 w-5 text-primary mr-2" />
        <h2 className="text-heading font-semibold text-foreground">Skills Gap Analysis</h2>
      </div>

      {/* Critical Gaps and Development Areas Side by Side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Critical Gaps */}
        <div>
          {criticalGaps.length > 0 ? (
            <>
              <h3 className="font-semibold text-destructive mb-4 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Critical Skills Gaps ({criticalGaps.length})
              </h3>
              <div className="space-y-3">
                {criticalGaps.map((gap, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${getImportanceColor(gap.importance)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{gap.skill}</h4>
                      <span className="text-micro px-2 py-1 rounded bg-background/50">
                        {gap.importance} priority
                      </span>
                    </div>
                    <p className="text-caption text-muted-foreground mb-3">{gap.description}</p>
                    <div className="bg-background/70 rounded p-3">
                      <div className="flex items-start">
                        <TrendingUp className="h-4 w-4 text-info mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-micro font-medium text-info mb-1">Bridging Strategy:</h5>
                          <p className="text-micro text-info">{gap.bridgingStrategy}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-semibold text-destructive mb-2">Critical Skills Gaps</h3>
              <p className="text-caption text-muted-foreground">
                No critical skills gaps identified.
              </p>
            </div>
          )}
        </div>

        {/* Development Areas */}
        <div>
          {developmentAreas.length > 0 ? (
            <>
              <h3 className="font-semibold text-info mb-4 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Development Areas ({developmentAreas.length})
              </h3>
              <div className="space-y-3">
                {developmentAreas.map((area, index) => (
                  <div key={index} className="border border-info rounded-lg p-4 bg-info-50">
                    <h4 className="font-medium text-foreground mb-2">{area.area}</h4>
                    <p className="text-caption text-muted-foreground mb-2">{area.description}</p>
                    
                    <div className="mb-3">
                      <h5 className="text-micro font-medium text-info mb-1">Relevance:</h5>
                      <p className="text-micro text-info">{area.relevance}</p>
                    </div>
                    
                    <div className="bg-background/70 rounded p-3">
                      <h5 className="text-micro font-medium text-success mb-1">Action Plan:</h5>
                      <p className="text-micro text-success">{area.actionPlan}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-semibold text-info mb-2">Development Areas</h3>
              <p className="text-caption text-muted-foreground">
                No specific development areas identified.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {criticalGaps.length === 0 && developmentAreas.length === 0 && (
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No significant skills gaps identified. Your profile shows strong alignment with the role requirements.
          </p>
        </div>
      )}
    </div>
  );
};

export default SkillsGapAnalysis;
