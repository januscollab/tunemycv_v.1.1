import React from 'react';
import { History, Clock, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HistoryItem {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  status?: 'completed' | 'in-progress' | 'pending' | 'error';
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  metadata?: {
    label: string;
    value: string;
  }[];
  actions?: {
    label: string;
    variant?: 'default' | 'outline' | 'ghost';
    onClick: () => void;
  }[];
}

interface HistoryHeaderProps {
  title: string;
  count: number;
  countLabel?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

interface HistoryListProps {
  items: HistoryItem[];
  emptyState?: {
    title: string;
    description: string;
    action?: React.ReactNode;
  };
  onItemClick?: (item: HistoryItem) => void;
  variant?: 'default' | 'compact' | 'detailed';
}

interface HistorySectionProps extends HistoryListProps {
  header: HistoryHeaderProps;
  className?: string;
}

// History Header Component
export const HistoryHeader: React.FC<HistoryHeaderProps> = ({
  title,
  count,
  countLabel = 'items',
  icon = <History className="h-5 w-5" />,
  actions
}) => {
  const getCountLabel = () => {
    if (count === 1) {
      return countLabel.endsWith('s') ? countLabel.slice(0, -1) : countLabel;
    }
    return countLabel.endsWith('s') ? countLabel : `${countLabel}s`;
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <div>
          <h2 className="text-heading font-semibold text-foreground">{title}</h2>
          <div className="text-caption text-muted-foreground">
            {count} {getCountLabel()}
          </div>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

// Empty State Component
export const HistoryEmptyState: React.FC<{
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <Card className="border-dashed">
    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <History className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-subheading font-medium text-foreground mb-2">{title}</h3>
      <p className="text-body text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action}
    </CardContent>
  </Card>
);

// History Item Component
export const HistoryListItem: React.FC<{
  item: HistoryItem;
  variant?: 'default' | 'compact' | 'detailed';
  onClick?: (item: HistoryItem) => void;
}> = ({ item, variant = 'default', onClick }) => {
  const statusColors = {
    completed: 'text-success',
    'in-progress': 'text-warning', 
    pending: 'text-muted-foreground',
    error: 'text-destructive'
  };

  const statusIcons = {
    completed: '✓',
    'in-progress': '◐',
    pending: '○',
    error: '✗'
  };

  return (
    <Card 
      className={cn(
        "transition-all hover:shadow-md",
        onClick && "cursor-pointer hover:border-primary/50"
      )}
      onClick={() => onClick?.(item)}
    >
      <CardContent className={cn(
        "p-4",
        variant === 'compact' && "p-3",
        variant === 'detailed' && "p-6"
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {item.status && (
                <span className={cn("text-caption font-mono", statusColors[item.status])}>
                  {statusIcons[item.status]}
                </span>
              )}
              <h3 className={cn(
                "font-medium text-foreground truncate",
                variant === 'compact' ? "text-body" : "text-subheading"
              )}>
                {item.title}
              </h3>
              {item.badge && (
                <Badge 
                  variant={item.badge.variant || 'default'} 
                  className={cn(
                    "text-micro",
                    item.badge.variant === 'default' && "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-600",
                    item.badge.variant === 'secondary' && "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-600"
                  )}
                >
                  {item.badge.text}
                </Badge>
              )}
            </div>
            
            {item.subtitle && (
              <p className="text-caption text-muted-foreground mb-2 truncate">
                {item.subtitle}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-micro text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {item.date}
              </div>
              {item.metadata?.map((meta, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span>{meta.label}:</span>
                  <span className="font-medium">{meta.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.actions?.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className="text-micro"
              >
                {action.label}
              </Button>
            ))}
            {onClick && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// History List Component
export const HistoryList: React.FC<HistoryListProps> = ({
  items,
  emptyState,
  onItemClick,
  variant = 'default'
}) => {
  if (items.length === 0 && emptyState) {
    return (
      <HistoryEmptyState
        title={emptyState.title}
        description={emptyState.description}
        action={emptyState.action}
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <HistoryListItem
          key={item.id}
          item={item}
          variant={variant}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
};

// Main History Section Component
export const HistorySection: React.FC<HistorySectionProps> = ({
  header,
  items,
  emptyState,
  onItemClick,
  variant = 'default',
  className
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      <HistoryHeader {...header} />
      <HistoryList
        items={items}
        emptyState={emptyState}
        onItemClick={onItemClick}
        variant={variant}
      />
    </div>
  );
};

export default HistorySection;