
import React from 'react';
import { CheckCircle, XCircle, BarChart3 } from 'lucide-react';

interface KeywordAnalysisProps {
  keywordsFound: string[];
  keywordsMissing: string[];
}

const KeywordAnalysis: React.FC<KeywordAnalysisProps> = ({ keywordsFound, keywordsMissing }) => {
  return (
    <div className="bg-white dark:bg-blueberry/20 rounded-lg shadow p-6 mb-8 border border-apple-core/20 dark:border-citrus/20">
      <div className="flex items-center mb-4">
        <BarChart3 className="h-5 w-5 text-apricot mr-2" />
        <h2 className="text-xl font-semibold text-blueberry dark:text-citrus">Keyword Analysis</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-green-600 mb-3 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            Found Keywords
          </h3>
          {keywordsFound && keywordsFound.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {keywordsFound.slice(0, 10).map((keyword: string, index: number) => (
                <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-blueberry/60 dark:text-apple-core/60">No keywords found.</p>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-red-600 mb-3 flex items-center">
            <XCircle className="h-4 w-4 mr-1" />
            Missing Keywords
          </h3>
          {keywordsMissing && keywordsMissing.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {keywordsMissing.slice(0, 10).map((keyword: string, index: number) => (
                <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-blueberry/60 dark:text-apple-core/60">No missing keywords identified.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeywordAnalysis;
