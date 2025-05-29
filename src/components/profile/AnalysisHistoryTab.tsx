
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, Calendar, Building } from 'lucide-react';

interface AnalysisResult {
  id: string;
  job_title: string;
  company_name: string;
  compatibility_score: number;
  created_at: string;
  executive_summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

const AnalysisHistoryTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (user) {
      loadAnalysisHistory();
    }
  }, [user]);

  const loadAnalysisHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load analysis history', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Analysis History</h2>
        <div className="text-sm text-gray-500">
          {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'}
        </div>
      </div>

      {analyses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
          <p className="text-gray-500 mb-4">
            Start analyzing your CV to see your history here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {analysis.job_title || 'Untitled Position'}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {analysis.compatibility_score}% match
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Building className="h-4 w-4 mr-1" />
                    <span>{analysis.company_name || 'Company not specified'}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedAnalysis(analysis)}
                  className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analysis Detail Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Analysis Details</h2>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedAnalysis.job_title || 'Untitled Position'}
                </h3>
                <p className="text-gray-600">{selectedAnalysis.company_name || 'Company not specified'}</p>
                <p className="text-sm text-gray-500">
                  Analyzed on {new Date(selectedAnalysis.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Compatibility Score</h4>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${selectedAnalysis.compatibility_score}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {selectedAnalysis.compatibility_score}%
                  </span>
                </div>
              </div>

              {selectedAnalysis.executive_summary && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Executive Summary</h4>
                  <p className="text-gray-700">{selectedAnalysis.executive_summary}</p>
                </div>
              )}

              {selectedAnalysis.strengths && selectedAnalysis.strengths.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {selectedAnalysis.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedAnalysis.weaknesses && selectedAnalysis.weaknesses.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Areas for Improvement</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {selectedAnalysis.weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedAnalysis.recommendations && selectedAnalysis.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {selectedAnalysis.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisHistoryTab;
