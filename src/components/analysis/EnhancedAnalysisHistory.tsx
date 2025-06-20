
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
import { History, FileText, Calendar, Building, Eye, Download, Trash2, MessageSquare, Plus, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAnalysisLinkage } from '@/utils/documentLinkage';
import LinkageIndicators from '@/components/analysis/LinkageIndicators';

interface AnalysisHistoryItem {
  id: string;
  analysis_type: string;
  job_title?: string;
  company_name?: string;
  compatibility_score?: number;
  created_at: string;
  pdf_file_data?: string;
  html_file_data?: string;
  n8n_pdf_url?: string;
  n8n_html_url?: string;
  executive_summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
}

interface EnhancedAnalysisHistoryProps {
  onSelectAnalysis?: (analysis: AnalysisHistoryItem) => void;
  className?: string;
}

const EnhancedAnalysisHistory: React.FC<EnhancedAnalysisHistoryProps> = ({
  onSelectAnalysis,
  className = ''
}) => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [linkageCache, setLinkageCache] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalysisHistory();
  }, []);

  const fetchAnalysisHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('analysis_results')
        .select(`
          id,
          analysis_type,
          job_title,
          company_name,
          compatibility_score,
          created_at,
          pdf_file_data,
          html_file_data,
          n8n_pdf_url,
          n8n_html_url,
          executive_summary,
          strengths,
          weaknesses,
          recommendations
        `)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching analysis history:', error);
        toast({
          title: "Error Loading History",
          description: "Failed to load your analysis history.",
          variant: "destructive"
        });
      } else {
        setAnalyses(data || []);
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

  const handleView = (analysis: AnalysisHistoryItem) => {
    if (onSelectAnalysis) {
      onSelectAnalysis(analysis);
    }
  };

  const handleDownload = async (analysis: AnalysisHistoryItem) => {
    try {
      // Priority: PDF file data > n8n PDF URL > HTML data > text fallback
      if (analysis.pdf_file_data) {
        // Download stored PDF data
        const binaryString = atob(analysis.pdf_file_data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `CV_Analysis_${analysis.job_title || 'Report'}_${new Date(analysis.created_at).toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }

      if (analysis.n8n_pdf_url) {
        // Download from n8n URL
        window.open(analysis.n8n_pdf_url, '_blank');
        return;
      }

      if (analysis.html_file_data) {
        // Download HTML content
        const blob = new Blob([analysis.html_file_data], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `CV_Analysis_${analysis.job_title || 'Report'}_${new Date(analysis.created_at).toISOString().split('T')[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }

      // Fallback to text format
      const textContent = `CV ANALYSIS REPORT
==================

Job Title: ${analysis.job_title || 'Untitled Position'}
Company: ${analysis.company_name || 'Company not specified'}
Compatibility Score: ${analysis.compatibility_score}%
Date: ${new Date(analysis.created_at).toLocaleDateString()}
Analysis Type: ${analysis.analysis_type || 'Standard'}

EXECUTIVE SUMMARY
================
${analysis.executive_summary || 'No executive summary available'}

STRENGTHS
=========
${analysis.strengths?.map((strength, index) => `${index + 1}. ${strength}`).join('\n') || 'No strengths listed'}

AREAS FOR IMPROVEMENT
====================
${analysis.weaknesses?.map((weakness, index) => `${index + 1}. ${weakness}`).join('\n') || 'No weaknesses listed'}

RECOMMENDATIONS
===============
${analysis.recommendations?.map((rec, index) => `${index + 1}. ${rec}`).join('\n') || 'No recommendations available'}

---
Generated by TuneMyCV - Your AI-Powered Career Assistant`;

      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_Analysis_${analysis.job_title || 'Report'}_${new Date(analysis.created_at).toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the analysis report.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (analysis: AnalysisHistoryItem) => {
    if (!window.confirm(`Are you sure you want to delete this analysis? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(analysis.id);

    try {
      const { error } = await supabase
        .from('analysis_results')
        .delete()
        .eq('id', analysis.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setAnalyses(prev => prev.filter(item => item.id !== analysis.id));
      toast({
        title: "Analysis Deleted",
        description: "The analysis has been successfully deleted.",
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerateCoverLetter = (analysis: AnalysisHistoryItem) => {
    navigate('/cover-letter', {
      state: {
        fromAnalysis: true,
        analysisData: analysis
      }
    });
  };

  const handleViewCoverLetter = (coverLetterId: string) => {
    navigate(`/cover-letter?id=${coverLetterId}`);
  };

  const handleCreateInterviewPrep = (analysis: AnalysisHistoryItem) => {
    navigate('/interview-toolkit', {
      state: {
        fromAnalysis: true,
        analysisData: analysis
      }
    });
  };

  const handleViewInterviewPrep = (interviewPrepId: string) => {
    navigate(`/interview-toolkit?id=${interviewPrepId}`);
  };

  // Load linkage data for analyses
  useEffect(() => {
    if (analyses.length > 0) {
      const loadLinkages = async () => {
        const linkages: Record<string, any> = {};
        for (const analysis of analyses) {
          const linkage = await getAnalysisLinkage(analysis.id);
          linkages[analysis.id] = linkage;
        }
        setLinkageCache(linkages);
      };
      loadLinkages();
    }
  }, [analyses]);

  // Filter and search logic
  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = searchQuery === '' || 
      (analysis.job_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (analysis.company_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAnalyses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAnalyses = filteredAnalyses.slice(startIndex, endIndex);

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

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case 'n8n':
        return 'Advanced Analysis';
      case 'ai':
        return 'AI Analysis';
      default:
        return 'Analysis';
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-title font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Analysis History
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-4">
            <History className="h-8 w-8 animate-pulse mx-auto text-primary" />
            <p className="text-muted-foreground">Loading your analysis history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h2 className="text-title font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Analysis History
          </h2>
        </div>
        <div className="text-center py-8">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Analysis History
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your completed analyses will appear here.
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
            Analysis History
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search analyses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            {filteredAnalyses.length > 0 && (
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
        {paginatedAnalyses.map((analysis) => (
          <Card
            key={analysis.id}
            className="hover:shadow-md transition-all duration-200 hover:border-primary/50 hover:bg-muted/50 cursor-pointer border border-border relative"
            onClick={() => handleView(analysis)}
          >
            {/* Document Type Badge */}
            <Badge variant="subtle" className="absolute top-2 right-2 text-micro">
              cv analysis
            </Badge>
            
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-heading font-medium text-foreground">
                      {analysis.job_title || 'Untitled Position'}
                    </h3>
                    <Badge variant="compact" className="text-tiny">
                      {getAnalysisTypeLabel(analysis.analysis_type)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-caption text-muted-foreground mb-2">
                    {analysis.company_name && (
                      <div className="flex items-center space-x-1">
                        <Building className="h-3 w-3" />
                        <span>{analysis.company_name}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Updated {formatDate(analysis.created_at)}</span>
                    </div>
                    {analysis.compatibility_score && (
                      <div className="text-primary font-medium">
                        Score: {analysis.compatibility_score}%
                      </div>
                    )}
                  </div>
                  
                  {/* Linkage Indicators */}
                  <div className="mt-2">
                    <LinkageIndicators
                      hasLinkedCoverLetter={linkageCache[analysis.id]?.hasLinkedCoverLetter || false}
                      hasLinkedInterviewPrep={linkageCache[analysis.id]?.hasLinkedInterviewPrep || false}
                      onViewCoverLetter={() => handleViewCoverLetter(linkageCache[analysis.id]?.linkedCoverLetterId)}
                      onViewInterviewPrep={() => handleViewInterviewPrep(linkageCache[analysis.id]?.linkedInterviewPrepId)}
                      compact={true}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons row at bottom - reduced spacing by 50% and matching cover letter design */}
              <div className="flex items-center justify-between pt-1.5 border-t border-border">
                {/* Dynamic CTAs on the left */}
                <div className="flex items-center space-x-2">
                  {/* Dynamic CTA Logic for Cover Letter */}
                  {linkageCache[analysis.id]?.hasLinkedCoverLetter ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewCoverLetter(linkageCache[analysis.id].linkedCoverLetterId);
                      }}
                      className="text-caption font-medium transition-colors h-8 px-3 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Cover Letter
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateCoverLetter(analysis);
                      }}
                      className="text-caption font-medium transition-colors h-8 px-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Cover Letter
                    </Button>
                  )}

                  {/* Dynamic CTA Logic for Interview Prep */}
                  {linkageCache[analysis.id]?.hasLinkedInterviewPrep ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewInterviewPrep(linkageCache[analysis.id].linkedInterviewPrepId);
                      }}
                      className="text-caption font-medium transition-colors h-8 px-3 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
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
                        handleCreateInterviewPrep(analysis);
                      }}
                      className="text-caption font-medium transition-colors h-8 px-3 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Interview Prep
                    </Button>
                  )}
                </div>

                {/* Action icons on the right - matching cover letter spacing */}
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(analysis);
                    }}
                    className="text-caption font-medium transition-colors h-8 px-3 flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(analysis);
                    }}
                    className="text-caption font-medium transition-colors h-8 px-3 flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(analysis);
                    }}
                    disabled={deletingId === analysis.id}
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

export default EnhancedAnalysisHistory;
