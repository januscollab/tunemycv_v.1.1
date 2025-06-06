import React, { useState, useEffect, useCallback } from 'react';
import { X, Save, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp, WandSparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { formatFileSize } from '@/utils/fileUtils';
import { assessDocumentQuality, getQualityColor, getQualityBadge } from '@/utils/documentQuality';

interface DocumentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileSize: number;
  extractedText: string;
  documentType: 'cv' | 'job_description';
  onSave: (updatedText: string) => void;
}

const DocumentVerificationModal: React.FC<DocumentVerificationModalProps> = ({
  isOpen,
  onClose,
  fileName,
  fileSize,
  extractedText,
  documentType,
  onSave
}) => {
  const [editedText, setEditedText] = useState(extractedText);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [qualityExpanded, setQualityExpanded] = useState(true);
  const { toast } = useToast();
  
  const quality = assessDocumentQuality(editedText, fileName, documentType);

  // Debounced autosave function
  const debouncedAutoSave = useCallback(
    debounce(async (text: string) => {
      if (text !== extractedText) {
        setIsAutoSaving(true);
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate save
        onSave(text);
        setLastSaved(new Date());
        setIsAutoSaving(false);
      }
    }, 2000),
    [extractedText, onSave]
  );

  // Auto-save effect
  useEffect(() => {
    if (editedText !== extractedText) {
      debouncedAutoSave(editedText);
    }
  }, [editedText, debouncedAutoSave, extractedText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedAutoSave.cancel();
    };
  }, [debouncedAutoSave]);
  
  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(editedText);
    setIsSaving(false);
    onClose();
  };

  // Simple debounce function
  function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
    let timeoutId: NodeJS.Timeout;
    const debounced = (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
    debounced.cancel = () => clearTimeout(timeoutId);
    return debounced;
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return quality.score >= 80 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col p-0">
        {/* Compact Header */}
        <DialogHeader className="px-6 py-3 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <DialogTitle className="text-lg font-semibold text-foreground">
                Review Document
              </DialogTitle>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <span className="font-medium">{fileName}</span>
                <span>•</span>
                <span>{formatFileSize(fileSize)}</span>
                <span>•</span>
                <span>{quality.wordCount} words</span>
                <Badge 
                  variant="outline" 
                  className={`${getQualityColor(quality.score)} border-current`}
                >
                  {getQualityBadge(quality.score)} ({quality.score}%)
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Two-Column Layout: 30% Information, 70% Text Editor */}
        <div className="flex-1 flex min-h-0">
          {/* Left Panel - Document Information (30%) */}
          <div className="w-[30%] border-r border-border bg-muted/5 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="space-y-0">
                {/* Quality Assessment Panel */}
                <Collapsible open={qualityExpanded} onOpenChange={setQualityExpanded}>
                  <CollapsibleTrigger asChild>
                    <div className="px-4 py-3 border-b border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-foreground">Quality Assessment</h3>
                          <div className={`text-sm font-bold ${getQualityColor(quality.score)}`}>
                            {quality.score}%
                          </div>
                        </div>
                        {qualityExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="p-4 border-b border-border bg-muted/10">
                      {/* Document Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-foreground">{quality.wordCount}</div>
                          <div className="text-xs text-muted-foreground">Words</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-foreground">{Math.round(quality.characterCount / 1000)}k</div>
                          <div className="text-xs text-muted-foreground">Characters</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getQualityColor(quality.score)}`}>{quality.score}%</div>
                          <div className="text-xs text-muted-foreground">Quality</div>
                        </div>
                      </div>

                      {/* Quality Notes */}
                      <div className="space-y-2">
                        {quality.issues.length === 0 ? (
                          <div className="text-sm text-muted-foreground italic">Perfect extraction - no issues detected</div>
                        ) : (
                          <>
                            {quality.issues.map((issue, index) => (
                              <div key={index} className="flex items-start space-x-2 text-xs">
                                {getIssueIcon(issue.type)}
                                <div className="flex-1">
                                  <span className="font-medium">{issue.title}:</span>{' '}
                                  <span className="text-muted-foreground">{issue.description}</span>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* File Information */}
                <div className="p-4 border-b border-border">
                  <h3 className="text-sm font-medium text-foreground mb-3">File Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium text-foreground truncate ml-2">{fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium text-foreground">{formatFileSize(fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium text-foreground capitalize">{documentType.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Auto-save Status */}
                <div className="p-4">
                  <div className="text-xs text-muted-foreground">
                    {isAutoSaving ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent" />
                        <span>Auto-saving...</span>
                      </div>
                    ) : lastSaved ? (
                      <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                    ) : (
                      <span>Auto-save enabled</span>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Text Editor (70%) */}
          <div className="w-[70%] flex flex-col">
            <div className="px-4 py-3 border-b border-border bg-background">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Extracted Text</h3>
                <div className="text-xs text-muted-foreground">
                  Click to edit • Changes auto-saved
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-4">
              <ScrollArea className="h-[calc(100vh-300px)] border rounded-md">
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="min-h-[calc(100vh-320px)] font-mono text-sm resize-none border-0 focus:border-0 focus:outline-none bg-background p-4"
                  placeholder="Document text appears here..."
                />
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Footer with 3 buttons */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-border bg-background">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
            className="font-normal hover:bg-muted hover:scale-105 transition-all duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              toast({
                title: "Coming Soon!",
                description: "AI review feature will be available soon.",
              });
            }}
            className="font-normal hover:bg-muted hover:scale-105 transition-all duration-200"
          >
            <WandSparkles className="h-4 w-4 mr-2" />
            Ask AI to Review It
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="font-normal bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 transition-all duration-200 disabled:hover:scale-100"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentVerificationModal;