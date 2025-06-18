import React, { useState } from 'react';
import { FileText, Calendar, Building, Eye, Edit2, Trash2, Download, MessageSquare, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export interface DocumentAction {
  label: string;
  icon: React.ReactNode;
  onClick: (document: DocumentItem) => void;
  variant?: 'default' | 'destructive' | 'success';
  condition?: (document: DocumentItem) => boolean;
}

interface CategoryDocumentHistoryAProps {
  className?: string;
}

const CategoryDocumentHistoryA: React.FC<CategoryDocumentHistoryAProps> = ({ className }) => {
  const [filterType, setFilterType] = useState<'all' | 'analysis' | 'cover_letter'>('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demo
  const documents: DocumentItem[] = [
    {
      id: '1',
      type: 'analysis',
      title: 'Senior Software Engineer',
      company_name: 'Tech Corp',
      created_at: '2024-01-15T10:30:00Z',
      compatibility_score: 87,
      job_title: 'Senior Software Engineer'
    },
    {
      id: '2',
      type: 'cover_letter',
      title: 'Product Manager Cover Letter',
      company_name: 'Innovation Inc',
      created_at: '2024-01-10T14:20:00Z',
      regeneration_count: 2,
      analysis_result_id: '1'
    }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.job_title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDocumentClick = (document: DocumentItem) => {
    console.log('Document clicked:', document);
  };

  const actions: DocumentAction[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (doc) => console.log('View:', doc)
    },
    {
      label: 'Download',
      icon: <Download className="h-4 w-4 mr-2" />,
      onClick: (doc) => console.log('Download:', doc)
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      onClick: (doc) => console.log('Delete:', doc),
      variant: 'destructive' as const
    }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Enhanced header with better visual hierarchy */}
      <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-title font-bold text-foreground flex items-center gap-2">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                Document History
                <Badge variant="outline" className="text-caption ml-2">
                  Option A – Enhanced Layout
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {filteredDocuments.length} documents • Last updated today
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 px-3 py-1.5 text-caption border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'analysis' | 'cover_letter')}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Documents</SelectItem>
                    <SelectItem value="analysis">CV Analysis</SelectItem>
                    <SelectItem value="cover_letter">Cover Letters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Items per page */}
              <div className="flex items-center gap-2">
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
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced document cards with better organization */}
      <div className="space-y-4">
        {filteredDocuments.map((document) => {
          const getDocumentBadge = () => {
            if (document.type === 'cover_letter') {
              const version = (document.regeneration_count || 0) + 1;
              return (
                <Badge 
                  variant="compact" 
                  className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-600"
                >
                  v{version}
                </Badge>
              );
            }
            return null;
          };

          return (
            <Card 
              key={document.id}
              className={cn(
                "group hover:shadow-lg transition-all duration-300 hover:border-primary/40 cursor-pointer",
                "border border-border relative overflow-hidden"
              )}
              onClick={() => handleDocumentClick(document)}
            >
              {/* Document Type Badge */}
              <Badge variant="subtle" className="absolute top-3 right-3 text-micro">
                {document.type === 'analysis' ? 'cv analysis' : 'cover letter'}
              </Badge>
              
              {/* Progress bar for visual interest */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30"></div>
              
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Main info section */}
                  <div className="md:col-span-2">
                    <div className="flex items-start gap-3 mb-4">
                      {/* Icon based on document type */}
                      <div className={cn(
                        "p-2 rounded-lg flex-shrink-0",
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
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-heading font-semibold text-foreground truncate">
                            {document.title}
                            {document.company_name && ` - ${document.company_name}`}
                          </h3>
                          {getDocumentBadge()}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle edit title logic here
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-4 text-caption text-muted-foreground">
                          {document.type === 'cover_letter' && (
                            <span className="text-muted-foreground">
                              {document.analysis_result_id ? 'Generated from CV analysis' : 'Manual creation'}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(document.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score and actions section */}
                  <div className="flex flex-col justify-between">
                    {/* Score display */}
                    {document.compatibility_score && (
                      <div className="text-center mb-4">
                        <div className="text-title font-bold text-primary">
                          {document.compatibility_score}%
                        </div>
                        <div className="text-micro text-muted-foreground">
                          compatibility
                        </div>
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                      {actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(document);
                          }}
                          className={cn(
                            "text-caption font-medium transition-colors h-8 px-3 flex-1 min-w-fit",
                            action.variant === 'destructive' && "text-destructive hover:text-destructive hover:bg-destructive/10"
                          )}
                        >
                          {action.icon}
                          {action.label}
                        </Button>
                      ))}
                    </div>
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

export default CategoryDocumentHistoryA;