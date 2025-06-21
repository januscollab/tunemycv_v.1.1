import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, FileText, Calendar, User, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalysisHistoryItem {
  id: string;
  analysis_type: string;
  job_title?: string;
  company_name?: string;
  compatibility_score?: number;
  created_at: string;
  pdf_file_data?: string;
  html_file_data?: string;
}

interface AnalysisHistoryProps {
  onSelectAnalysis?: (analysis: AnalysisHistoryItem) => void;
  className?: string;
}

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({
  onSelectAnalysis,
  className = ''
}) => {
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
          html_file_data
        `)
        .eq('user_id', user.id)
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

  const handleSelectAnalysis = (analysis: AnalysisHistoryItem) => {
    if (onSelectAnalysis) {
      onSelectAnalysis(analysis);
    }
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
        <h2 className="text-title font-bold flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Analysis History
        </h2>
      </div>
      <div className="space-y-4">
        {analyses.map((analysis) => (
          <div
            key={analysis.id}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => handleSelectAnalysis(analysis)}
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
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
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
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAnalysis(analysis);
                }}
              >
                View Report
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {analysis.pdf_file_data && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  PDF Available
                </span>
              )}
              {analysis.html_file_data && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  HTML Available
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisHistory;
