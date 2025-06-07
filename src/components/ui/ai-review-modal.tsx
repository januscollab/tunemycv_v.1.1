import React from 'react';
import { Brain, CreditCard, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface AIReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  documentType: 'cv' | 'job_description';
}

const AIReviewModal: React.FC<AIReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  documentType
}) => {
  const documentLabel = documentType === 'cv' ? 'CV' : 'Job Description';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">AI {documentLabel} Review</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Get professional insights powered by AI
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What you'll get:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Professional formatting analysis</li>
              <li>• Content optimization suggestions</li>
              <li>• Industry-specific improvements</li>
              <li>• ATS compatibility insights</li>
              <li>• Detailed actionable feedback</li>
            </ul>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Cost</span>
            </div>
            <Badge variant="outline" className="text-zapier-orange border-zapier-orange">
              2 Credits
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Coming Soon:</strong> This feature is currently in development
            </span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={true}
            className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200 opacity-50 cursor-not-allowed"
          >
            <Brain className="h-4 w-4 mr-2" />
            Start AI Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIReviewModal;