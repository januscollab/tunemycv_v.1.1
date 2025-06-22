import React from 'react';
import { FileText, MessageSquare, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface LinkageIndicatorsProps {
  hasLinkedCoverLetter: boolean;
  hasLinkedInterviewPrep: boolean;
  onViewCoverLetter?: () => void;
  onViewInterviewPrep?: () => void;
  compact?: boolean;
}

export const LinkageIndicators: React.FC<LinkageIndicatorsProps> = ({
  hasLinkedCoverLetter,
  hasLinkedInterviewPrep,
  onViewCoverLetter,
  onViewInterviewPrep,
  compact = false
}) => {
  const hasAnyLinks = hasLinkedCoverLetter || hasLinkedInterviewPrep;

  if (!hasAnyLinks) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-1">
        <Link2 className="h-3 w-3 text-muted-foreground" />
        <div className="flex space-x-1">
          {hasLinkedCoverLetter && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="secondary" 
                  className="h-5 px-1.5 text-tiny cursor-pointer hover:bg-primary/20"
                  onClick={onViewCoverLetter}
                >
                  <FileText className="h-2.5 w-2.5" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Linked Cover Letter</p>
              </TooltipContent>
            </Tooltip>
          )}
          {hasLinkedInterviewPrep && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="secondary" 
                  className="h-5 px-1.5 text-tiny cursor-pointer hover:bg-primary/20"
                  onClick={onViewInterviewPrep}
                >
                  <MessageSquare className="h-2.5 w-2.5" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Linked Interview Prep</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-caption text-muted-foreground">
      <Link2 className="h-4 w-4" />
      <span>Linked:</span>
      <div className="flex space-x-2">
        {hasLinkedCoverLetter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewCoverLetter}
            className="h-6 px-2 text-tiny"
          >
            <FileText className="h-3 w-3 mr-1" />
            Cover Letter
          </Button>
        )}
        {hasLinkedInterviewPrep && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewInterviewPrep}
            className="h-6 px-2 text-tiny"
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Interview Prep
          </Button>
        )}
      </div>
    </div>
  );
};

export default LinkageIndicators;