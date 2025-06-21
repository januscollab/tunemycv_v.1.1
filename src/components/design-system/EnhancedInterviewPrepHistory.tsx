
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

// Mock data for demonstration - matches InterviewPrepDocumentHistoryItem structure
const mockInterviewPreps = [
  {
    id: '1',
    job_title: 'Senior Frontend Developer',
    company_name: 'TechCorp Inc.',
    content: 'Q: Tell me about your experience with React...',
    template_id: 'technical',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    generation_parameters: {},
    regeneration_count: 2,
    analysis_result_id: 'analysis-1',
    linked_cover_letter_id: 'cover-1'
  },
  {
    id: '2',
    job_title: 'Product Manager',
    company_name: 'Innovation Labs',
    content: 'Q: How do you prioritize product features...',
    template_id: 'behavioral',
    created_at: '2024-01-10T14:20:00Z',
    updated_at: '2024-01-10T14:20:00Z',
    generation_parameters: {},
    regeneration_count: 0,
    analysis_result_id: null,
    linked_cover_letter_id: null
  },
  {
    id: '3',
    job_title: 'Data Scientist',
    company_name: 'Analytics Pro',
    content: 'Q: Explain your approach to machine learning...',
    template_id: 'technical',
    created_at: '2024-01-05T09:15:00Z',
    updated_at: '2024-01-05T09:15:00Z',
    generation_parameters: {},
    regeneration_count: 1,
    analysis_result_id: 'analysis-2',
    linked_cover_letter_id: null
  }
];

interface InterviewPrepItem {
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
  linked_cover_letter_id?: string;
}

interface EnhancedInterviewPrepHistoryProps {
  onSelectInterviewPrep?: (interviewPrep: InterviewPrepItem) => void;
  className?: string;
}

// Individual Interview Prep Item Component
const InterviewPrepHistoryItem: React.FC<{
  interviewPrep: InterviewPrepItem;
  linkageData: any;
  onView: (interviewPrep: InterviewPrepItem) => void;
  onDelete: (interviewPrep: InterviewPrepItem) => void;
  isDeleting: boolean;
}> = ({ interviewPrep, linkageData, onView, onDelete, isDeleting }) => {
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
    onDelete(interviewPrep);
  };

  // Calculate version number based on regeneration count
  const versionNumber = (interviewPrep.regeneration_count || 0) + 1;
  const totalVersions = versionNumber;
  const isLatestVersion = true;

  return (
    <Card
      className="group hover:shadow-md transition-all duration-200 hover:bg-muted/50 cursor-pointer border border-border relative border-t-4 border-t-blue-500 h-[120px]"
      onClick={() => onView(interviewPrep)}
    >
      {/* Blue Badge - Top Right */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {/* Version Badge */}
        {totalVersions > 1 && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800">
            <span>v{versionNumber}</span>
          </div>
        )}
        
        {/* Interview Prep Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-800">
          <span>Interview Prep</span>
        </div>
      </div>
      
      <CardContent className="p-4 relative h-full">
        <div className="flex items-start space-x-4 h-full">
          {/* Blue Chat Icon - Left */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Content - Title/Company and Date stacked */}
          <div className="flex-1 min-w-0 pr-20">
            {/* Title and Company with Edit Icon */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-heading font-bold text-foreground truncate">
                {interviewPrep.job_title} - {interviewPrep.company_name}
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
              <span>{formatDate(interviewPrep.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Hover Menu - Bottom Right */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center space-x-1">
            {/* Interview Prep Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(interviewPrep);
              }}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MessageSquare className="h-4 w-4 text-black dark:text-white" />
            </Button>

            {/* Cover Letter */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Cover letter clicked');
              }}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FileText className="h-4 w-4 text-black dark:text-white" />
            </Button>

            {/* View Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(interviewPrep);
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

const EnhancedInterviewPrepHistory: React.FC<EnhancedInterviewPrepHistoryProps> = ({
  onSelectInterviewPrep,
  className = ''
}) => {
  const [interviewPreps, setInterviewPreps] = useState<InterviewPrepItem[]>(mockInterviewPreps);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [linkageCache, setLinkageCache] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mock linkage data
  useEffect(() => {
    const linkages: Record<string, any> = {};
    interviewPreps.forEach(interviewPrep => {
      linkages[interviewPrep.id] = {
        hasLinkedAnalysis: !!interviewPrep.analysis_result_id,
        hasLinkedCoverLetter: !!interviewPrep.linked_cover_letter_id,
        linkedAnalysisId: interviewPrep.analysis_result_id,
        linkedCoverLetterId: interviewPrep.linked_cover_letter_id
      };
    });
    setLinkageCache(linkages);
  }, [interviewPreps]);

  const handleView = (interviewPrep: InterviewPrepItem) => {
    console.log('Viewing interview prep:', interviewPrep.id);
    if (onSelectInterviewPrep) {
      onSelectInterviewPrep(interviewPrep);
    }
  };

  const handleDelete = (interviewPrep: InterviewPrepItem) => {
    if (!window.confirm(`Are you sure you want to delete this interview prep? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(interviewPrep.id);
    
    // Mock delete with timeout
    setTimeout(() => {
      setInterviewPreps(prev => prev.filter(item => item.id !== interviewPrep.id));
      setDeletingId(null);
      console.log('Interview prep deleted:', interviewPrep.id);
    }, 1000);
  };

  // Filter and search logic
  const filteredInterviewPreps = interviewPreps.filter(interviewPrep => {
    const matchesSearch = searchQuery === '' || 
      (interviewPrep.job_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (interviewPrep.company_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredInterviewPreps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInterviewPreps = filteredInterviewPreps.slice(startIndex, endIndex);

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
            <p className="text-muted-foreground">Loading your interview prep history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (interviewPreps.length === 0) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-title font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Enhanced Interview Prep History
          </h2>
        </div>
        <div className="text-center py-8">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Interview Preps
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your generated interview preps will appear here.
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
            Enhanced Interview Prep History
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search interview preps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            {filteredInterviewPreps.length > 0 && (
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
        {paginatedInterviewPreps.map((interviewPrep) => {
          const linkageData = linkageCache[interviewPrep.id] || {};
          return (
            <InterviewPrepHistoryItem
              key={interviewPrep.id}
              interviewPrep={interviewPrep}
              linkageData={linkageData}
              onView={handleView}
              onDelete={handleDelete}
              isDeleting={deletingId === interviewPrep.id}
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

export default EnhancedInterviewPrepHistory;
