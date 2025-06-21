
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { 
  History, 
  Calendar, 
  Eye, 
  Download, 
  Trash2, 
  MessageSquare,
  Edit,
  Pencil,
  FileText,
  Search
} from 'lucide-react';

// Mock data for demonstration - matches CoverLetterDocumentHistoryItem structure
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

// Individual Cover Letter Item Component - matches CoverLetterDocumentHistoryItem exactly
const CoverLetterHistoryItem: React.FC<{
  coverLetter: CoverLetterItem;
  linkageData: any;
  onView: (coverLetter: CoverLetterItem) => void;
  onDelete: (coverLetter: CoverLetterItem) => void;
  isDeleting: boolean;
}> = ({ coverLetter, linkageData, onView, onDelete, isDeleting }) => {
  const [isEditTitleOpen, setIsEditTitleOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(coverLetter);
  };

  // Calculate version number based on regeneration count
  const versionNumber = (coverLetter.regeneration_count || 0) + 1;
  const totalVersions = versionNumber;
  const isLatestVersion = true;

  return (
    <Card
      className="group hover:shadow-md transition-all duration-200 hover:border-primary/50 hover:bg-muted/50 cursor-pointer border border-border relative border-t-4 border-t-green-500 h-[120px]"
      onClick={() => onView(coverLetter)}
    >
      {/* Green Badge - Top Right */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {/* Version Badge */}
        {totalVersions > 1 && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800">
            <span>v{versionNumber}</span>
          </div>
        )}
        
        {/* Cover Letter Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-green-500 bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800">
          <span>Cover Letter</span>
        </div>
      </div>
      
      <CardContent className="p-4 relative h-full">
        <div className="flex items-start space-x-4 h-full">
          {/* Green Edit Icon - Left */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-950/20 rounded-lg flex items-center justify-center">
              <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Content - Title/Company and Date stacked */}
          <div className="flex-1 min-w-0 pr-20">
            {/* Title and Company with Edit Icon */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-heading font-bold text-foreground truncate">
                {coverLetter.job_title} - {coverLetter.company_name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditTitleOpen(true);
                }}
                className="h-auto p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Pencil className="h-3 w-3 text-gray-500" />
              </Button>
            </div>
            
            {/* Date directly under title */}
            <div className="flex items-center text-caption text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(coverLetter.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Hover Menu - Bottom Right */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center space-x-1">
            {/* Cover Letter Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(coverLetter);
              }}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FileText className="h-4 w-4 text-black dark:text-white" />
            </Button>

            {/* Interview Prep */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Interview prep clicked');
              }}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MessageSquare className="h-4 w-4 text-black dark:text-white" />
            </Button>

            {/* View Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(coverLetter);
              }}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Eye className="h-4 w-4 text-black dark:text-white" />
            </Button>

            {/* Download Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Download clicked');
              }}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Download className="h-4 w-4 text-black dark:text-white" />
            </Button>

            {/* Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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
            Enhanced Cover Letter History
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
            <CoverLetterHistoryItem
              key={coverLetter.id}
              coverLetter={coverLetter}
              linkageData={linkageData}
              onView={handleView}
              onDelete={handleDelete}
              isDeleting={deletingId === coverLetter.id}
            />
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
