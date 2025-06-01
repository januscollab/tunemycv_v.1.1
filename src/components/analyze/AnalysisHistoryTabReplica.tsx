
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AnalysisHistoryHeader from '@/components/profile/analysis/AnalysisHistoryHeader';
import EmptyAnalysisState from '@/components/profile/analysis/EmptyAnalysisState';
import AnalysisDetailModal from '@/components/profile/analysis/AnalysisDetailModal';
import UpcomingFeatureModal from '@/components/profile/analysis/UpcomingFeatureModal';

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
  credit_cost?: number;
  cv_file_name?: string;
  cv_file_size?: number;
}

interface AnalysisHistoryTabReplicaProps {
  onViewAnalysis: (analysis: any) => void;
}

const AnalysisHistoryTabReplica: React.FC<AnalysisHistoryTabReplicaProps> = ({
  onViewAnalysis
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [upcomingFeatureModal, setUpcomingFeatureModal] = useState<{
    isOpen: boolean;
    featureType: 'cover-letter' | 'interview-prep' | null;
  }>({
    isOpen: false,
    featureType: null
  });

  useEffect(() => {
    if (user) {
      loadAnalysisHistory();
    }
  }, [user]);

  const loadAnalysisHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select(`
          *,
          analysis_logs(cost_estimate)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map(analysis => ({
        ...analysis,
        credit_cost: analysis.analysis_logs?.[0]?.cost_estimate ? Math.ceil(analysis.analysis_logs[0].cost_estimate) : 1
      }));
      
      setAnalyses(transformedData);
    } catch (error) {
      console.error('Error loading analysis history:', error);
      toast({ title: 'Error', description: 'Failed to load analysis history', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (analysis: AnalysisResult) => {
    setSelectedAnalysis(analysis);
  };

  const handleViewAnalysis = (analysis: AnalysisResult) => {
    onViewAnalysis(analysis);
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
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

  const handleCreateCoverLetter = (analysis: AnalysisResult) => {
    setUpcomingFeatureModal({
      isOpen: true,
      featureType: 'cover-letter'
    });
  };

  const handleInterviewPrep = (analysis: AnalysisResult) => {
    setUpcomingFeatureModal({
      isOpen: true,
      featureType: 'interview-prep'
    });
  };

  const closeUpcomingFeatureModal = () => {
    setUpcomingFeatureModal({
      isOpen: false,
      featureType: null
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apricot"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-2">
          Analysis History
        </h3>
        <p className="text-blueberry/70 dark:text-apple-core/80">
          View and manage your previous CV analysis results. Click "View Analysis" to view it in the Current Report tab.
        </p>
      </div>

      <div className="space-y-6">
        <AnalysisHistoryHeader analysisCount={analyses.length} />

        {analyses.length === 0 ? (
          <EmptyAnalysisState />
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="bg-white dark:bg-blueberry/20 border border-apple-core/20 dark:border-citrus/20 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-blueberry dark:text-citrus">
                        {analysis.job_title || 'Untitled Position'}
                      </h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {analysis.compatibility_score}% match
                      </span>
                      {analysis.credit_cost && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {analysis.credit_cost} credit{analysis.credit_cost > 1 ? 's' : ''} used
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-blueberry/70 dark:text-apple-core/70 mb-3">
                      <span>{analysis.company_name || 'Company not specified'}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                      {analysis.cv_file_name && (
                        <>
                          <span className="mx-2">•</span>
                          <span>CV: {analysis.cv_file_name}</span>
                        </>
                      )}
                    </div>

                    {analysis.executive_summary && (
                      <p className="text-sm text-blueberry/80 dark:text-apple-core/90 line-clamp-2">
                        {analysis.executive_summary}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewAnalysis(analysis)}
                      className="bg-apricot hover:bg-apricot/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      View Analysis
                    </button>
                    <button
                      onClick={() => handleViewDetails(analysis)}
                      className="bg-blueberry/10 hover:bg-blueberry/20 text-blueberry dark:bg-citrus/10 dark:hover:bg-citrus/20 dark:text-citrus px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleDeleteAnalysis(analysis.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AnalysisDetailModal
          analysis={selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
        />

        <UpcomingFeatureModal
          isOpen={upcomingFeatureModal.isOpen}
          onClose={closeUpcomingFeatureModal}
          featureType={upcomingFeatureModal.featureType}
        />
      </div>
    </div>
  );
};

export default AnalysisHistoryTabReplica;
