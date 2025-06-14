import React from 'react';
import { Search, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

interface ATSOptimizationSectionProps {
  priorityRecommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
    sampleText: string;
  }>;
}

const ATSOptimizationSection: React.FC<ATSOptimizationSectionProps> = ({ priorityRecommendations }) => {
  if (!priorityRecommendations || priorityRecommendations.length === 0) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive-50 text-destructive border-destructive';
      case 'medium': return 'bg-warning-50 text-warning border-warning';
      case 'low': return 'bg-info-50 text-info border-info';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <CheckCircle className="h-4 w-4" />;
      case 'low': return <Lightbulb className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  // Sort by priority
  const sortedRecommendations = [...priorityRecommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
  });

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-6">
        <Search className="h-5 w-5 text-apricot mr-2" />
        <h2 className="text-subheading font-semibold text-blueberry dark:text-citrus">ATS Optimization</h2>
      </div>

      <div className="space-y-4">
        {sortedRecommendations.map((recommendation, index) => (
          <div key={index} className={`border rounded-lg p-4 ${getPriorityColor(recommendation.priority)}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-blueberry dark:text-citrus flex items-center">
                {getPriorityIcon(recommendation.priority)}
                <span className="ml-2">{recommendation.title}</span>
              </h3>
              <span className="text-micro px-2 py-1 rounded bg-white/50">
                {recommendation.priority} priority
              </span>
            </div>
            
            <p className="text-caption text-blueberry/80 dark:text-apple-core mb-3">{recommendation.description}</p>
            
            <div className="mb-3">
              <h4 className="text-micro font-medium text-info mb-1">Expected Impact:</h4>
              <p className="text-micro text-info">{recommendation.impact}</p>
            </div>
            
            <div className="bg-surface rounded p-3">
              <h4 className="text-micro font-medium text-success mb-1">Sample Text:</h4>
              <p className="text-micro text-success italic">"{recommendation.sampleText}"</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-apple-core/20 dark:border-citrus/20">
        <div className="bg-info-50 rounded-lg p-4">
          <h3 className="font-medium text-info mb-2">ATS Optimization Tips</h3>
          <ul className="text-micro text-info space-y-1">
            <li>• Use exact keywords from the job description</li>
            <li>• Include both acronyms and full terms (e.g., "AI" and "Artificial Intelligence")</li>
            <li>• Place important keywords in prominent sections like summary and experience</li>
            <li>• Use standard section headings like "Experience" and "Education"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ATSOptimizationSection;