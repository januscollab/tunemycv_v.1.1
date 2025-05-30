
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Lightbulb, Plus } from 'lucide-react';

interface CompatibilityBreakdownProps {
  compatibilityBreakdown: {
    technicalSkills?: {
      score: number;
      present: string[];
      missing: string[];
      analysis: string;
      suggestions?: string[];
    };
    experience?: {
      score: number;
      relevantExperience: string[];
      missingExperience: string[];
      analysis: string;
      suggestions?: string[];
    };
    education?: {
      score: number;
      relevantQualifications: string[];
      missingQualifications: string[];
      analysis: string;
      suggestions?: string[];
    };
    softSkills?: {
      score: number;
      present: string[];
      missing: string[];
      analysis: string;
      suggestions?: string[];
    };
    industryKnowledge?: {
      score: number;
      present: string[];
      missing: string[];
      analysis: string;
      suggestions?: string[];
    };
  };
}

const CompatibilityBreakdownSection: React.FC<CompatibilityBreakdownProps> = ({ compatibilityBreakdown }) => {
  if (!compatibilityBreakdown) return null;

  const categories = [
    { key: 'technicalSkills', label: 'Technical Skills', icon: '🔧' },
    { key: 'experience', label: 'Experience', icon: '💼' },
    { key: 'education', label: 'Education', icon: '🎓' },
    { key: 'softSkills', label: 'Soft Skills', icon: '🤝' },
    { key: 'industryKnowledge', label: 'Industry Knowledge', icon: '🏢' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPresentItems = (category: any) => {
    return category.present || category.relevantExperience || category.relevantQualifications || [];
  };

  const getMissingItems = (category: any) => {
    return category.missing || category.missingExperience || category.missingQualifications || [];
  };

  const getSuggestions = (category: any, missingItems: string[]) => {
    // If suggestions are provided in the data, use them
    if (category.suggestions && category.suggestions.length > 0) {
      return category.suggestions;
    }
    
    // Generate contextual suggestions based on missing items
    return missingItems.map(item => {
      if (item.toLowerCase().includes('certification') || item.toLowerCase().includes('certified')) {
        return `Consider obtaining ${item} certification to demonstrate expertise`;
      }
      if (item.toLowerCase().includes('experience') || item.toLowerCase().includes('years')) {
        return `Highlight any relevant projects or roles that demonstrate ${item.toLowerCase()}`;
      }
      if (item.toLowerCase().includes('leadership') || item.toLowerCase().includes('management')) {
        return `Include examples of ${item.toLowerCase()} in project descriptions or achievements`;
      }
      return `Add "${item}" to your skills section and provide specific examples in your experience`;
    });
  };

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-6">
        <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium mr-3">
          Compatibility Breakdown
        </div>
      </div>
      
      <div className="space-y-6">
        {categories.map(({ key, label, icon }) => {
          const category = compatibilityBreakdown[key as keyof typeof compatibilityBreakdown];
          if (!category) return null;

          const presentItems = getPresentItems(category);
          const missingItems = getMissingItems(category);
          const suggestions = getSuggestions(category, missingItems);

          return (
            <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-blueberry dark:text-citrus flex items-center">
                  <span className="mr-2">{icon}</span>
                  {label}
                </h3>
                <span className={`text-lg font-bold ${getScoreColor(category.score)}`}>
                  {category.score}/100
                </span>
              </div>
              
              <Progress value={category.score} className="mb-3" />
              
              <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">
                {category.analysis}
              </p>

              <div className="space-y-4">
                {/* Present/Found items */}
                {presentItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Present/Found
                    </h4>
                    <div className="grid gap-2">
                      {presentItems.map((item: string, index: number) => (
                        <div key={index} className="text-xs bg-green-50 text-green-800 px-3 py-2 rounded border-l-4 border-green-500">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing items with suggestions */}
                {missingItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" />
                      Missing/Needed
                    </h4>
                    <div className="grid gap-2">
                      {missingItems.map((item: string, index: number) => (
                        <div key={index} className="bg-red-50 border-l-4 border-red-500 rounded p-3">
                          <div className="text-xs text-red-800 font-medium mb-1">{item}</div>
                          {suggestions[index] && (
                            <div className="flex items-start mt-2">
                              <Lightbulb className="h-3 w-3 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                <strong>CV Suggestion:</strong> {suggestions[index]}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompatibilityBreakdownSection;
