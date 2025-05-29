
import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  id: string;
  job_title: string | null;
  company_name: string | null;
  compatibility_score: number;
  created_at: string;
}

const FileUploadTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalysisHistory();
    }
  }, [user]);

  const loadAnalysisHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select('id, job_title, company_name, compatibility_score, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error loading analysis history:', error);
      toast({ title: 'Error', description: 'Failed to load analysis history', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (analysisId: string) => {
    try {
      const { error } = await supabase
        .from('analysis_results')
        .delete()
        .eq('id', analysisId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId));
      toast({ title: 'Success', description: 'Analysis deleted successfully' });
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast({ title: 'Error', description: 'Failed to delete analysis', variant: 'destructive' });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Analysis History</h2>
        <span className="text-sm text-gray-500">{analyses.length} total analyses</span>
      </div>
      
      {analyses.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
          <p className="text-gray-500 mb-4">Upload your CV and job descriptions to start analyzing compatibility.</p>
          <a
            href="/analyze"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Start Your First Analysis
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {analysis.job_title || 'Untitled Position'}
                  </h3>
                  <p className="text-gray-600">{analysis.company_name || 'Unknown Company'}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(analysis.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full ${getScoreColor(analysis.compatibility_score)}`}>
                    <div className="text-lg font-bold">{analysis.compatibility_score}%</div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => window.location.href = `/analysis/${analysis.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteAnalysis(analysis.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Analysis"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadTab;
