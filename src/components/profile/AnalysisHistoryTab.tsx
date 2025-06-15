import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DocumentHistory } from '@/components/ui/document-history';
import { Eye, FileText, MessageSquare, Trash2 } from 'lucide-react';
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
  has_cover_letter?: boolean;
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
    open: boolean;
    feature: string;
  }>({ open: false, feature: '' });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (user) {
      loadAnalyses();
    }
  }, [user]);

  const loadAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select(`
          id,
          job_title,
          company_name,
          compatibility_score,
          created_at,
          executive_summary,
          strengths,
          weaknesses,
          recommendations,
          cv_file_name,
          cv_file_size
        `)
        .eq('user_id', user?.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check for cover letters
      const analysisIds = data?.map(a => a.id) || [];
      const { data: coverLetterData } = await supabase
        .from('cover_letters')
        .select('analysis_result_id')
        .in('analysis_result_id', analysisIds);

      const coverLetterAnalysisIds = new Set(coverLetterData?.map(cl => cl.analysis_result_id) || []);

      const analysesWithCoverLetters = data?.map(analysis => ({
        ...analysis,
        has_cover_letter: coverLetterAnalysisIds.has(analysis.id)
      })) || [];

      setAnalyses(analysesWithCoverLetters);
    } catch (error) {
      console.error('Failed to load analyses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your analysis history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    try {
      const { error } = await supabase
        .from('analysis_results')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', analysisId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId));
      toast({
        title: 'Success',
        description: 'Analysis deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete analysis',
        variant: 'destructive',
      });
    }
  };

  const handleViewAnalysis = (analysis: AnalysisResult) => {
    setSelectedAnalysis(analysis);
  };

  const handleCreateCoverLetter = (analysis: AnalysisResult) => {
    navigate('/cover-letter', {
      state: {
        analysis: analysis,
        activeTab: 'create'
      }
    });
  };

  const handleInterviewPrep = () => {
    setUpcomingFeatureModal({ open: true, feature: 'Interview Preparation' });
  };

  // Calculate pagination
  const totalPages = Math.ceil(analyses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAnalyses = analyses.slice(startIndex, endIndex);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  return (
    <div className="space-y-6">
      <DocumentHistory
        header={{
          title: "Analysis History",
          totalCount: analyses.length,
          filterType: 'analysis',
          onFilterChange: () => {},
          itemsPerPage: itemsPerPage,
          onItemsPerPageChange: setItemsPerPage,
          showPagination: true
        }}
        documents={paginatedAnalyses.map(analysis => ({
          id: analysis.id,
          type: 'analysis' as const,
          title: analysis.job_title,
          company_name: analysis.company_name,
          created_at: analysis.created_at,
          compatibility_score: analysis.compatibility_score,
          has_cover_letter: analysis.has_cover_letter,
          executive_summary: analysis.executive_summary,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          recommendations: analysis.recommendations
        }))}
        loading={loading}
        onDocumentClick={(document) => {
          // Find the full analysis object
          const fullAnalysis = analyses.find(a => a.id === document.id);
          if (fullAnalysis) handleViewAnalysis(fullAnalysis);
        }}
        actions={[
          {
            label: 'View',
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: (document) => {
              const fullAnalysis = analyses.find(a => a.id === document.id);
              if (fullAnalysis) handleViewAnalysis(fullAnalysis);
            }
          },
          {
            label: 'Cover Letter',
            icon: <FileText className="h-4 w-4 mr-2" />,
            onClick: (document) => {
              const fullAnalysis = analyses.find(a => a.id === document.id);
              if (fullAnalysis) handleCreateCoverLetter(fullAnalysis);
            },
            variant: 'success'
          },
          {
            label: 'Interview Prep',
            icon: <MessageSquare className="h-4 w-4 mr-2" />,
            onClick: handleInterviewPrep
          },
          {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4 mr-2" />,
            onClick: (document) => handleDeleteAnalysis(document.id),
            variant: 'destructive'
          }
        ]}
        emptyState={{
          title: "No analyses yet",
          description: "You haven't created any CV analyses yet. Start by analyzing your CV against a job description."
        }}
        pagination={totalPages > 1 ? {
          currentPage: currentPage,
          totalPages: totalPages,
          onPageChange: setCurrentPage
        } : undefined}
      />

      {/* Modals */}
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