import React from 'react';
import { FileText, Calendar, Building, Eye, Edit2, Trash2, Download, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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

interface DocumentHistoryHeaderProps {
  title: string;
  totalCount: number;
  filterType: 'all' | 'analysis' | 'cover_letter';
  onFilterChange: (filter: 'all' | 'analysis' | 'cover_letter') => void;
  itemsPerPage: number;
  onItemsPerPageChange: (count: number) => void;
  showPagination?: boolean;
}

interface DocumentHistoryListProps {
  documents: DocumentItem[];
  loading?: boolean;
  onDocumentClick?: (document: DocumentItem) => void;
  onEditTitle?: (documentId: string, newTitle: string, type: 'analysis' | 'cover_letter') => void;
  actions?: DocumentAction[] | ((document: DocumentItem) => DocumentAction[]);
  emptyState?: {
    title: string;
    description: string;
    icon?: React.ReactNode;
  };
}

interface DocumentHistoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface DocumentHistoryProps extends DocumentHistoryListProps {
  header: DocumentHistoryHeaderProps;
  pagination?: DocumentHistoryPaginationProps;
  className?: string;
}

// Document History Header Component
export const DocumentHistoryHeader: React.FC<DocumentHistoryHeaderProps> = ({
  title,
  totalCount,
  filterType,
  onFilterChange,
  itemsPerPage,
  onItemsPerPageChange,
  showPagination = true
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-title font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground mt-1">
          {totalCount} total
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-caption text-muted-foreground">Filter:</span>
          <Select value={filterType} onValueChange={onFilterChange}>
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
        
        {showPagination && totalCount > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-caption text-muted-foreground">Show:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(Number(value))}>
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
  );
};

// Document History Item Component
export const DocumentHistoryItem: React.FC<{
  document: DocumentItem;
  onDocumentClick?: (document: DocumentItem) => void;
  onEditTitle?: (documentId: string, newTitle: string, type: 'analysis' | 'cover_letter') => void;
  actions?: DocumentAction[];
}> = ({ document, onDocumentClick, onEditTitle, actions = [] }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      className={cn(
        "hover:shadow-md transition-all duration-200 hover:border-primary/50 hover:bg-muted/50 cursor-pointer",
        "border border-border relative"
      )}
      onClick={() => onDocumentClick?.(document)}
    >
      {/* Document Type Badge */}
      <Badge variant="subtle" className="absolute top-2 right-2 text-micro">
        {document.type === 'analysis' ? 'cv analysis' : 'cover letter'}
      </Badge>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-heading font-medium text-foreground">
                {document.job_title || document.title || 'Untitled'}
              </h3>
              {getDocumentBadge()}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle edit title logic here
                }}
                className="p-1 h-auto text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-4 text-caption text-muted-foreground mb-2">
              {document.type === 'cover_letter' && (
                <span className="text-muted-foreground">Generated from CV analysis</span>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Updated {formatDate(document.created_at)}</span>
              </div>
              {document.compatibility_score && (
                <div className="text-primary font-medium">
                  Score: {document.compatibility_score}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons row at bottom */}
        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border">
          {actions.map((action, index) => {
            if (action.condition && !action.condition(document)) {
              return null;
            }
            
            return (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(document);
                }}
                className={cn(
                  "text-caption font-medium transition-colors h-8 px-3",
                  action.variant === 'destructive' && "text-destructive hover:text-destructive hover:bg-destructive/10",
                  action.variant === 'success' && "text-success hover:text-success hover:bg-success/10"
                )}
              >
                {action.icon}
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Document History Empty State Component
export const DocumentHistoryEmptyState: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
}> = ({ title, description, icon = <FileText className="h-12 w-12" /> }) => (
  <div className="text-center py-12">
    <div className="text-muted-foreground mx-auto mb-4">
      {icon}
    </div>
    <h3 className="text-heading font-medium text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

// Document History Loading State Component
export const DocumentHistoryLoading: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Document History Pagination Component
export const DocumentHistoryPagination: React.FC<DocumentHistoryPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={cn(
                currentPage <= 1 && "pointer-events-none opacity-50",
                "text-body font-normal"
              )}
            />
          </PaginationItem>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
                isActive={currentPage === page}
                className="text-body font-normal"
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
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={cn(
                currentPage >= totalPages && "pointer-events-none opacity-50",
                "text-body font-normal"
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

// Document History List Component
export const DocumentHistoryList: React.FC<DocumentHistoryListProps> = ({
  documents,
  loading = false,
  onDocumentClick,
  onEditTitle,
  actions = [],
  emptyState
}) => {
  if (loading) {
    return <DocumentHistoryLoading />;
  }

  if (documents.length === 0) {
    return (
      <DocumentHistoryEmptyState
        title={emptyState?.title || "No documents found"}
        description={emptyState?.description || "You haven't created any documents yet."}
        icon={emptyState?.icon}
      />
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => {
        const documentActions = typeof actions === 'function' ? actions(document) : actions || [];
        return (
          <DocumentHistoryItem
            key={`${document.type}-${document.id}`}
            document={document}
            onDocumentClick={onDocumentClick}
            onEditTitle={onEditTitle}
            actions={documentActions}
          />
        );
      })}
    </div>
  );
};

// Main Document History Component
export const DocumentHistory: React.FC<DocumentHistoryProps> = ({
  header,
  documents,
  loading = false,
  onDocumentClick,
  onEditTitle,
  actions = [],
  emptyState,
  pagination,
  className
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      <DocumentHistoryHeader {...header} />
      
      <DocumentHistoryList
        documents={documents}
        loading={loading}
        onDocumentClick={onDocumentClick}
        onEditTitle={onEditTitle}
        actions={actions}
        emptyState={emptyState}
      />
      
      {pagination && (
        <DocumentHistoryPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
};

export default DocumentHistory;