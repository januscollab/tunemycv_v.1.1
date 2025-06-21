
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

// Mock data for demonstration
const mockCoverLetters = [
  {
    id: '1',
    job_title: 'Senior Frontend Developer',
    company_name: 'TechCorp Inc.',
    content: 'Dear Hiring Manager, I am writing to express my interest...',
    template_id: 'professional',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    generation_parameters: {},
    regeneration_count: 2,
    analysis_result_id: 'analysis-1',
    linked_interview_prep_id: 'prep-1'
  },
  {
    id: '2',
    job_title: 'Product Manager',
    company_name: 'Innovation Labs',
    content: 'Dear Hiring Team, With great enthusiasm...',
    template_id: 'creative',
    created_at: '2024-01-10T14:20:00Z',
    updated_at: '2024-01-10T14:20:00Z',
    generation_parameters: {},
    regeneration_count: 0,
    analysis_result_id: null,
    linked_interview_prep_id: null
  },
  {
    id: '3',
    job_title: 'Data Scientist',
    company_name: 'Analytics Pro',
    content: 'Dear Data Team, I am excited to apply...',
    template_id: 'technical',
    created_at: '2024-01-05T09:15:00Z',
    updated_at: '2024-01-05T09:15:00Z',
    generation_parameters: {},
    regeneration_count: 1,
    analysis_result_id: 'analysis-2',
    linked_interview_prep_id: null
  }
];

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
  onSelectCoverLetter?: (coverLetter: CoverLetterItem) => void;
  className?: string;
}

const EnhancedCoverLetterHistory: React.FC<EnhancedCoverLetterHistoryProps> = ({
  onSelectCoverLetter,
  className = ''
}) => {
  const [coverLetters, setCoverLetters] = useState<CoverLetterItem[]>(mockCoverLetters);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [linkageCache, setLinkageCache] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mock linkage data
  useEffect(() => {
    const linkages: Record<string, any> = {};
    coverLetters.forEach(coverLetter => {
      linkages[coverLetter.id] = {
        hasLinkedAnalysis: !!coverLetter.analysis_result_id,
        hasLinkedInterviewPrep: !!coverLetter.linked_interview_prep_id,
        linkedAnalysisId: coverLetter.analysis_result_id,
        linkedInterviewPrepId: coverLetter.linked_interview_prep_id
      };
    });
    setLinkageCache(linkages);
  }, [coverLetters]);

  const handleView = (coverLetter: CoverLetterItem) => {
    console.log('Viewing cover letter:', coverLetter.id);
    if (onSelectCoverLetter) {
      onSelectCoverLetter(coverLetter);
    }
  };

  const handleDownload = (coverLetter: CoverLetterItem) => {
    console.log('Downloading cover letter:', coverLetter.id);
    // Mock download functionality
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
  };

  const handleDelete = (coverLetter: CoverLetterItem) => {
    if (!window.confirm(`Are you sure you want to delete this cover letter? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(coverLetter.id);
    
    // Mock delete with timeout
    setTimeout(() => {
      setCoverLetters(prev => prev.filter(item => item.id !== coverLetter.id));
      setDeletingId(null);
      console.log('Cover letter deleted:', coverLetter.id);
    }, 1000);
  };

  const handleViewAnalysis = (analysisId: string) => {
    console.log('Viewing analysis:', analysisId);
  };

  const handleViewInterviewPrep = (interviewPrepId: string) => {
    console.log('Viewing interview prep:', interviewPrepId);
  };

  const handleCreateInterviewPrep = (coverLetter: CoverLetterItem) => {
    console.log('Creating interview prep for:', coverLetter.id);
  };

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
          <h2 className="text-title font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Cover Letter History
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
          <h2 className="text-title font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Enhanced Cover Letter History
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
        {paginatedCoverLetters.map((coverLetter) => {
          const linkageData = linkageCache[coverLetter.id] || {};
          return (
            <Card key={coverLetter.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {coverLetter.job_title} - {coverLetter.company_name}
                      </h3>
                      <Badge variant="secondary">
                        {getTemplateName(coverLetter.template_id)}
                      </Badge>
                      {(coverLetter.regeneration_count || 0) > 0 && (
                        <Badge variant="outline">
                          v{(coverLetter.regeneration_count || 0) + 1}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(coverLetter.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {linkageData.hasLinkedAnalysis && (
                        <Badge variant="secondary" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          Linked Analysis
                        </Badge>
                      )}
                      {linkageData.hasLinkedInterviewPrep && (
                        <Badge variant="secondary" className="text-xs">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Interview Prep
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(coverLetter)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {linkageData.hasLinkedAnalysis ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAnalysis(linkageData.linkedAnalysisId)}
                      >
                        <Target className="h-4 w-4" />
                      </Button>
                    ) : null}

                    {linkageData.hasLinkedInterviewPrep ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewInterviewPrep(linkageData.linkedInterviewPrepId)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCreateInterviewPrep(coverLetter)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(coverLetter)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(coverLetter)}
                      disabled={deletingId === coverLetter.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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

export default EnhancedCoverLetterHistory;
