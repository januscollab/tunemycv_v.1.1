
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedKeywordAnalysisProps {
  keywordAnalysis: {
    totalKeywords: number;
    matchedKeywords: number;
    keywordMatchPercentage: number;
    keywords: Array<{
      keyword: string;
      found: boolean;
      importance: 'high' | 'medium' | 'low';
      occurrences: number;
      context: string;
      suggestion: string;
    }>;
  };
}

const EnhancedKeywordAnalysis: React.FC<EnhancedKeywordAnalysisProps> = ({ keywordAnalysis }) => {
  if (!keywordAnalysis) return null;

  const { totalKeywords, matchedKeywords, keywordMatchPercentage, keywords } = keywordAnalysis;

  // Separate found and missing keywords
  const foundKeywords = keywords.filter(k => k.found).slice(0, 20);
  const missingKeywords = keywords.filter(k => !k.found).slice(0, 20);

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-6">
        <CheckCircle className="h-6 w-6 text-apricot mr-3" />
        <h2 className="text-xl font-semibold text-blueberry dark:text-citrus">
          Keyword Analysis
        </h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{matchedKeywords}</div>
          <div className="text-sm text-green-700 dark:text-green-400">Found</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{totalKeywords - matchedKeywords}</div>
          <div className="text-sm text-red-700 dark:text-red-400">Missing</div>
        </div>
        <div className="bg-citrus/20 dark:bg-citrus/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blueberry dark:text-citrus">{keywordMatchPercentage}%</div>
          <div className="text-sm text-blueberry/70 dark:text-citrus/80">Match Rate</div>
        </div>
      </div>

      {/* Found Keywords */}
      {foundKeywords.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-green-600 mb-3 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            Found Keywords ({foundKeywords.length})
          </h4>
          <div className="space-y-2">
            {foundKeywords.map((keyword, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-blueberry dark:text-apple-core">{keyword.keyword}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getImportanceColor(keyword.importance)}`}>
                    {keyword.importance}
                  </span>
                </div>
                <div className="text-xs text-blueberry/70 dark:text-apple-core/80 max-w-xs">
                  {keyword.suggestion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {missingKeywords.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-red-600 mb-3 flex items-center">
            <XCircle className="h-4 w-4 mr-1" />
            Missing Keywords ({missingKeywords.length})
          </h4>
          <div className="space-y-2">
            {missingKeywords.map((keyword, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-700">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-blueberry dark:text-apple-core">{keyword.keyword}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getImportanceColor(keyword.importance)}`}>
                    {keyword.importance}
                  </span>
                </div>
                <div className="text-xs text-blueberry/70 dark:text-apple-core/80 max-w-xs">
                  {keyword.suggestion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Rate Alert */}
      {keywordMatchPercentage < 60 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-800">Low Keyword Match Rate</span>
          </div>
          <p className="text-xs text-yellow-700">
            Your CV matches {keywordMatchPercentage}% of the key terms from the job description. 
            Consider incorporating more of the missing high-importance keywords to improve Applicant Tracking System (ATS) compatibility.
          </p>
        </div>
      )}

      {/* ATS Information Link */}
      <div className="pt-4 border-t border-apple-core/20 dark:border-citrus/20">
        <Button
          variant="ghost"
          size="sm"
          className="text-blueberry/70 hover:text-apricot p-0 h-auto"
          onClick={() => window.open('/help#ats-keywords', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Learn about Applicant Tracking System (ATS)
        </Button>
      </div>
    </div>
  );
};

export default EnhancedKeywordAnalysis;
