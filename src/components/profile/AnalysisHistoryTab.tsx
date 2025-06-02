import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AnalysisHistoryHeader from './analysis/AnalysisHistoryHeader';
import EmptyAnalysisState from './analysis/EmptyAnalysisState';
import AnalysisListItem from './analysis/AnalysisListItem';
import AnalysisDetailModal from './analysis/AnalysisDetailModal';
import UpcomingFeatureModal from './analysis/UpcomingFeatureModal';

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
  credits: number;
  memberSince: string;
}

const AnalysisHistoryTab: React.FC<AnalysisHistoryTabProps> = ({ credits, memberSince }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
    console.log('Navigating to Cover Letter with analysis:', analysis);
    // Navigate to Cover Letter page with the analysis data - fixed property name
    navigate('/cover-letter', {
      state: {
        analysis: analysis,  // Changed from selectedAnalysis to analysis
        generationMethod: 'analysis'
      }
    });
  };

  const handleInterviewPrep = (analysis: AnalysisResult) => {
    console.log('Navigating to Interview Prep with analysis:', analysis);
    // Navigate to Analyze CV page with Interview Prep tab and analysis data
    navigate('/analyze?tab=interview-prep', {
      state: {
        analysis: analysis,
        source: 'history'
      }
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
            <AnalysisListItem
              key={analysis.id}
              analysis={analysis}
              onViewDetails={handleViewDetails}
              onDelete={handleDeleteAnalysis}
              onCreateCoverLetter={handleCreateCoverLetter}
              onInterviewPrep={handleInterviewPrep}
            />
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
