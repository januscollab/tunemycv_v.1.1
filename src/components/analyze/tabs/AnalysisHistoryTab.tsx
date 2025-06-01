
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AnalysisHistoryHeader from '@/components/profile/analysis/AnalysisHistoryHeader';
import EmptyAnalysisState from '@/components/profile/analysis/EmptyAnalysisState';
import AnalysisListItem from '@/components/profile/analysis/AnalysisListItem';
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

interface AnalysisHistoryTabProps {
  onAnalysisSelect: (analysis: AnalysisResult) => void;
}

const AnalysisHistoryTab: React.FC<AnalysisHistoryTabProps> = ({ onAnalysisSelect }) => {
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
      toast({ title: 'Error', description: 'Failed to load analysis history', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (analysis: AnalysisResult) => {
    setSelectedAnalysis(analysis);
  };

  const handleViewReport = (analysis: AnalysisResult) => {
    onAnalysisSelect(analysis);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnalysisHistoryHeader analysisCount={analyses.length} />

      {analyses.length === 0 ? (
        <EmptyAnalysisState />
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="relative">
              <AnalysisListItem
                analysis={analysis}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteAnalysis}
                onCreateCoverLetter={handleCreateCoverLetter}
                onInterviewPrep={handleInterviewPrep}
              />
              <button
                onClick={() => handleViewReport(analysis)}
                className="absolute top-4 right-4 bg-apricot hover:bg-apricot/90 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                View Report
              </button>
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
  );
};

export default AnalysisHistoryTab;
