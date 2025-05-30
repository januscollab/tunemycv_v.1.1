
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface CompatibilityBreakdownProps {
  compatibilityBreakdown: {
    technicalSkills?: {
      score: number;
      present: string[];
      missing: string[];
      analysis: string;
    };
    experience?: {
      score: number;
      relevantExperience: string[];
      missingExperience: string[];
      analysis: string;
    };
    education?: {
      score: number;
      relevantQualifications: string[];
      missingQualifications: string[];
      analysis: string;
    };
    softSkills?: {
      score: number;
      present: string[];
      missing: string[];
      analysis: string;
    };
    industryKnowledge?: {
      score: number;
      present: string[];
      missing: string[];
      analysis: string;
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

              <div className="grid md:grid-cols-2 gap-4">
                {/* Present/Found items */}
                {(category.present || category.relevantExperience || category.relevantQualifications) && (
                  <div>
                    <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Present/Found
                    </h4>
                    <div className="space-y-1">
                      {(category.present || category.relevantExperience || category.relevantQualifications || []).map((item: string, index: number) => (
                        <div key={index} className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing items */}
                {(category.missing || category.missingExperience || category.missingQualifications) && (
                  <div>
                    <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" />
                      Missing/Needed
                    </h4>
                    <div className="space-y-1">
                      {(category.missing || category.missingExperience || category.missingQualifications || []).map((item: string, index: number) => (
                        <div key={index} className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded">
                          {item}
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
