import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Calendar, Building, Eye, Download, Trash2, MessageSquare, FileText, TrendingUp } from 'lucide-react';
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

interface EnhancedAnalysisHistoryAProps {
  onSelectAnalysis?: (analysis: AnalysisHistoryItem) => void;
  className?: string;
}

const EnhancedAnalysisHistoryA: React.FC<EnhancedAnalysisHistoryAProps> = ({
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

  useEffect(() => {
    // Mock data for demo
    setAnalyses([
      {
        id: '1',
        analysis_type: 'n8n',
        job_title: 'Senior Software Engineer',
        company_name: 'Tech Corp',
        compatibility_score: 87,
        created_at: '2024-01-15T10:30:00Z',
        executive_summary: 'Strong technical background with excellent problem-solving skills.',
        strengths: ['JavaScript', 'React', 'Node.js'],
        weaknesses: ['Project management', 'Leadership'],
        recommendations: ['Consider leadership training', 'Highlight team collaboration']
      },
      {
        id: '2',
        analysis_type: 'ai',
        job_title: 'Product Manager',
        company_name: 'Innovation Inc',
        compatibility_score: 75,
        created_at: '2024-01-10T14:20:00Z',
        executive_summary: 'Good strategic thinking with room for technical depth.',
        strengths: ['Strategy', 'Communication'],
        weaknesses: ['Technical skills'],
        recommendations: ['Emphasize business impact']
      }
    ]);
    setIsLoading(false);
  }, []);

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
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
      {/* Clean header with stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-title font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <History className="h-5 w-5 text-primary" />
              </div>
              Analysis History
            </h2>
            <p className="text-caption text-muted-foreground mt-2">
              {analyses.length} analyses • Average score: {Math.round(analyses.reduce((acc, a) => acc + (a.compatibility_score || 0), 0) / analyses.length)}%
            </p>
          </div>
          <Badge variant="outline" className="text-caption">
            Option A – Organized Cards
          </Badge>
        </div>
      </div>

      {/* Grid layout for better organization */}
      <div className="grid gap-6 md:grid-cols-2">
        {analyses.map((analysis) => (
          <Card
            key={analysis.id}
            className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 cursor-pointer border-border/60 overflow-hidden"
            onClick={() => handleView(analysis)}
          >
            {/* Header with score prominently displayed */}
            <CardHeader className="pb-4 bg-gradient-to-r from-muted/30 to-muted/10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge variant="subtle" className="text-micro mb-2">
                    cv analysis
                  </Badge>
                  <h3 className="text-heading font-semibold text-foreground leading-tight mb-1">
                    {analysis.job_title || 'Untitled Position'}
                  </h3>
                  {analysis.company_name && (
                    <div className="flex items-center gap-1 text-caption text-muted-foreground">
                      <Building className="h-3 w-3" />
                      {analysis.company_name}
                    </div>
                  )}
                </div>
                
                {/* Score badge */}
                {analysis.compatibility_score && (
                  <div className="text-center">
                    <div className={`text-title font-bold ${getScoreColor(analysis.compatibility_score)}`}>
                      {analysis.compatibility_score}%
                    </div>
                    <div className="text-micro text-muted-foreground">match</div>
                  </div>
                )}
              </div>
              
              {/* Analysis type and date */}
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <Badge variant="compact" className="text-tiny">
                  {getAnalysisTypeLabel(analysis.analysis_type)}
                </Badge>
                <div className="flex items-center gap-1 text-micro text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(analysis.created_at)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4">
              {/* Quick insights */}
              {analysis.executive_summary && (
                <p className="text-caption text-muted-foreground mb-4 line-clamp-2">
                  {analysis.executive_summary}
                </p>
              )}
              
              {/* Action buttons - cleaner spacing */}
              <div className="space-y-3">
                {/* Primary actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateCoverLetter(analysis);
                    }}
                    className="flex-1 text-caption h-9"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Cover Letter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateInterviewPrep(analysis);
                    }}
                    className="flex-1 text-caption h-9"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Interview Prep
                  </Button>
                </div>
                
                {/* Secondary actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(analysis);
                    }}
                    className="text-caption h-8 px-3"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(analysis);
                      }}
                      className="text-caption h-8 px-3"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(analysis);
                      }}
                      disabled={deletingId === analysis.id}
                      className="text-caption h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EnhancedAnalysisHistoryA;
