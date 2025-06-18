import React, { useState } from 'react';
import { FileText, Calendar, Building, Eye, Edit2, Trash2, Download, MessageSquare, Grid3X3, List, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

interface CategoryDocumentHistoryBProps {
  className?: string;
}

const CategoryDocumentHistoryB: React.FC<CategoryDocumentHistoryBProps> = ({ className }) => {
  const [filterType, setFilterType] = useState<'all' | 'analysis' | 'cover_letter'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
    },
    {
      id: '3',
      type: 'analysis',
      title: 'UX Designer',
      company_name: 'Design Studio',
      created_at: '2024-01-08T09:15:00Z',
      compatibility_score: 92,
      job_title: 'UX Designer'
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
      icon: <Eye className="h-3 w-3" />,
      onClick: (doc) => console.log('View:', doc)
    },
    {
      label: 'Download',
      icon: <Download className="h-3 w-3" />,
      onClick: (doc) => console.log('Download:', doc)
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-3 w-3" />,
      onClick: (doc) => console.log('Delete:', doc),
      variant: 'destructive' as const
    }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Minimal header with view switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-title font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Document History
            <Badge variant="outline" className="text-caption ml-2">
              Option B – Grid/List Toggle
            </Badge>
          </h2>
          <p className="text-caption text-muted-foreground mt-1">
            {filteredDocuments.length} documents
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
              className="w-40 px-3 py-1.5 text-caption border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* View mode toggle */}
          <div className="flex items-center border border-border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-7 px-2"
            >
              <Grid3X3 className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-7 px-2"
            >
              <List className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Filter */}
          <Select value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'analysis' | 'cover_letter')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="analysis">Analysis</SelectItem>
              <SelectItem value="cover_letter">Letters</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dynamic layout based on view mode */}
      <div className={cn(
        viewMode === 'grid' 
          ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" 
          : "space-y-2"
      )}>
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

          if (viewMode === 'grid') {
            return (
              <Card 
                key={document.id}
                className="group hover:shadow-md transition-all duration-200 hover:border-primary/50 cursor-pointer border border-border relative"
                onClick={() => handleDocumentClick(document)}
              >
                {/* Document Type Badge */}
                <Badge variant="subtle" className="absolute top-2 right-2 text-micro">
                  {document.type === 'analysis' ? 'cv analysis' : 'cover letter'}
                </Badge>
                
                <CardContent className="p-4">
                  {/* Score indicator */}
                  {document.compatibility_score && (
                    <div className="text-center mb-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                        <span className="text-caption font-bold text-primary">
                          {document.compatibility_score}%
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h3 className="text-subheading font-medium text-foreground truncate">
                        {document.title}
                      </h3>
                      {getDocumentBadge()}
                    </div>
                    
                    {document.company_name && (
                      <div className="flex items-center justify-center gap-1 text-caption text-muted-foreground mb-2">
                        <Building className="h-3 w-3" />
                        <span className="truncate">{document.company_name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center gap-1 text-micro text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(document.created_at)}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-1 justify-center">
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
                          "h-8 px-2",
                          action.variant === 'destructive' && "text-destructive hover:text-destructive hover:bg-destructive/10"
                        )}
                      >
                        {action.icon}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          } else {
            // List view
            return (
              <Card 
                key={document.id}
                className="group hover:shadow-sm transition-all duration-200 hover:border-primary/30 cursor-pointer border border-border/60"
                onClick={() => handleDocumentClick(document)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Type indicator */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      document.type === 'analysis' 
                        ? "bg-blue-100 dark:bg-blue-900/20" 
                        : "bg-green-100 dark:bg-green-900/20"
                    )}>
                      {document.type === 'analysis' ? (
                        <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <MessageSquare className="h-3 w-3 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-subheading font-medium text-foreground truncate">
                          {document.title}
                        </h3>
                        {getDocumentBadge()}
                        <Badge variant="subtle" className="text-micro">
                          {document.type === 'analysis' ? 'cv analysis' : 'cover letter'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-caption text-muted-foreground">
                        {document.company_name && (
                          <span className="truncate">{document.company_name}</span>
                        )}
                        <span>{formatDate(document.created_at)}</span>
                        {document.compatibility_score && (
                          <span className="text-primary font-medium">
                            {document.compatibility_score}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
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
                            "h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity",
                            action.variant === 'destructive' && "text-destructive hover:text-destructive hover:bg-destructive/10"
                          )}
                        >
                          {action.icon}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }
        })}
      </div>
    </div>
  );
};

export default CategoryDocumentHistoryB;