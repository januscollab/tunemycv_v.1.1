import React, { useState } from 'react';
import { X, Save, AlertTriangle, CheckCircle, Info, HelpCircle, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatFileSize } from '@/utils/fileUtils';
import { assessDocumentQuality, getQualityColor, getQualityBadge, QualityIssue } from '@/utils/documentQuality';

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
  
  const quality = assessDocumentQuality(editedText, fileName, documentType);
  
  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save delay
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-blueberry dark:text-citrus">
                Review & Verify Document
              </DialogTitle>
              <div className="flex items-center space-x-4 mt-2 text-sm text-blueberry/60 dark:text-apple-core/60">
                <span>{fileName}</span>
                <span>{formatFileSize(fileSize)}</span>
                <span>{quality.wordCount} words</span>
                <Badge 
                  variant="outline" 
                  className={`${getQualityColor(quality.score)} border-current`}
                >
                  {getQualityBadge(quality.score)}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Quality Assessment Panel */}
          <div className="lg:col-span-1">
            <div className="bg-muted/50 rounded-lg p-4 h-full">
              <div className="mb-4">
                <h3 className="font-medium text-blueberry dark:text-citrus">Quality Assessment</h3>
              </div>
              
              <div className="space-y-3">
                <div className="text-center p-3 bg-background rounded-md border">
                  <div className={`text-2xl font-bold ${getQualityColor(quality.score)}`}>
                    {quality.score}%
                  </div>
                  <div className="text-xs text-muted-foreground">Quality Score</div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Document Stats
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="font-medium text-blueberry dark:text-citrus">{quality.wordCount}</div>
                      <div className="text-xs text-muted-foreground">Words</div>
                    </div>
                    <div>
                      <div className="font-medium text-blueberry dark:text-citrus">{quality.characterCount}</div>
                      <div className="text-xs text-muted-foreground">Characters</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <ScrollArea className="max-h-60">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Quality Issues
                    </div>
                    {quality.issues.map((issue, index) => (
                      <Alert key={index} className="py-2">
                        <div className="flex items-start space-x-2">
                          {getIssueIcon(issue.type)}
                          <div className="flex-1 min-w-0">
                            <AlertDescription className="text-xs">
                              <div className="font-medium">{issue.title}</div>
                              <div className="text-muted-foreground mt-1">{issue.description}</div>
                              {issue.suggestion && (
                                <div className="mt-1 text-zapier-orange">
                                  💡 {issue.suggestion}
                                </div>
                              )}
                            </AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                </ScrollArea>

                {!quality.isAcceptable && (
                  <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-sm">
                      <div className="font-medium">Quality concerns detected</div>
                      <div className="text-xs mt-1">
                        Consider improving your document quality for better analysis results.
                        <Button
                          variant="link"
                          className="h-auto p-0 ml-1 text-xs text-zapier-orange hover:text-zapier-orange/80"
                          onClick={() => window.open('/help-centre#document-quality-scoring', '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Get help
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>

          {/* Text Editor Panel */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-blueberry dark:text-citrus">Extracted Text</h3>
              <div className="text-xs text-muted-foreground">
                You can edit the text below to fix any extraction issues
              </div>
            </div>
            
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="flex-1 min-h-[400px] font-mono text-sm"
              placeholder="Document text appears here..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => window.open('/help-centre#document-quality-scoring', '_blank')}
              className="text-zapier-orange hover:text-zapier-orange/80"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Understanding quality scores
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="secondary" 
              onClick={onClose}
              className="hover:bg-secondary-hover"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-md"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentVerificationModal;