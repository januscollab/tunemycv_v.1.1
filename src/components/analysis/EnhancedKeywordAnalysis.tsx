
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Star, TrendingUp } from 'lucide-react';

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
  const foundKeywords = keywords.filter(k => k.found);
  const missingKeywords = keywords.filter(k => !k.found);

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'high': return <Star className="h-4 w-4 text-red-600" fill="currentColor" />;
      case 'medium': return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case 'low': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return null;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low': return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-4">
        <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium mr-3">
          Enhanced Keyword Analysis
        </div>
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
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{keywordMatchPercentage}%</div>
          <div className="text-sm text-blue-700 dark:text-blue-400">Match Rate</div>
        </div>
      </div>

      {/* Found Keywords Section */}
      {foundKeywords.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-green-600 mb-3 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Found Keywords ({foundKeywords.length})
          </h3>
          <div className="space-y-2">
            {foundKeywords.map((keyword, index) => (
              <div key={index} className={`border-l-4 ${getImportanceColor(keyword.importance)} rounded-r p-3`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      {getImportanceIcon(keyword.importance)}
                      <span className="font-medium text-blueberry dark:text-apple-core ml-2">{keyword.keyword}</span>
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {keyword.occurrences}x found
                      </span>
                    </div>
                    <p className="text-xs text-blueberry/70 dark:text-apple-core/80 mb-1">{keyword.context}</p>
                    <p className="text-xs text-green-700 dark:text-green-400">{keyword.suggestion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords Section */}
      {missingKeywords.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center">
            <XCircle className="h-4 w-4 mr-2" />
            Missing Keywords ({missingKeywords.length})
          </h3>
          <div className="space-y-2">
            {missingKeywords.map((keyword, index) => (
              <div key={index} className={`border-l-4 ${getImportanceColor(keyword.importance)} rounded-r p-3`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      {getImportanceIcon(keyword.importance)}
                      <span className="font-medium text-blueberry dark:text-apple-core ml-2">{keyword.keyword}</span>
                      <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Missing
                      </span>
                    </div>
                    <p className="text-xs text-blueberry/70 dark:text-apple-core/80 mb-1">{keyword.context}</p>
                    <p className="text-xs text-red-700 dark:text-red-400 font-medium">{keyword.suggestion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Rate Alert */}
      {keywordMatchPercentage < 60 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-800">Optimization Needed</span>
          </div>
          <p className="text-xs text-yellow-700">
            Your CV matches {keywordMatchPercentage}% of the key terms. Focus on incorporating the high-importance missing keywords to improve ATS compatibility and relevance.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedKeywordAnalysis;
