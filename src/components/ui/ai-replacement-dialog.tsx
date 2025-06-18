
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw, Check, X, Brain } from 'lucide-react';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {actionTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Creativity Slider */}
          <div className="border rounded-lg p-4 bg-primary/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">AI Creativity Level</span>
              <Brain className="w-4 h-4 text-primary/70" />
            </div>
            
            <div className="space-y-3">
              {/* Current Level Display */}
              <div className="text-center">
                <div className="text-sm font-semibold text-primary">
                  {getCurrentLevel().label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getCurrentLevel().description}
                </div>
              </div>

              {/* Slider */}
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={creativityLevel}
                  onChange={(e) => updateCreativityLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #6366f1 33%, #8b5cf6 66%, #ec4899 100%)`
                  }}
                />
              </div>

              {/* Level Labels */}
              <div className="flex justify-between text-xs text-muted-foreground">
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
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Original Text</h3>
                <div className="text-sm bg-muted/50 p-3 rounded-md max-h-32 overflow-y-auto">
                  {originalText}
                </div>
              </CardContent>
            </Card>

            {/* Generated Text */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-2 text-primary">AI Generated Text</h3>
                <div className="text-sm bg-primary/5 p-3 rounded-md max-h-32 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    generatedText || "No content generated"
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleAccept}
                disabled={isLoading || !generatedText}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
