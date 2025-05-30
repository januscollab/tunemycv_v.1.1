
import React from 'react';
import { AlertTriangle, TrendingUp, Target, Lightbulb, BookOpen, ExternalLink, Award, Clock } from 'lucide-react';

interface SkillsGapAnalysisProps {
  skillsGapAnalysis: {
    criticalGaps: Array<{
      skill: string;
      importance: 'high' | 'medium' | 'low';
      description: string;
      bridgingStrategy: string;
      learningResources?: Array<{
        title: string;
        provider: string;
        url: string;
        type: 'course' | 'certification' | 'documentation' | 'book';
        duration?: string;
        level?: 'beginner' | 'intermediate' | 'advanced';
      }>;
    }>;
    developmentAreas: Array<{
      area: string;
      description: string;
      relevance: string;
      actionPlan: string;
      learningResources?: Array<{
        title: string;
        provider: string;
        url: string;
        type: 'course' | 'certification' | 'documentation' | 'book';
        duration?: string;
        level?: 'beginner' | 'intermediate' | 'advanced';
      }>;
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

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      case 'documentation': return <ExternalLink className="h-4 w-4" />;
      case 'book': return <BookOpen className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate contextual learning resources if not provided
  const generateLearningResources = (skill: string) => {
    const skillLower = skill.toLowerCase();
    
    // Common learning resources based on skill type
    if (skillLower.includes('python') || skillLower.includes('programming')) {
      return [
        {
          title: "Python for Everybody Specialization",
          provider: "Coursera (University of Michigan)",
          url: "https://www.coursera.org/specializations/python",
          type: "course" as const,
          duration: "8 months",
          level: "beginner" as const
        },
        {
          title: "Python Institute Certifications",
          provider: "Python Institute",
          url: "https://pythoninstitute.org/certification/",
          type: "certification" as const,
          duration: "Variable",
          level: "intermediate" as const
        }
      ];
    }
    
    if (skillLower.includes('aws') || skillLower.includes('cloud')) {
      return [
        {
          title: "AWS Cloud Practitioner",
          provider: "AWS Training",
          url: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
          type: "certification" as const,
          duration: "3-6 months",
          level: "beginner" as const
        },
        {
          title: "AWS Solutions Architect",
          provider: "AWS Training",
          url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
          type: "certification" as const,
          duration: "6-12 months",
          level: "intermediate" as const
        }
      ];
    }
    
    if (skillLower.includes('data') || skillLower.includes('analytics')) {
      return [
        {
          title: "Google Data Analytics Certificate",
          provider: "Coursera (Google)",
          url: "https://www.coursera.org/professional-certificates/google-data-analytics",
          type: "certification" as const,
          duration: "6 months",
          level: "beginner" as const
        },
        {
          title: "Data Science Specialization",
          provider: "Coursera (Johns Hopkins)",
          url: "https://www.coursera.org/specializations/jhu-data-science",
          type: "course" as const,
          duration: "11 months",
          level: "intermediate" as const
        }
      ];
    }
    
    if (skillLower.includes('project management') || skillLower.includes('agile')) {
      return [
        {
          title: "PMP Certification Training",
          provider: "PMI",
          url: "https://www.pmi.org/certifications/project-management-pmp",
          type: "certification" as const,
          duration: "3-6 months",
          level: "intermediate" as const
        },
        {
          title: "Agile Project Management",
          provider: "Coursera (Google)",
          url: "https://www.coursera.org/learn/agile-project-management",
          type: "course" as const,
          duration: "6 weeks",
          level: "beginner" as const
        }
      ];
    }
    
    // Generic resources for any skill
    return [
      {
        title: `${skill} Fundamentals`,
        provider: "LinkedIn Learning",
        url: `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(skill)}`,
        type: "course" as const,
        duration: "2-4 weeks",
        level: "beginner" as const
      },
      {
        title: `${skill} Documentation`,
        provider: "Official Documentation",
        url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' official documentation')}`,
        type: "documentation" as const,
        duration: "Self-paced",
        level: "intermediate" as const
      }
    ];
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
            <div className="space-y-4">
              {criticalGaps.map((gap, index) => {
                const resources = gap.learningResources || generateLearningResources(gap.skill);
                
                return (
                  <div key={index} className={`border rounded-lg p-4 ${getImportanceColor(gap.importance)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blueberry dark:text-citrus">{gap.skill}</h4>
                      <span className="text-xs px-2 py-1 rounded bg-white/50">
                        {gap.importance} priority
                      </span>
                    </div>
                    <p className="text-sm text-blueberry/80 dark:text-apple-core mb-3">{gap.description}</p>
                    
                    <div className="bg-white/70 dark:bg-gray-800/50 rounded p-3 mb-3">
                      <div className="flex items-start">
                        <TrendingUp className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-1">Bridging Strategy:</h5>
                          <p className="text-xs text-blue-700 dark:text-blue-500">{gap.bridgingStrategy}</p>
                        </div>
                      </div>
                    </div>

                    {/* Learning Resources */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-green-800 dark:text-green-400 flex items-center">
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Recommended Learning Resources:
                      </h5>
                      {resources.map((resource, rIndex) => (
                        <a
                          key={rIndex}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <div className="flex items-center flex-1">
                            {getResourceIcon(resource.type)}
                            <div className="ml-2 flex-1">
                              <div className="text-xs font-medium text-blue-800 dark:text-blue-400">
                                {resource.title}
                              </div>
                              <div className="text-xs text-blue-600 dark:text-blue-500">
                                {resource.provider}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            {resource.duration && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {resource.duration}
                              </span>
                            )}
                            {resource.level && (
                              <span className={`text-xs px-2 py-1 rounded ${getLevelColor(resource.level)}`}>
                                {resource.level}
                              </span>
                            )}
                            <ExternalLink className="h-3 w-3 text-blue-600" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
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
            <div className="space-y-4">
              {developmentAreas.map((area, index) => {
                const resources = area.learningResources || generateLearningResources(area.area);
                
                return (
                  <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                    <h4 className="font-medium text-blueberry dark:text-citrus mb-2">{area.area}</h4>
                    <p className="text-sm text-blueberry/80 dark:text-apple-core mb-2">{area.description}</p>
                    
                    <div className="mb-3">
                      <h5 className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-1">Relevance:</h5>
                      <p className="text-xs text-blue-700 dark:text-blue-500">{area.relevance}</p>
                    </div>
                    
                    <div className="bg-white/70 dark:bg-gray-800/50 rounded p-3 mb-3">
                      <h5 className="text-xs font-medium text-green-800 dark:text-green-400 mb-1">Action Plan:</h5>
                      <p className="text-xs text-green-700 dark:text-green-500">{area.actionPlan}</p>
                    </div>

                    {/* Learning Resources */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-purple-800 dark:text-purple-400 flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Learning Opportunities:
                      </h5>
                      {resources.slice(0, 2).map((resource, rIndex) => (
                        <a
                          key={rIndex}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                        >
                          <div className="flex items-center flex-1">
                            {getResourceIcon(resource.type)}
                            <div className="ml-2 flex-1">
                              <div className="text-xs font-medium text-purple-800 dark:text-purple-400">
                                {resource.title}
                              </div>
                              <div className="text-xs text-purple-600 dark:text-purple-500">
                                {resource.provider}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            {resource.duration && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {resource.duration}
                              </span>
                            )}
                            <ExternalLink className="h-3 w-3 text-purple-600" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
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
