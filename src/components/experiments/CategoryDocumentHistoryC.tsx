import React, { useState } from 'react';
import { FileText, Calendar, MessageSquare, Eye, Download, Trash2, Edit2, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface DocumentItem {
  id: string;
  type: 'analysis' | 'cover_letter';
  title: string;
  company_name?: string;
  created_at: string;
  compatibility_score?: number;
  regeneration_count?: number;
  content?: string;
  job_title?: string;
  analysis_result_id?: string;
  has_cover_letter?: boolean;
  executive_summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
}

interface CategoryDocumentHistoryCProps {
  className?: string;
}

const CategoryDocumentHistoryC: React.FC<CategoryDocumentHistoryCProps> = ({ className }) => {
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');

  // Mock data for demo
  const documents: DocumentItem[] = [
    {
      id: '1',
      type: 'analysis',
      title: 'Senior Software Engineer',
      company_name: 'Tech Corp',
      created_at: '2024-01-15T10:30:00Z',
      compatibility_score: 87,
      job_title: 'Senior Software Engineer',
      executive_summary: 'Strong technical background with excellent problem-solving skills.'
    },
    {
      id: '2',
      type: 'cover_letter',
      title: 'Product Manager Cover Letter',
      company_name: 'Innovation Inc',
      created_at: '2024-01-10T14:20:00Z',
      regeneration_count: 2,
      analysis_result_id: '1',
      content: 'Dear Hiring Manager, I am writing to express my strong interest...'
    },
    {
      id: '3',
      type: 'analysis',
      title: 'Frontend Developer',
      company_name: 'Design Studio',
      created_at: '2024-01-08T16:45:00Z',
      compatibility_score: 92,
      job_title: 'Frontend Developer',
      executive_summary: 'Excellent design sensibility and modern framework expertise.'
    },
    {
      id: '4',
      type: 'cover_letter',
      title: 'Data Scientist Cover Letter',
      company_name: 'Analytics Co',
      created_at: '2024-01-05T11:15:00Z',
      regeneration_count: 1,
      content: 'I am excited to apply for the Data Scientist position...'
    },
    {
      id: '5',
      type: 'analysis',
      title: 'UX Designer',
      company_name: 'Creative Agency',
      created_at: '2024-01-03T14:30:00Z',
      compatibility_score: 78,
      job_title: 'UX Designer',
      executive_summary: 'Creative problem-solving approach with user-centered design focus.'
    },
    {
      id: '6',
      type: 'cover_letter',
      title: 'Marketing Manager Cover Letter',
      company_name: 'Brand Co',
      created_at: '2024-01-01T09:45:00Z',
      regeneration_count: 3,
      content: 'With my extensive background in digital marketing...'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDocumentClick = (document: DocumentItem) => {
    console.log('Document clicked:', document);
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with view toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-title font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Grid3X3 className="h-5 w-5 text-primary" />
              </div>
              Document Gallery
            </h2>
            <p className="text-caption text-muted-foreground mt-2">
              {documents.length} documents in visual grid layout
            </p>
          </div>
          <Badge variant="outline" className="text-caption">
            Option C – Grid Gallery
          </Badge>
        </div>
      </div>

      {/* Grid Gallery Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => {
          const getDocumentPreview = () => {
            if (document.type === 'analysis' && document.executive_summary) {
              return document.executive_summary;
            }
            if (document.type === 'cover_letter' && document.content) {
              return document.content;
            }
            return 'No preview available';
          };

          return (
            <Card 
              key={document.id}
              className={cn(
                "group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/60 overflow-hidden",
                "hover:border-primary/30 hover:scale-[1.02]"
              )}
              onClick={() => handleDocumentClick(document)}
            >
              {/* Document type header */}
              <div className={cn(
                "h-2",
                document.type === 'analysis' 
                  ? "bg-gradient-to-r from-blue-400 to-blue-600" 
                  : "bg-gradient-to-r from-green-400 to-green-600"
              )} />
              
              <CardContent className="p-4">
                {/* Header with icon and type */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-2 rounded-lg",
                      document.type === 'analysis' 
                        ? "bg-blue-100 dark:bg-blue-900/20" 
                        : "bg-green-100 dark:bg-green-900/20"
                    )}>
                      {document.type === 'analysis' ? (
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    {document.type === 'cover_letter' && (
                      <Badge variant="compact" className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-600">
                        v{(document.regeneration_count || 0) + 1}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Score badge */}
                  {document.compatibility_score && (
                    <Badge variant="outline" className={cn("text-micro", getScoreColor(document.compatibility_score))}>
                      {document.compatibility_score}%
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-subheading font-semibold text-foreground mb-2 line-clamp-2">
                  {document.title}
                </h3>

                {/* Company and date */}
                <div className="flex items-center gap-2 text-caption text-muted-foreground mb-3">
                  {document.company_name}
                  <span>•</span>
                  <Calendar className="h-3 w-3" />
                  {formatDate(document.created_at)}
                </div>

                {/* Content preview */}
                <div className="bg-muted/30 rounded-md p-3 mb-4 min-h-[80px]">
                  <p className="text-caption text-muted-foreground line-clamp-4">
                    {getDocumentPreview()}
                  </p>
                </div>

                {/* Actions footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('View:', document);
                    }}
                    className="text-caption h-8 px-3 opacity-60 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Download:', document);
                      }}
                      className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Edit:', document);
                      }}
                      className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryDocumentHistoryC;