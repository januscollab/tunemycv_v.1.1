import React, { useState } from 'react';
import { X, Save, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [qualityExpanded, setQualityExpanded] = useState(true);
  const { toast } = useToast();
  
  const quality = assessDocumentQuality(editedText, fileName, documentType);
  
  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(editedText);
    setIsSaving(false);
    onClose();
  };

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

        <div className="flex-1 flex flex-col min-h-0">
          {/* Quality Assessment Panel - Collapsible */}
          <Collapsible open={qualityExpanded} onOpenChange={setQualityExpanded}>
            <CollapsibleTrigger asChild>
              <div className="px-6 py-3 border-b border-border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-sm font-medium text-foreground">Quality Assessment</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`text-sm font-bold ${getQualityColor(quality.score)}`}>
                        {quality.score}%
                      </div>
                      {quality.issues.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {quality.issues.length} note{quality.issues.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
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
              <div className="px-6 py-4 border-b border-border bg-muted/10">
                <div className="flex items-start space-x-8">
                  {/* Document Stats */}
                  <div className="flex space-x-8">
                    <div className="text-center">
                      <div className="text-xl font-bold text-foreground">{quality.wordCount}</div>
                      <div className="text-xs text-muted-foreground">Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-foreground">{Math.round(quality.characterCount / 1000)}k</div>
                      <div className="text-xs text-muted-foreground">Characters</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${getQualityColor(quality.score)}`}>{quality.score}%</div>
                      <div className="text-xs text-muted-foreground">Quality</div>
                    </div>
                  </div>

                  {/* Quality Notes */}
                  <div className="flex-1">
                    {quality.issues.length === 0 ? (
                      <div className="text-sm text-muted-foreground italic">Perfect extraction - no issues detected</div>
                    ) : (
                      <div className="space-y-2">
                        {quality.issues.slice(0, 3).map((issue, index) => (
                          <div key={index} className="flex items-start space-x-2 text-xs">
                            {getIssueIcon(issue.type)}
                            <div>
                              <span className="font-medium">{issue.title}:</span>{' '}
                              <span className="text-muted-foreground">{issue.description}</span>
                            </div>
                          </div>
                        ))}
                        {quality.issues.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            + {quality.issues.length - 3} more notes
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Full-Width Text Editor */}
          <div className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">Extracted Text</h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    // TODO: Implement AI fix functionality
                    toast({
                      title: "Coming Soon!",
                      description: "This feature will automatically format and clean up your document text using AI for 1 credit.",
                    });
                  }}
                >
                  ✨ Let AI Fix It (1 credit)
                </Button>
                <div className="text-xs text-muted-foreground">
                  Review and edit the extracted text below
                </div>
              </div>
            </div>
            
            <ScrollArea className="flex-1 h-[600px] border rounded-md">
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="min-h-[580px] font-mono text-sm resize-none border-0 focus:border-0 focus:outline-none bg-background p-4"
                placeholder="Document text appears here..."
              />
            </ScrollArea>
          </div>
        </div>

        {/* Clean Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-border bg-background">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="hover:bg-muted"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
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