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
      <DialogContent className="max-w-md overflow-hidden">
        {/* Gradient header matching experimental AI menu */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-orange-50/10 via-primary-50/10 to-background/20 rounded-t-lg"></div>
        
        <DialogHeader className="relative z-10 pt-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-100/30 via-primary-200/40 to-primary-300/50 rounded-lg flex items-center justify-center ring-2 ring-orange-200/20">
              <Brain className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                AI {documentLabel} Review
                <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full animate-pulse"></div>
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
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

          {/* AI Creativity Slider - Minimal and discreet */}
          <div className="p-3 bg-gradient-to-r from-orange-50/20 via-primary-50/20 to-background/10 rounded-lg border border-orange-200/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground opacity-80">AI Creativity</span>
              <Brain className="h-3 w-3 text-orange-400/70" />
            </div>
            
            <div className="space-y-1.5">
              <div className="text-center">
                <div className="text-xs font-medium text-foreground">
                  {getCurrentLevel().label}
                </div>
                <div className="text-tiny text-muted-foreground">
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
                  className="w-full h-1.5 bg-gradient-to-r from-orange-100/40 to-primary-100/40 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #fb923c 0%, #f59e0b 33%, #a855f7 66%, #ec4899 100%)`
                  }}
                />
              </div>

              <div className="flex justify-between text-tiny text-muted-foreground opacity-70">
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