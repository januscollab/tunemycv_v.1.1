
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AnalysisHistoryHeader from './analysis/AnalysisHistoryHeader';
import EmptyAnalysisState from './analysis/EmptyAnalysisState';
import AnalysisListItem from './analysis/AnalysisListItem';
import AnalysisDetailModal from './analysis/AnalysisDetailModal';

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
      <AnalysisHistoryHeader count={analyses.length} />

      {analyses.length === 0 ? (
        <EmptyAnalysisState />
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <AnalysisListItem
              key={analysis.id}
              analysis={analysis}
              onViewDetails={setSelectedAnalysis}
            />
          ))}
        </div>
      )}

      {selectedAnalysis && (
        <AnalysisDetailModal
          analysis={selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
        />
      )}
    </div>
  );
};

export default AnalysisHistoryTab;
