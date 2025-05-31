
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
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
        <h2 className="text-lg font-semibold text-blueberry dark:text-citrus">ATS Optimization</h2>
      </div>

      <div className="space-y-4">
        {sortedRecommendations.map((recommendation, index) => (
          <div key={index} className={`border rounded-lg p-4 ${getPriorityColor(recommendation.priority)}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-blueberry dark:text-citrus flex items-center">
                {getPriorityIcon(recommendation.priority)}
                <span className="ml-2">{recommendation.title}</span>
              </h3>
              <span className="text-xs px-2 py-1 rounded bg-white/50">
                {recommendation.priority} priority
              </span>
            </div>
            
            <p className="text-sm text-blueberry/80 dark:text-apple-core mb-3">{recommendation.description}</p>
            
            <div className="mb-3">
              <h4 className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-1">Expected Impact:</h4>
              <p className="text-xs text-blue-700 dark:text-blue-500">{recommendation.impact}</p>
            </div>
            
            <div className="bg-white/70 dark:bg-gray-800/50 rounded p-3">
              <h4 className="text-xs font-medium text-green-800 dark:text-green-400 mb-1">Sample Text:</h4>
              <p className="text-xs text-green-700 dark:text-green-500 italic">"{recommendation.sampleText}"</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-apple-core/20 dark:border-citrus/20">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">ATS Optimization Tips</h3>
          <ul className="text-xs text-blue-700 dark:text-blue-500 space-y-1">
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
