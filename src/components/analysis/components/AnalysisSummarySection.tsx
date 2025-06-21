
import React from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { VybeButton } from '@/components/design-system/VybeButton';

interface AnalysisSummarySectionProps {
  compatibilityScore: number;
  jobTitle: string;
  companyName: string;
  onDownload?: () => void;
  onReviewInBrowser?: () => void;
}

const AnalysisSummarySection: React.FC<AnalysisSummarySectionProps> = ({
  compatibilityScore,
  jobTitle,
  companyName,
  onDownload,
  onReviewInBrowser
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 50) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Analysis Summary</h2>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start gap-6">
          {/* Score Circle */}
          <div className={`flex-shrink-0 w-24 h-24 rounded-full border-2 flex items-center justify-center ${getScoreBg(compatibilityScore)}`}>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(compatibilityScore)}`}>
                {compatibilityScore}%
              </div>
              <div className="text-xs text-gray-500 font-medium">Match</div>
            </div>
          </div>

          {/* Job Details */}
          <div className="flex-1 min-w-0">
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Position</div>
                <div className="text-lg font-semibold text-gray-900 break-words">
                  {jobTitle || 'Unknown Position'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Company</div>
                <div className="text-lg font-semibold text-gray-900 break-words">
                  {companyName || 'Unknown Company'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex flex-col gap-3">
            {onReviewInBrowser && (
              <VybeButton
                vybeVariant="outline"
                vybeSize="sm"
                onClick={onReviewInBrowser}
                icon={ExternalLink}
                className="whitespace-nowrap"
              >
                Review
              </VybeButton>
            )}
            {onDownload && (
              <VybeButton
                vybeVariant="primary"
                vybeSize="sm"
                onClick={onDownload}
                icon={Download}
                className="whitespace-nowrap"
              >
                Download
              </VybeButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSummarySection;
