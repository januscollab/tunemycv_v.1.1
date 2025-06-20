import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Calendar, Building, Eye, Download, Trash2, MessageSquare, FileText, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

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

interface EnhancedAnalysisHistoryCProps {
  onSelectAnalysis?: (analysis: AnalysisHistoryItem) => void;
  className?: string;
}

const EnhancedAnalysisHistoryC: React.FC<EnhancedAnalysisHistoryCProps> = ({
  onSelectAnalysis,
  className = ''
}) => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock data for demo
  useEffect(() => {
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
      },
      {
        id: '3',
        analysis_type: 'n8n',
        job_title: 'Frontend Developer',
        company_name: 'Design Studio',
        compatibility_score: 92,
        created_at: '2024-01-08T16:45:00Z',
        executive_summary: 'Excellent design sensibility and modern framework expertise.',
        strengths: ['UI/UX', 'React', 'TypeScript'],
        weaknesses: ['Backend knowledge'],
        recommendations: ['Showcase visual projects']
      },
      {
        id: '4',
        analysis_type: 'ai',
        job_title: 'Data Scientist',
        company_name: 'Analytics Co',
        compatibility_score: 83,
        created_at: '2024-01-05T11:15:00Z',
        executive_summary: 'Strong analytical foundation with machine learning expertise.',
        strengths: ['Python', 'Statistics', 'ML'],
        weaknesses: ['Communication'],
        recommendations: ['Highlight business impact']
      }
    ]);
    setIsLoading(false);
  }, []);

  const handleView = (analysis: AnalysisHistoryItem) => {
    if (onSelectAnalysis) {
      onSelectAnalysis(analysis);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
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

  // Group analyses by date
  const groupedAnalyses = analyses.reduce((groups, analysis) => {
    const date = new Date(analysis.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(analysis);
    return groups;
  }, {} as Record<string, AnalysisHistoryItem[]>);

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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-title font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <History className="h-5 w-5 text-primary" />
              </div>
              Analysis Timeline
            </h2>
            <p className="text-caption text-muted-foreground mt-2">
              {analyses.length} analyses organized chronologically
            </p>
          </div>
          <Badge variant="outline" className="text-caption">
            Option C – Timeline View
          </Badge>
        </div>
      </div>

      {/* Timeline Layout */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/40 to-transparent"></div>

        <div className="space-y-8">
          {Object.entries(groupedAnalyses).map(([date, dateAnalyses], dateIndex) => (
            <div key={date} className="relative">
              {/* Date marker */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative z-10 flex items-center justify-center w-6 h-6 bg-primary rounded-full border-2 border-background shadow-sm">
                  <Calendar className="h-3 w-3 text-primary-foreground" />
                </div>
                <div className="bg-muted/50 rounded-lg px-3 py-1">
                  <span className="text-caption font-medium text-foreground">
                    {formatDate(date)}
                  </span>
                </div>
              </div>

              {/* Analyses for this date */}
              <div className="ml-10 space-y-4">
                {dateAnalyses.map((analysis, index) => (
                  <div
                    key={analysis.id}
                    className={cn(
                      "group relative bg-background border border-border/60 rounded-lg p-4 hover:border-primary/30 hover:shadow-md cursor-pointer transition-all duration-200",
                      "before:absolute before:left-[-42px] before:top-6 before:w-4 before:h-px before:bg-border"
                    )}
                    onClick={() => handleView(analysis)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-subheading font-semibold text-foreground">
                            {analysis.job_title || 'Untitled Position'}
                          </h3>
                          <Badge variant="compact" className="text-tiny">
                            {getAnalysisTypeLabel(analysis.analysis_type)}
                          </Badge>
                        </div>
                        
                        {analysis.company_name && (
                          <div className="flex items-center gap-1 text-caption text-muted-foreground mb-3">
                            <Building className="h-3 w-3" />
                            {analysis.company_name}
                          </div>
                        )}

                        {analysis.executive_summary && (
                          <p className="text-caption text-muted-foreground line-clamp-2 mb-3">
                            {analysis.executive_summary}
                          </p>
                        )}

                        <div className="flex items-center gap-4">
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
                            View Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/cover-letter?tab=generate', {
                                state: { analysisId: analysis.id }
                              });
                            }}
                            className="text-caption h-8 px-3"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Cover Letter
                          </Button>
                        </div>
                      </div>

                      {/* Score circle */}
                      {analysis.compatibility_score && (
                        <div className="flex-shrink-0">
                          <div className={cn(
                            "w-16 h-16 rounded-full border-4 flex items-center justify-center",
                            analysis.compatibility_score >= 80 
                              ? "border-success/30 bg-success/10" 
                              : analysis.compatibility_score >= 60
                              ? "border-warning/30 bg-warning/10"
                              : "border-destructive/30 bg-destructive/10"
                          )}>
                            <div className="text-center">
                              <div className={cn("text-subheading font-bold", getScoreColor(analysis.compatibility_score))}>
                                {analysis.compatibility_score}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hover arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalysisHistoryC;