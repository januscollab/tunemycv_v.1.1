
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

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

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (found: boolean) => {
    return found ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{matchedKeywords}</div>
          <div className="text-sm text-blue-700 dark:text-blue-400">Found</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{totalKeywords - matchedKeywords}</div>
          <div className="text-sm text-red-700 dark:text-red-400">Missing</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{keywordMatchPercentage}%</div>
          <div className="text-sm text-green-700 dark:text-green-400">Match Rate</div>
        </div>
      </div>

      {/* Detailed Keyword List */}
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-2 text-xs font-medium text-blueberry/60 dark:text-apple-core/60 border-b pb-2">
          <span>Keyword</span>
          <span>Importance</span>
          <span>Status</span>
          <span>Occurrences</span>
          <span>Suggestion</span>
        </div>
        
        {keywords.map((keyword, index) => (
          <div key={index} className="grid grid-cols-5 gap-2 text-sm items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <div>
              <span className="font-medium text-blueberry dark:text-apple-core">{keyword.keyword}</span>
              {keyword.context && (
                <div className="text-xs text-blueberry/60 dark:text-apple-core/60 mt-1">
                  {keyword.context}
                </div>
              )}
            </div>
            
            <span className={`px-2 py-1 rounded text-xs font-medium ${getImportanceColor(keyword.importance)}`}>
              {keyword.importance}
            </span>
            
            <div className="flex items-center">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(keyword.found)}`}>
                {keyword.found ? 'Found' : 'Missing'}
              </span>
            </div>
            
            <span className="text-blueberry/70 dark:text-apple-core/80">
              {keyword.found ? `${keyword.occurrences}x` : '0x'}
            </span>
            
            <div className="text-xs text-blueberry/70 dark:text-apple-core/80">
              {keyword.suggestion}
            </div>
          </div>
        ))}
      </div>

      {/* Match Rate Alert */}
      {keywordMatchPercentage < 60 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-800">Low Keyword Match Rate</span>
          </div>
          <p className="text-xs text-yellow-700">
            Your CV matches {keywordMatchPercentage}% of the key terms from the job description. 
            Consider incorporating more of the missing high-importance keywords to improve ATS compatibility.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedKeywordAnalysis;
