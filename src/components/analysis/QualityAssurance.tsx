
import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface QualityAssuranceProps {
  qualityFlags: string[];
  confidenceScore: number;
  contentAnalysis: {
    totalExperienceYears: number;
    experienceLevel: string;
    industryExposure: string[];
    companyExperience: Array<{
      company: string;
      industry: string;
      yearsEstimate: number;
    }>;
  };
}

const QualityAssurance: React.FC<QualityAssuranceProps> = ({ 
  qualityFlags, 
  confidenceScore, 
  contentAnalysis 
}) => {
  if (qualityFlags.length === 0 && confidenceScore >= 80) {
    return null; // Don't show if quality is good
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return Info;
    return AlertTriangle;
  };

  const ConfidenceIcon = getConfidenceIcon(confidenceScore);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <ConfidenceIcon className={`h-5 w-5 mr-2 ${getConfidenceColor(confidenceScore)}`} />
        <h3 className="text-lg font-semibold text-yellow-800">Analysis Quality Report</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-yellow-700">Confidence Score:</span>
          <span className={`text-sm font-bold ${getConfidenceColor(confidenceScore)}`}>
            {confidenceScore}%
          </span>
        </div>

        {qualityFlags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-yellow-700 mb-2">Quality Flags:</h4>
            <ul className="space-y-1">
              {qualityFlags.map((flag, index) => (
                <li key={index} className="text-xs text-yellow-600 flex items-start">
                  <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-yellow-100 rounded p-2">
          <h4 className="text-xs font-medium text-yellow-700 mb-1">CV Content Detected:</h4>
          <div className="text-xs text-yellow-600 space-y-1">
            <div>Experience Level: {contentAnalysis.experienceLevel} ({contentAnalysis.totalExperienceYears} years)</div>
            <div>Industry Exposure: {contentAnalysis.industryExposure.join(', ') || 'General'}</div>
            <div>Companies: {contentAnalysis.companyExperience.length} identified</div>
          </div>
        </div>

        {confidenceScore < 70 && (
          <div className="text-xs text-yellow-600">
            <strong>Note:</strong> This analysis may contain inaccuracies. Please review the feedback carefully 
            and consider the actual content of your CV when making decisions.
          </div>
        )}
      </div>
    </div>
  );
};

export default QualityAssurance;
