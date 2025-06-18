
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, FileText, Calendar, Building, Eye, Download, Trash2, MessageSquare } from 'lucide-react';
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
    if (!window.confirm(`Are you sure you want to delete the analysis for "${analysis.job_title || 'Untitled Position'}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(analysis.id);

    try {
      const { error } = await supabase
        .from('analysis_results')
        .update({ deleted_at: new Date().toISOString() })
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
        analysisId: analysis.id,
        activeTab: 'generate'
      }
    });
  };

  const handleCreateInterviewPrep = (analysis: AnalysisHistoryItem) => {
    navigate('/interview-prep', {
      state: {
        analysisId: analysis.id,
        jobTitle: analysis.job_title,
        companyName: analysis.company_name
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

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-500/10 text-gray-600';
    if (score >= 80) return 'bg-green-500/10 text-green-600';
    if (score >= 60) return 'bg-yellow-500/10 text-yellow-600';
    return 'bg-red-500/10 text-red-600';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-4">
            <History className="h-8 w-8 animate-pulse mx-auto text-primary" />
            <p className="text-muted-foreground">Loading your analysis history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Analysis History
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your completed analyses will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Analysis History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analyses.map((analysis) => (
          <div
            key={analysis.id}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">
                    {analysis.job_title || 'Unknown Position'}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {getAnalysisTypeLabel(analysis.analysis_type)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground mb-3">
                  {analysis.company_name && (
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      <span>{analysis.company_name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(analysis.created_at)}</span>
                  </div>
                  
                  {analysis.compatibility_score && (
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getScoreColor(analysis.compatibility_score)}`}
                      >
                        {analysis.compatibility_score}% Match
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between">
                  {/* CTAs on the left */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateCoverLetter(analysis)}
                      className="text-xs h-8"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Generate Cover Letter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateInterviewPrep(analysis)}
                      className="text-xs h-8"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Create Interview Prep
                    </Button>
                  </div>

                  {/* Action icons on the right */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(analysis)}
                      className="text-xs h-8 px-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(analysis)}
                      className="text-xs h-8 px-2"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(analysis)}
                      disabled={deletingId === analysis.id}
                      className="text-xs h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default EnhancedAnalysisHistory;
