
import React from 'react';
import { BarChart3, CheckCircle, XCircle } from 'lucide-react';

interface CompatibilityBreakdownSectionProps {
  compatibilityBreakdown: {
    technicalSkills: {
      score: number;
      present: string[];
      missing: string[];
      analysis: string;
    };
    experience: {
      score: number;
      relevantExperience: string[];
      missingExperience: string[];
      analysis: string;
    };
    education: {
      score: number;
      relevantQualifications: string[];
      missingQualifications: string[];
      analysis: string;
    };
    softSkills: {
      score: number;
      present: string[];
      missing: string[];
      analysis: string;
    };
    industryKnowledge: {
      score: number;
      present: string[];
      missing: string[];
      analysis: string;
    };
  };
}

const CompatibilityBreakdownSection: React.FC<CompatibilityBreakdownSectionProps> = ({ compatibilityBreakdown }) => {
  if (!compatibilityBreakdown) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success bg-success-50';
    if (score >= 60) return 'text-warning bg-warning-50';
    return 'text-destructive bg-destructive-50';
  };

  const sections = [
    { key: 'technicalSkills', title: 'Technical Skills', data: compatibilityBreakdown.technicalSkills },
    { key: 'experience', title: 'Experience', data: compatibilityBreakdown.experience },
    { key: 'education', title: 'Education', data: compatibilityBreakdown.education },
    { key: 'softSkills', title: 'Soft Skills', data: compatibilityBreakdown.softSkills },
    { key: 'industryKnowledge', title: 'Industry Knowledge', data: compatibilityBreakdown.industryKnowledge }
  ];

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-6">
        <BarChart3 className="h-5 w-5 text-apricot mr-2" />
        <h2 className="text-heading font-semibold text-blueberry dark:text-citrus">Compatibility Breakdown</h2>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.key} className="border border-apple-core/20 dark:border-citrus/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-blueberry dark:text-citrus">{section.title}</h3>
              <span className={`px-3 py-1 rounded-full text-caption font-medium ${getScoreColor(section.data.score)}`}>
                {section.data.score}%
              </span>
            </div>
            
            <p className="text-body text-blueberry/70 dark:text-apple-core/80 mb-4">{section.data.analysis}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Present/Relevant Items */}
              {((section.data as any).present || (section.data as any).relevantExperience || (section.data as any).relevantQualifications) && (
                <div>
                  <h4 className="text-caption font-medium text-success mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Present/Relevant
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {((section.data as any).present || (section.data as any).relevantExperience || (section.data as any).relevantQualifications || []).map((item: string, index: number) => (
                      <span key={index} className="bg-success-50 text-success px-2 py-1 rounded text-micro">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Missing Items */}
              {((section.data as any).missing || (section.data as any).missingExperience || (section.data as any).missingQualifications) && (
                <div>
                  <h4 className="text-caption font-medium text-destructive mb-2 flex items-center">
                    <XCircle className="h-4 w-4 mr-1" />
                    Missing/Needed
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {((section.data as any).missing || (section.data as any).missingExperience || (section.data as any).missingQualifications || []).map((item: string, index: number) => (
                      <span key={index} className="bg-destructive-50 text-destructive px-2 py-1 rounded text-micro">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompatibilityBreakdownSection;
