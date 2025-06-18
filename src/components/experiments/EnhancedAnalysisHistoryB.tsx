import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Calendar, Building, Eye, Download, Trash2, MessageSquare, FileText, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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

interface EnhancedAnalysisHistoryBProps {
  onSelectAnalysis?: (analysis: AnalysisHistoryItem) => void;
  className?: string;
}

const EnhancedAnalysisHistoryB: React.FC<EnhancedAnalysisHistoryBProps> = ({
  onSelectAnalysis,
  className = ''
}) => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
    navigate('/cover-letter?tab=generate', {
      state: {
        analysisId: analysis.id,
        activeTab: 'generate'
      }
    });
  };

  const handleCreateInterviewPrep = (analysis: AnalysisHistoryItem) => {
    navigate('/interview-toolkit?tab=generate-from-analysis', {
      state: {
        analysisId: analysis.id,
        jobTitle: analysis.job_title,
        companyName: analysis.company_name,
        activeTab: 'generate-from-analysis'
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case 'n8n':
        return 'Advanced Analysis';
      case 'ai':
        return 'AI Analysis';
      default:
        return 'Standard Analysis';
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className={className}>
        <div className="text-center py-12">
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-heading font-medium text-foreground mb-2">
            No Analysis History
          </h3>
          <p className="text-muted-foreground">
            Your completed analyses will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Compact header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-title font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Analysis History
        </h2>
        <Badge variant="outline" className="text-caption">
          Option B – Compact List
        </Badge>
      </div>

      {/* Compact list layout */}
      <div className="space-y-3">
        {analyses.map((analysis) => (
          <Card
            key={analysis.id}
            className="group hover:shadow-md transition-all duration-200 hover:border-primary/50 cursor-pointer border-border"
            onClick={() => handleView(analysis)}
          >
            <CardContent className="p-4">
              {/* Main content in single row for compact feel */}
              <div className="flex items-center justify-between">
                {/* Left: Analysis info */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Score circle */}
                  {analysis.compatibility_score && (
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                      <div className="text-center">
                        <div className="text-caption font-bold text-primary">
                          {analysis.compatibility_score}%
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="subtle" className="text-micro">
                        cv analysis
                      </Badge>
                      <Badge variant="compact" className="text-tiny">
                        {getAnalysisTypeLabel(analysis.analysis_type)}
                      </Badge>
                    </div>
                    
                    <h3 className="text-subheading font-medium text-foreground truncate mb-1">
                      {analysis.job_title || 'Untitled Position'}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-caption text-muted-foreground">
                      {analysis.company_name && (
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span className="truncate">{analysis.company_name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(analysis.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Action buttons in horizontal layout */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Primary CTAs */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateCoverLetter(analysis);
                    }}
                    className="text-tiny h-8 px-3 text-success hover:text-success hover:bg-success/10"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Cover Letter
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateInterviewPrep(analysis);
                    }}
                    className="text-tiny h-8 px-3"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Interview
                  </Button>

                  {/* Divider */}
                  <div className="w-px h-6 bg-border mx-1"></div>

                  {/* Secondary actions */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(analysis);
                    }}
                    className="text-tiny h-8 px-2"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(analysis);
                    }}
                    className="text-tiny h-8 px-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(analysis);
                    }}
                    disabled={deletingId === analysis.id}
                    className="text-tiny h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EnhancedAnalysisHistoryB;
