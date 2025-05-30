
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface LegacyKeywordSectionProps {
  result: any;
}

const LegacyKeywordSection: React.FC<LegacyKeywordSectionProps> = ({ result }) => {
  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-4">
        <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium mr-3">
          Keyword Analysis
        </div>
      </div>
      <p className="text-sm text-blueberry/70 dark:text-apple-core/80 mb-4">
        We analyzed your CV for key terms from the job description. Here's what we found:
      </p>

      {result.keywordAnalysis && result.keywordAnalysis.length > 0 ? (
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-4 gap-2 text-xs font-medium text-blueberry/60 dark:text-apple-core/60 border-b pb-2">
            <span>Keyword</span>
            <span>Importance</span>
            <span>Present in CV</span>
            <span></span>
          </div>
          {result.keywordAnalysis.map((keyword: any, index: number) => (
            <div key={index} className="grid grid-cols-4 gap-2 text-sm items-center">
              <span className="font-medium text-blueberry dark:text-apple-core">{keyword.keyword}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                keyword.importance === 'High' ? 'bg-red-100 text-red-800' :
                keyword.importance === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {keyword.importance}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                keyword.present === 'Yes' ? 'bg-green-100 text-green-800' :
                keyword.present === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {keyword.present}
              </span>
              <span></span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {result.keywords_found && result.keywords_found.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Found Keywords ({result.keywords_found.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.keywords_found.map((keyword: string, index: number) => (
                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {result.keywords_missing && result.keywords_missing.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center">
                Missing Keywords ({result.keywords_missing.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.keywords_missing.map((keyword: string, index: number) => (
                  <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Missing Key Terms Alert */}
      {result.keywords_missing && result.keywords_missing.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
          <div className="flex items-center mb-1">
            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-800">Missing Key Terms</span>
          </div>
          <p className="text-xs text-yellow-700">
            Your CV is missing several high-importance keywords that could improve your ATS compatibility.
          </p>
        </div>
      )}
    </div>
  );
};

export default LegacyKeywordSection;
