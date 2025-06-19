
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw, Check, X } from 'lucide-react';
import { useCreativitySlider } from '@/hooks/useCreativitySlider';

interface AIReplacementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalText: string;
  generatedText: string;
  actionTitle: string;
  isLoading: boolean;
  onAccept: () => void;
  onRegenerate: () => void;
}

export const AIReplacementDialog: React.FC<AIReplacementDialogProps> = ({
  open,
  onOpenChange,
  originalText,
  generatedText,
  actionTitle,
  isLoading,
  onAccept,
  onRegenerate
}) => {
  const { creativityLevel, updateCreativityLevel, getCurrentLevel } = useCreativitySlider();

  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
  };

  const handleReject = () => {
    onOpenChange(false);
  };

  const handleRegenerate = () => {
    onRegenerate();
  };

  const getCreativityGradient = () => {
    const gradients = [
      'from-blue-500 to-blue-600',     // Safe
      'from-blue-500 to-indigo-500',   // Measured  
      'from-indigo-500 to-purple-500', // Bold
      'from-purple-500 to-pink-500'    // Visionary
    ];
    return gradients[creativityLevel] || gradients[1];
  };

  const getCreativityLabel = () => {
    const labels = ['Safe', 'Measured', 'Bold', 'Visionary'];
    return labels[creativityLevel] || 'Measured';
  };

  const getCreativityDescription = () => {
    const descriptions = [
      'Conservative and professional',
      'Balanced professional tone', 
      'Creative and confident',
      'Innovative and bold'
    ];
    return descriptions[creativityLevel] || 'Balanced professional tone';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-medium text-foreground">
            {actionTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Creativity Slider - Compact Discreet Design */}
          <div className="bg-muted/20 rounded-md p-3 border border-muted">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-muted-foreground">AI Creativity</h3>
              <div className="text-xs text-primary font-medium">
                {getCreativityLabel()}
              </div>
            </div>
            
            <div className="space-y-2">
              {/* Compact Slider */}
              <div className="relative">
                <div className="w-full h-1.5 bg-gradient-to-r from-blue-400 via-indigo-400 via-purple-400 to-pink-400 rounded-full opacity-60"></div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={creativityLevel}
                  onChange={(e) => updateCreativityLevel(parseInt(e.target.value))}
                  className="absolute top-0 w-full h-1.5 appearance-none bg-transparent cursor-pointer"
                  style={{
                    background: 'transparent'
                  }}
                />
              </div>

              {/* Compact Level Labels */}
              <div className="flex justify-between text-tiny text-muted-foreground px-0.5">
                <span>Safe</span>
                <span>Measured</span>
                <span>Bold</span>
                <span>Visionary</span>
              </div>
            </div>
          </div>

          {/* Text Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Text */}
            <Card className="border-muted">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Original Text</h4>
                <div className="text-sm bg-muted/50 p-3 rounded-md max-h-40 overflow-y-auto border text-foreground">
                  {originalText}
                </div>
              </CardContent>
            </Card>

            {/* Generated Text */}
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium mb-3 text-primary">AI Generated Text</h4>
                <div className="text-sm bg-primary/5 p-3 rounded-md max-h-40 overflow-y-auto border border-primary/20">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />
                      <span className="text-primary">Processing...</span>
                    </div>
                  ) : (
                    <span className="text-foreground">{generatedText || "No content generated"}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t bg-background">
          <Button
            variant="ghost"
            onClick={handleRegenerate}
            disabled={isLoading}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isLoading}
              className="flex items-center gap-2 border-muted hover:bg-muted"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isLoading || !generatedText}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <Check className="h-4 w-4" />
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
