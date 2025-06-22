import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { History, FileText, Calendar, Building, Eye, Download, Trash2, MessageSquare, Target, Plus, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAnalysisLinkage } from '@/utils/documentLinkage';
import LinkageIndicators from '@/components/analysis/LinkageIndicators';
import { DocumentTypeBadge } from '@/components/ui/document-type-badge';
import CoverLetterDocumentHistoryItem from '@/components/profile/CoverLetterDocumentHistoryItem';

interface CoverLetterItem {
  id: string;
  job_title: string;
  company_name: string;
  content: string;
  template_id?: string;
  created_at: string;
  updated_at: string;
  generation_parameters?: any;
  regeneration_count?: number;
  analysis_result_id?: string;
  linked_interview_prep_id?: string;
}

interface CoverLetterHistoryProps {
  onSelectCoverLetter?: (coverLetter: CoverLetterItem) => void;
  className?: string;
}

const CoverLetterHistory: React.FC<CoverLetterHistoryProps> = ({
  onSelectCoverLetter,
  className = ''
}) => {
  const { user } = useAuth();
  const [coverLetters, setCoverLetters] = useState<CoverLetterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [linkageCache, setLinkageCache] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoverLetterHistory();
  }, []);

  const fetchCoverLetterHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cover_letters')
        .select(`
          *,
          analysis_result_id,
          linked_interview_prep_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching cover letter history:', error);
        toast({
          title: "Error Loading History",
          description: "Failed to load your cover letter history.",
          variant: "destructive"
        });
      } else {
        setCoverLetters(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error Loading History",
        description: "An unexpected error occurred while loading your history.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (coverLetter: CoverLetterItem) => {
    if (onSelectCoverLetter) {
      onSelectCoverLetter(coverLetter);
    }
  };

  const handleDownload = (coverLetter: CoverLetterItem) => {
    try {
      const content = `${coverLetter.content}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Cover_Letter_${coverLetter.job_title}_${coverLetter.company_name}_${new Date(coverLetter.created_at).toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the cover letter.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (coverLetter: CoverLetterItem) => {
    if (!window.confirm(`Are you sure you want to delete this cover letter? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(coverLetter.id);

    try {
      const { error } = await supabase
        .from('cover_letters')
        .delete()
        .eq('id', coverLetter.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setCoverLetters(prev => prev.filter(item => item.id !== coverLetter.id));
      toast({
        title: "Cover Letter Deleted",
        description: "The cover letter has been successfully deleted.",
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the cover letter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewAnalysis = (analysisId: string) => {
    navigate('/analyze', {
      state: {
        viewAnalysis: analysisId
      }
    });
  };

  const handleViewInterviewPrep = (interviewPrepId: string) => {
    navigate(`/interview-toolkit?id=${interviewPrepId}`);
  };

  const handleCreateInterviewPrep = (coverLetter: CoverLetterItem) => {
    navigate('/interview-toolkit', {
      state: {
        fromCoverLetter: true,
        coverLetterData: coverLetter
      }
    });
  };

  // Load linkage data for cover letters
  useEffect(() => {
    if (coverLetters.length > 0) {
      const loadLinkages = async () => {
        const linkages: Record<string, any> = {};
        for (const coverLetter of coverLetters) {
          const linkage = {
            hasLinkedAnalysis: !!coverLetter.analysis_result_id,
            hasLinkedInterviewPrep: !!coverLetter.linked_interview_prep_id,
            linkedAnalysisId: coverLetter.analysis_result_id,
            linkedInterviewPrepId: coverLetter.linked_interview_prep_id
          };
          linkages[coverLetter.id] = linkage;
        }
        setLinkageCache(linkages);
      };
      loadLinkages();
    }
  }, [coverLetters]);

  // Filter and search logic
  const filteredCoverLetters = coverLetters.filter(coverLetter => {
    const matchesSearch = searchQuery === '' || 
      (coverLetter.job_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (coverLetter.company_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCoverLetters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCoverLetters = filteredCoverLetters.slice(startIndex, endIndex);

  // Reset to first page when search or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTemplateName = (templateId?: string) => {
    switch (templateId) {
      case 'creative':
        return 'Creative';
      case 'technical':
        return 'Technical';
      case 'executive':
        return 'Executive';
      default:
        return 'Professional';
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-4">
            <History className="h-8 w-8 animate-pulse mx-auto text-primary" />
            <p className="text-muted-foreground">Loading your cover letter history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (coverLetters.length === 0) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-title flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Cover Letters
          </h2>
        </div>
        <div className="text-center py-8">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Cover Letters
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your generated cover letters will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-title flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Cover Letters
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cover letters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            {filteredCoverLetters.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-caption text-muted-foreground">Show:</span>
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
                <span className="text-caption text-muted-foreground">per page</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {paginatedCoverLetters.map((coverLetter) => (
          <CoverLetterDocumentHistoryItem
            key={coverLetter.id}
            coverLetter={coverLetter}
            linkageData={linkageCache[coverLetter.id] || {}}
            onView={handleView}
            onViewAnalysis={handleViewAnalysis}
            onViewInterviewPrep={handleViewInterviewPrep}
            onCreateInterviewPrep={handleCreateInterviewPrep}
            onDownload={handleDownload}
            onDelete={handleDelete}
            isDeleting={deletingId === coverLetter.id}
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
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
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
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default CoverLetterHistory;
