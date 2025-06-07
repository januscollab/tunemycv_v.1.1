import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showAllKeywords, setShowAllKeywords] = useState(true);

  if (!keywordAnalysis) return null;

  const { totalKeywords, matchedKeywords, keywordMatchPercentage, keywords } = keywordAnalysis;

  // Calculate missing keywords for display
  const missingKeywords = totalKeywords - matchedKeywords;

  // Sort keywords by: importance (high first), then missing keywords first
  const sortedKeywords = keywords.sort((a, b) => {
    const importanceOrder = { high: 3, medium: 2, low: 1 };
    const importanceA = importanceOrder[a.importance];
    const importanceB = importanceOrder[b.importance];
    
    if (importanceA !== importanceB) return importanceB - importanceA;
    if (a.found !== b.found) return a.found ? 1 : -1;
    return 0;
  });

  // Show first 10 keywords when collapsed, all when expanded
  const displayKeywords = showAllKeywords ? sortedKeywords : sortedKeywords.slice(0, 10);
  const hasMoreKeywords = sortedKeywords.length > 10;

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
      <div className="flex items-center mb-6">
        <CheckCircle className="h-5 w-5 text-apricot mr-2" />
        <h2 className="text-subheading font-semibold text-foreground">Enhanced Keyword Analysis</h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <div className="text-title font-bold text-success">{matchedKeywords}</div>
          <div className="text-caption text-green-700 dark:text-green-400">Found</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
          <div className="text-title font-bold text-destructive">{missingKeywords}</div>
          <div className="text-caption text-red-700 dark:text-red-400">Missing</div>
        </div>
        <div className="bg-citrus/20 dark:bg-citrus/10 rounded-lg p-3 text-center">
          <div className="text-title font-bold text-primary">{keywordMatchPercentage}%</div>
          <div className="text-caption text-blueberry/70 dark:text-citrus/80">Match Rate</div>
        </div>
      </div>

      {/* Total keywords info */}
      <div className="bg-citrus/10 border border-citrus/30 rounded-lg p-3 mb-4">
        <div className="flex items-center">
          <Info className="h-4 w-4 text-blueberry mr-2" />
          <span className="text-caption text-blueberry dark:text-apple-core">
            Total keywords analyzed: {totalKeywords} (showing {showAllKeywords ? 'all' : `first ${Math.min(10, keywords.length)}`} keywords, prioritized by importance and missing status)
          </span>
        </div>
      </div>

      {/* Detailed Keyword List */}
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-2 text-micro font-medium text-blueberry/60 dark:text-apple-core/60 border-b pb-2">
          <span>Keyword</span>
          <span>Importance</span>
          <span>Status</span>
          <span>Suggestion</span>
        </div>
        
        {displayKeywords.map((keyword, index) => (
          <div key={index} className="grid grid-cols-4 gap-2 text-caption items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <div>
              <span className="font-medium text-blueberry dark:text-apple-core">{keyword.keyword}</span>
              {keyword.context && (
                <div className="text-micro text-blueberry/60 dark:text-apple-core/60 mt-1">
                  {keyword.context}
                </div>
              )}
              {keyword.found && keyword.occurrences > 0 && (
                <div className="text-micro text-green-600 mt-1">
                  Found {keyword.occurrences} time{keyword.occurrences !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            <span className={`px-2 py-1 rounded text-micro font-medium ${getImportanceColor(keyword.importance)}`}>
              {keyword.importance}
            </span>
            
            <div className="flex items-center">
              <span className={`px-2 py-1 rounded text-micro font-medium ${getStatusColor(keyword.found)}`}>
                {keyword.found ? 'Found' : 'Missing'}
              </span>
            </div>
            
            <div className="text-micro text-blueberry/70 dark:text-apple-core/80">
              {keyword.suggestion}
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {hasMoreKeywords && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllKeywords(!showAllKeywords)}
            className="text-apricot hover:text-apricot/80"
          >
            {showAllKeywords ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less Keywords
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show All {keywords.length} Keywords
              </>
            )}
          </Button>
        </div>
      )}

      {/* Match Rate Alert */}
      {keywordMatchPercentage < 60 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
            <span className="text-caption font-medium text-yellow-800">Low Keyword Match Rate</span>
          </div>
          <p className="text-micro text-yellow-700">
            Your CV matches {keywordMatchPercentage}% of the key terms from the job description. 
            Consider incorporating more of the missing high-importance keywords to improve Applicant Tracking System (ATS) compatibility.
          </p>
        </div>
      )}

      {/* ATS Information Link - Moved to bottom */}
      <div className="mt-6 pt-4 border-t border-apple-core/20 dark:border-citrus/20">
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