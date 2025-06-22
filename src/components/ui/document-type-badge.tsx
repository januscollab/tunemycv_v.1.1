import React from 'react';
import { FileText, MessageSquare, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DocumentTypeBadgeProps {
  type: 'analysis' | 'cover_letter' | 'interview_prep';
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'sm' | 'default';
  className?: string;
}

export const DocumentTypeBadge: React.FC<DocumentTypeBadgeProps> = ({
  type,
  variant = 'secondary',
  size = 'default',
  className
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'analysis':
        return {
          icon: Target,
          label: 'Analysis',
          color: 'text-blue-600 dark:text-blue-400'
        };
      case 'cover_letter':
        return {
          icon: FileText,
          label: 'Cover Letter',
          color: 'text-green-600 dark:text-green-400'
        };
      case 'interview_prep':
        return {
          icon: MessageSquare,
          label: 'Interview Prep',
          color: 'text-purple-600 dark:text-purple-400'
        };
      default:
        return {
          icon: FileText,
          label: 'Document',
          color: 'text-muted-foreground'
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <Badge 
      variant={variant} 
      className={cn(
        'inline-flex items-center gap-1.5',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <Icon className={cn(iconSize, config.color)} />
      <span>{config.label}</span>
    </Badge>
  );
};

export default DocumentTypeBadge;