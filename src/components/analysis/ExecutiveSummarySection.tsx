
import React from 'react';
import { FileText, TrendingUp, AlertTriangle } from 'lucide-react';

interface ExecutiveSummarySectionProps {
  executiveSummary: {
    overview: string;
    strengths: Array<{
      title: string;
      description: string;
      relevance: number;
    }>;
    weaknesses: Array<{
      title: string;
      description: string;
      impact: number;
      recommendation: string;
    }>;
  };
}

const ExecutiveSummarySection: React.FC<ExecutiveSummarySectionProps> = ({ executiveSummary }) => {
  if (!executiveSummary) return null;

  const { overview, strengths = [], weaknesses = [] } = executiveSummary;

  return (
    <div className="bg-card rounded-lg shadow p-6 border border-border">
      <div className="flex items-center mb-6">
        <FileText className="h-5 w-5 text-primary mr-2" />
        <h2 className="text-heading font-semibold text-foreground">Executive Summary</h2>
      </div>

      {/* Overview */}
      {overview && (
        <div className="mb-6">
          <p className="text-caption text-muted-foreground leading-relaxed">{overview}</p>
        </div>
      )}

      {/* Strengths and Weaknesses Side by Side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div>
            <h3 className="font-semibold text-success mb-4 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Key Strengths ({strengths.length})
            </h3>
            <div className="space-y-3">
              {strengths.map((strength, index) => (
                <div key={index} className="border border-success rounded-lg p-4 bg-success-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{strength.title}</h4>
                     <span className="text-micro px-2 py-1 rounded bg-background/50 text-success">
                       {strength.relevance}% relevance
                     </span>
                  </div>
                  <p className="text-caption text-muted-foreground">{strength.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div>
            <h3 className="font-semibold text-destructive mb-4 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Areas for Improvement ({weaknesses.length})
            </h3>
            <div className="space-y-3">
              {weaknesses.map((weakness, index) => (
                <div key={index} className="border border-destructive rounded-lg p-4 bg-destructive-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{weakness.title}</h4>
                     <span className="text-micro px-2 py-1 rounded bg-background/50 text-destructive">
                       {weakness.impact}% impact
                     </span>
                  </div>
                  <p className="text-caption text-muted-foreground mb-3">{weakness.description}</p>
                  <div className="bg-background/70 rounded p-3">
                     <h5 className="text-micro font-medium text-info mb-1">Recommendation:</h5>
                     <p className="text-micro text-info">{weakness.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {strengths.length === 0 && weaknesses.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No detailed analysis available. Please try again with a more comprehensive job description.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExecutiveSummarySection;
