
import React from 'react';
import { Building, TrendingUp, Award, Target } from 'lucide-react';

interface CompanyIntelligenceSectionProps {
  companyIntelligence: {
    candidateCompanies: Array<{
      name: string;
      industry: string;
      relevance: number;
      marketPosition: string;
      industryContext: string;
    }>;
    industryProgression: string;
    marketKnowledge: string;
    competitiveAdvantage: string;
  };
}

const CompanyIntelligenceSection: React.FC<CompanyIntelligenceSectionProps> = ({ 
  companyIntelligence 
}) => {
  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (relevance >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-6">
        <Building className="h-6 w-6 text-apricot mr-3" />
        <h2 className="text-xl font-semibold text-blueberry dark:text-citrus">
          Company & Industry Intelligence
        </h2>
      </div>

      <div className="space-y-6">
        {/* Company Experience Analysis */}
        {companyIntelligence.candidateCompanies && companyIntelligence.candidateCompanies.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-blueberry dark:text-citrus mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Professional Experience Analysis
            </h3>
            <div className="grid gap-4">
              {companyIntelligence.candidateCompanies.map((company, index) => (
                <div key={index} className="border border-apple-core/10 dark:border-citrus/10 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-blueberry dark:text-citrus">{company.name}</h4>
                      <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-2">
                        Industry: {company.industry}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRelevanceColor(company.relevance)}`}>
                      {company.relevance}% relevant
                    </div>
                  </div>
                  <p className="text-sm text-blueberry/80 dark:text-apple-core/90 mb-2">
                    <strong>Market Position:</strong> {company.marketPosition}
                  </p>
                  <p className="text-sm text-blueberry/80 dark:text-apple-core/90">
                    <strong>Industry Context:</strong> {company.industryContext}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Industry Progression */}
        {companyIntelligence.industryProgression && (
          <div>
            <h3 className="text-lg font-medium text-blueberry dark:text-citrus mb-3 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Career Progression Analysis
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blueberry/80 dark:text-apple-core/90">
                {companyIntelligence.industryProgression}
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Market Knowledge */}
          {companyIntelligence.marketKnowledge && (
            <div>
              <h3 className="text-lg font-medium text-blueberry dark:text-citrus mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Market Knowledge
              </h3>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <p className="text-sm text-blueberry/80 dark:text-apple-core/90">
                  {companyIntelligence.marketKnowledge}
                </p>
              </div>
            </div>
          )}

          {/* Competitive Advantage */}
          {companyIntelligence.competitiveAdvantage && (
            <div>
              <h3 className="text-lg font-medium text-blueberry dark:text-citrus mb-3 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Competitive Advantage
              </h3>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm text-blueberry/80 dark:text-apple-core/90">
                  {companyIntelligence.competitiveAdvantage}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyIntelligenceSection;
