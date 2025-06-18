import React, { useState } from 'react';
import { Brain, CreditCard, Clock, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useCreativitySlider } from '@/hooks/useCreativitySlider';

interface AIReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  documentType: 'cv' | 'job_description';
  disabled?: boolean;
}

const AIReviewModal: React.FC<AIReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  documentType,
  disabled = false
}) => {
  const documentLabel = documentType === 'cv' ? 'CV' : 'Job Description';
  const { creativityLevel, updateCreativityLevel, getCurrentLevel } = useCreativitySlider();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {/* Gradient header similar to AI context menu */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-br from-primary-600/80 to-primary-700/80 rounded-t-lg"></div>
        
        <DialogHeader className="relative z-10 pt-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground/90" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-primary-foreground/90">AI {documentLabel} Review</DialogTitle>
              <DialogDescription className="text-sm text-primary-foreground/70">
                Get professional insights powered by AI
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          {/* Features list with improved styling */}
          <div className="p-4 bg-gradient-to-br from-primary-50/50 to-primary-100/30 rounded-lg border border-primary/20">
            <h4 className="font-medium text-primary mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              What you'll get:
            </h4>
            <ul className="text-sm text-primary/80 space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full mt-2 flex-shrink-0"></div>
                Professional formatting analysis
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full mt-2 flex-shrink-0"></div>
                Content optimization suggestions
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full mt-2 flex-shrink-0"></div>
                Industry-specific improvements
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full mt-2 flex-shrink-0"></div>
                ATS compatibility insights
              </li>
            </ul>
          </div>

          {/* AI Creativity Slider - Compact design */}
          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">AI Creativity</span>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-sm font-semibold text-foreground">
                  {getCurrentLevel().label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getCurrentLevel().description}
                </div>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={creativityLevel}
                  onChange={(e) => updateCreativityLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted/50 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #6366f1 33%, #8b5cf6 66%, #ec4899 100%)`
                  }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Safe</span>
                <span>Balanced</span>
                <span>Bold</span>
                <span>Visionary</span>
              </div>
            </div>
          </div>
          
          {/* Cost and status */}
          <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Cost</span>
            </div>
            <Badge variant="compact" className="bg-warning/20 text-warning">
              2 Credits
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-warning/10 rounded-lg border border-warning/30">
            <Clock className="h-4 w-4 text-warning" />
            <span className="text-sm text-warning/80">
              <strong>Coming Soon:</strong> Feature in development
            </span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="text-sm hover:bg-muted/50 transition-all duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={true}
            className="text-sm opacity-50 cursor-not-allowed bg-primary/20 text-primary border border-primary/30"
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