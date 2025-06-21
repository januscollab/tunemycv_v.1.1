
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
import LinkageIndicators from '@/components/analysis/LinkageIndicators';
import { DocumentTypeBadge } from '@/components/ui/document-type-badge';

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

interface EnhancedCoverLetterHistoryProps {
  /** Whether to show the component title header */
  showTitle?: boolean;
  /** Whether to use compact display mode with reduced spacing */
  compact?: boolean;
  /** Maximum number of items to display (useful for demos) */
  maxItems?: number;
  /** Override the default items per page */
  defaultItemsPerPage?: number;
  /** Whether to show the search functionality */
  showSearch?: boolean;
  /** Whether to show pagination controls */
  showPagination?: boolean;
  /** Custom className for the wrapper */
  className?: string;
  /** Callback when a cover letter is selected */
  onSelectCoverLetter?: (coverLetter: CoverLetterItem) => void;
  /** Whether to use mock data for demonstration */
  useMockData?: boolean;
}

// Mock data for demonstration purposes
const mockCoverLetters: CoverLetterItem[] = [
  {
    id: 'mock-1',
    job_title: 'Senior Frontend Developer',
    company_name: 'Tech Innovations Inc.',
    content: 'Dear Hiring Manager...',
    template_id: 'technical',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    regeneration_count: 2,
    analysis_result_id: 'analysis-1',
    linked_interview_prep_id: 'prep-1'
  },
  {
    id: 'mock-2',
    job_title: 'UX Designer',
    company_name: 'Creative Solutions Ltd.',
    content: 'Dear Design Team...',
    template_id: 'creative',
    created_at: '2024-01-14T14:20:00Z',
    updated_at: '2024-01-14T14:20:00Z',
    regeneration_count: 0
  },
  {
    id: 'mock-3',
    job_title: 'Product Manager',
    company_name: 'Innovation Corp',
    content: 'Dear Product Team...',
    template_id: 'executive',
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-13T09:15:00Z',
    regeneration_count: 1,
    linked_interview_prep_id: 'prep-2'
  }
];

/**
 * EnhancedCoverLetterHistory - A flexible cover letter history component
 * 
 * This component displays a paginated, searchable list of cover letters with
 * full functionality including view, download, delete, and linkage management.
 * 
 * @param showTitle - Show/hide the "Cover Letter History" title (default: true)
 * @param compact - Use compact display mode with reduced spacing (default: false)
 * @param maxItems - Limit the number of items displayed (default: unlimited)
 * @param defaultItemsPerPage - Default items per page (default: 10)
 * @param showSearch - Show/hide search functionality (default: true)
 * @param showPagination - Show/hide pagination controls (default: true)
 * @param className - Custom CSS classes for the wrapper
 * @param onSelectCoverLetter - Callback when a cover letter is selected
 * @param useMockData - Use mock data instead of real data (default: false)
 * 
 * Usage Examples:
 * 
 * // Basic usage (full functionality)
 * <EnhancedCoverLetterHistory />
 * 
 * // Compact demo version
 * <EnhancedCoverLetterHistory 
 *   compact={true}
 *   maxItems={3}
 *   useMockData={true}
 * />
 * 
 * // No title, custom pagination
 * <EnhancedCoverLetterHistory 
 *   showTitle={false}
 *   defaultItemsPerPage={5}
 * />
 * 
 * // Minimal version for demos
 * <EnhancedCoverLetterHistory 
 *   showSearch={false}
 *   showPagination={false}
 *   maxItems={2}
 *   useMockData={true}
 * />
 */
const EnhancedCoverLetterHistory: React.FC<EnhancedCoverLetterHistoryProps> = ({
  showTitle = true,
  compact = false,
  maxItems,
  defaultItemsPerPage = 10,
  showSearch = true,
  showPagination = true,
  className = '',
  onSelectCoverLetter,
  useMockData = false
}) => {
  const { user } = useAuth();
  const [coverLetters, setCoverLetters] = useState<CoverLetterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [linkageCache, setLinkageCache] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (useMockData) {
      setCoverLetters(mockCoverLetters);
      setIsLoading(false);
    } else {
      fetchCoverLetterHistory();
    }
  }, [useMockData]);

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
        .limit(maxItems || 20);

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
    if (useMockData) {
      setCoverLetters(prev => prev.filter(item => item.id !== coverLetter.id));
      toast({
        title: "Cover Letter Deleted",
        description: "The cover letter has been successfully deleted.",
      });
      return;
    }

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

  // Apply maxItems limit if specified
  const limitedCoverLetters = maxItems ? filteredCoverLetters.slice(0, maxItems) : filteredCoverLetters;

  // Pagination logic
  const totalPages = Math.ceil(limitedCoverLetters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCoverLetters = limitedCoverLetters.slice(startIndex, endIndex);

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
        {showTitle && (
          <div className="mb-6">
            <h2 className="text-title font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Cover Letter History
            </h2>
          </div>
        )}
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

  const cardSpacing = compact ? 'space-y-2' : 'space-y-4';
  const headerSpacing = compact ? 'mb-3' : 'mb-6';
  const contentPadding = compact ? 'p-4' : 'p-6';

  return (
    <div className={className}>
      {showTitle && (
        <div className={headerSpacing}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-title font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Cover Letter History
            </h2>
            {showSearch && (
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
                {limitedCoverLetters.length > 0 && showPagination && (
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
            )}
          </div>
        </div>
      )}
      
      <div className={cardSpacing}>
        {paginatedCoverLetters.map((coverLetter) => (
          <Card
            key={coverLetter.id}
            className="hover:shadow-md transition-all duration-200 hover:border-primary/50 hover:bg-muted/50 cursor-pointer border border-border relative"
            onClick={() => handleView(coverLetter)}
          >
            <DocumentTypeBadge 
              type="cover_letter" 
              variant="secondary" 
              size="sm" 
              className="absolute top-2 right-2"
            />
            
            <CardContent className={contentPadding}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-heading font-medium text-foreground">
                      {coverLetter.job_title}
                    </h3>
                    <Badge variant="compact" className="text-tiny">
                      {getTemplateName(coverLetter.template_id)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-caption text-muted-foreground mb-2">
                    <div className="flex items-center space-x-1">
                      <Building className="h-3 w-3" />
                      <span>{coverLetter.company_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Updated {formatDate(coverLetter.updated_at)}</span>
                    </div>
                    {coverLetter.regeneration_count && coverLetter.regeneration_count > 0 && (
                      <div className="text-primary font-medium">
                        Regenerated {coverLetter.regeneration_count} time{coverLetter.regeneration_count > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <LinkageIndicators
                      hasLinkedCoverLetter={false}
                      hasLinkedInterviewPrep={linkageCache[coverLetter.id]?.hasLinkedInterviewPrep || false}
                      onViewInterviewPrep={() => handleViewInterviewPrep(linkageCache[coverLetter.id]?.linkedInterviewPrepId)}
                      compact={true}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-border">
                <div className="flex items-center space-x-2">
                  {linkageCache[coverLetter.id]?.hasLinkedAnalysis && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAnalysis(linkageCache[coverLetter.id].linkedAnalysisId);
                      }}
                      className="text-caption font-medium transition-colors h-8 px-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      View Source Analysis
                    </Button>
                  )}

                  {linkageCache[coverLetter.id]?.hasLinkedInterviewPrep ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewInterviewPrep(linkageCache[coverLetter.id].linkedInterviewPrepId);
                      }}
                      className="text-caption font-medium transition-colors h-8 px-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Interview Notes
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateInterviewPrep(coverLetter);
                      }}
                      className="text-caption font-medium transition-colors h-8 px-3 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Interview Prep
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(coverLetter);
                    }}
                    className="text-caption font-medium transition-colors h-8 px-3 flex items-center space-x-2 text-black hover:text-black"
                  >
                    <Eye className="h-4 w-4 text-black" />
                    <span>View</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(coverLetter);
                    }}
                    className="text-caption font-medium transition-colors h-8 px-3 flex items-center space-x-2 text-black hover:text-black"
                  >
                    <Download className="h-4 w-4 text-black" />
                    <span>Download</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(coverLetter);
                    }}
                    disabled={deletingId === coverLetter.id}
                    className="text-caption font-medium transition-colors h-8 px-3 flex items-center space-x-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showPagination && totalPages > 1 && (
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

export default EnhancedCoverLetterHistory;
