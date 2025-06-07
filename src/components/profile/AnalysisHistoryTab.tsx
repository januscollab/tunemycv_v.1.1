
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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
    isOpen: boolean;
    featureType: 'cover-letter' | 'interview-prep' | null;
  }>({
    isOpen: false,
    featureType: null
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
          analysis_logs(cost_estimate),
          cover_letters(id)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map(analysis => ({
        ...analysis,
        credit_cost: analysis.analysis_logs?.[0]?.cost_estimate ? Math.ceil(analysis.analysis_logs[0].cost_estimate) : 1,
        has_cover_letter: analysis.cover_letters && analysis.cover_letters.length > 0
      }));
      
      setAnalyses(transformedData);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load analysis history', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (analysis: AnalysisResult) => {
    navigate('/analyze-cv', { 
      state: { analysis, source: 'history', targetTab: 'view-analysis' }
    });
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

  const handleEditAnalysisTitle = async (analysisId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('analysis_results')
        .update({ job_title: newTitle })
        .eq('id', analysisId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setAnalyses(prev => prev.map(analysis => 
        analysis.id === analysisId 
          ? { ...analysis, job_title: newTitle }
          : analysis
      ));

      toast({ title: 'Success', description: 'Analysis title updated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update analysis title', variant: 'destructive' });
    }
  };

  const handleCreateCoverLetter = async (analysis: AnalysisResult) => {
    if (analysis.has_cover_letter) {
      // If cover letter exists, fetch it and navigate to view it
      try {
        const { data: coverLetter, error } = await supabase
          .from('cover_letters')
          .select('*')
          .eq('analysis_result_id', analysis.id)
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        console.log('Navigating to Cover Letter to view existing letter:', coverLetter);
        // Navigate to Cover Letter page with the existing cover letter data
        navigate('/cover-letter', {
          state: {
            coverLetter: coverLetter,
            viewMode: true,
            activeTab: 'result'
          }
        });
      } catch (error) {
        console.error('Failed to fetch cover letter:', error);
        toast({ title: 'Error', description: 'Failed to load cover letter', variant: 'destructive' });
      }
    } else {
      // If no cover letter exists, navigate to create one
      console.log('Navigating to Cover Letter to create new letter:', analysis);
      navigate('/cover-letter', {
        state: {
          analysis: analysis,
          generationMethod: 'analysis'
        }
      });
    }
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

  // Calculate pagination
  const totalPages = Math.ceil(analyses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAnalyses = analyses.slice(startIndex, endIndex);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zapier-orange"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div className="mb-6">
        <h2 className="text-heading font-semibold text-gray-900">Analysis History</h2>
        <div className="text-caption text-gray-500 mt-1">
          {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'}
        </div>
      </div>
        {analyses.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-caption text-gray-600">Show:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-caption text-gray-600">per page</span>
          </div>
        )}
      </div>

      {analyses.length === 0 ? (
        <EmptyAnalysisState />
      ) : (
        <>
          <div className="space-y-4">
            {paginatedAnalyses.map((analysis) => (
              <AnalysisListItem
                key={analysis.id}
                analysis={analysis}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteAnalysis}
                onCreateCoverLetter={handleCreateCoverLetter}
                onInterviewPrep={handleInterviewPrep}
                onEditTitle={handleEditAnalysisTitle}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                      <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={`${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''} text-body font-normal`}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={currentPage === page}
                        className="text-body font-normal"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                      <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={`${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''} text-body font-normal`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
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
