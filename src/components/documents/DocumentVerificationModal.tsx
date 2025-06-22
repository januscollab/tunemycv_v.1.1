import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Save, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp, WandSparkles, RotateCcw } from 'lucide-react';
import { 
  textToJson, 
  jsonToText, 
  DocumentJson, 
  updateDocumentContent, 
  syncJsonAndText,
  isWellStructuredDocument,
  generateFormattedText 
} from '@/utils/documentJsonUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SafeRichTextEditor from '@/components/common/SafeRichTextEditor';
import EnhancedEditorErrorBoundary from '@/components/common/EnhancedEditorErrorBoundary';
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
  documentJson: DocumentJson;
  documentType: 'cv' | 'job_description';
  onSave: (updatedJson: DocumentJson) => void;
  // Legacy fallback support
  extractedText?: string;
}

const DocumentVerificationModal: React.FC<DocumentVerificationModalProps> = ({
  isOpen,
  onClose,
  fileName,
  fileSize,
  documentJson: initialDocumentJson,
  documentType,
  onSave,
  extractedText // Legacy fallback
}) => {
  // Initialize with JSON as master source
  const [documentJson, setDocumentJson] = useState<DocumentJson>(() => {
    // Use provided JSON if available, otherwise convert from text as fallback
    if (initialDocumentJson && initialDocumentJson.sections) {
      console.log('[DocumentVerificationModal] Using provided JSON as master source');
      return initialDocumentJson;
    } else if (extractedText) {
      console.log('[DocumentVerificationModal] Legacy fallback: converting text to JSON');
      return textToJson(extractedText);
    } else {
      console.log('[DocumentVerificationModal] No content provided, creating empty document');
      return textToJson('');
    }
  });
  
  // Text is derived from JSON, not stored separately
  const [editedText, setEditedText] = useState(() => generateFormattedText(documentJson));
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [qualityExpanded, setQualityExpanded] = useState(true);
  // Remove toast to prevent interruptions during editing
  
  const quality = assessDocumentQuality(editedText, fileName, documentType);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Handle rich text editor content changes - JSON is master, text is derived
  const handleContentChange = useCallback((newJson: DocumentJson, newText: string) => {
    console.log('[DocumentVerificationModal] Content changed:', { 
      sections: newJson.sections?.length || 0,
      textLength: newText.length 
    });
    
    setDocumentJson(newJson);
    setEditedText(newText);
    
    // Mark as changed for unsaved state tracking
    setHasUnsavedChanges(true);
    setIsAutoSaving(false);
    setLastSaved(null);
  }, []);
  
  const handleSave = async (closeAfterSave = true) => {
    setIsSaving(true);
    try {
      // Save JSON as master data format
      console.log('[DocumentVerificationModal] Saving JSON document with', documentJson.sections?.length || 0, 'sections');
      await onSave(documentJson);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('[DocumentVerificationModal] JSON document saved successfully');
      if (closeAfterSave) {
        onClose();
      }
    } catch (error) {
      console.error('[DocumentVerificationModal] Save failed:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return quality.score >= 80 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  // Handle dialog close with auto-save using ref
  const editorRef = useRef<{ htmlContent: string; saveChanges: () => Promise<void> }>(null);
  
  const handleDialogClose = useCallback(async (open: boolean) => {
    if (!open && editorRef.current && hasUnsavedChanges) {
      console.log('[DocumentVerificationModal] Auto-saving JSON on dialog close');
      try {
        await editorRef.current.saveChanges();
        console.log('[DocumentVerificationModal] Auto-save completed');
      } catch (error) {
        console.error('[DocumentVerificationModal] Auto-save failed on close:', error);
      }
    }
    if (!open) {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  // Enhanced auto-save on outside click
  const handleInteractOutside = useCallback(async (event: Event) => {
    if (editorRef.current && hasUnsavedChanges) {
      console.log('[DocumentVerificationModal] Auto-saving on outside interaction');
      try {
        await editorRef.current.saveChanges();
        console.log('[DocumentVerificationModal] Outside click auto-save completed');
      } catch (error) {
        console.error('[DocumentVerificationModal] Outside click auto-save failed:', error);
      }
    }
  }, [hasUnsavedChanges]);

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent 
        className="max-w-7xl max-h-[95vh] flex flex-col p-0"
        onInteractOutside={handleInteractOutside}
      >
      
        {/* Compact Header */}
        <DialogHeader className="px-6 py-3 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <DialogTitle className="text-heading font-semibold text-foreground">
                Review Document
              </DialogTitle>
              <div className="flex items-center space-x-3 text-caption text-muted-foreground">
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
        <div className="flex-1 flex min-h-0 max-h-[70vh]">
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
                          <h3 className="text-caption font-medium text-foreground">Quality Assessment</h3>
                          <div className={`text-caption font-bold ${getQualityColor(quality.score)}`}>
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
                          <div className="text-heading font-bold text-foreground">{quality.wordCount}</div>
                          <div className="text-micro text-muted-foreground">Words</div>
                        </div>
                        <div className="text-center">
                          <div className="text-heading font-bold text-foreground">{Math.round(quality.characterCount / 1000)}k</div>
                          <div className="text-micro text-muted-foreground">Characters</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-heading font-bold ${getQualityColor(quality.score)}`}>{quality.score}%</div>
                          <div className="text-micro text-muted-foreground">Quality</div>
                        </div>
                      </div>

                      {/* Quality Notes */}
                      <div className="space-y-2">
                        {quality.issues.length === 0 ? (
                          <div className="text-caption text-muted-foreground italic">Perfect extraction - no issues detected</div>
                        ) : (
                          <>
                            {quality.issues.map((issue, index) => (
                              <div key={index} className="flex items-start space-x-2 text-micro">
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
                  <h3 className="text-caption font-medium text-foreground mb-3">File Information</h3>
                  <div className="space-y-2 text-caption">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium text-foreground ml-2 break-all">{fileName}</span>
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
                  <div className="text-micro text-muted-foreground">
                    {isAutoSaving ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent" />
                        <span>Auto-saving...</span>
                      </div>
                    ) : lastSaved ? (
                      <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Text Editor (70%) */}
          <div className="w-[70%] flex flex-col">
            <div className="px-4 py-3 border-b border-border bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-caption font-medium text-foreground">Edit Document</h3>
                  <div className="text-micro px-2 py-0.5 bg-primary/10 rounded-full text-primary">
                    {documentType === 'cv' ? 'CV' : 'Job Description'}
                  </div>
                </div>
                {/* Auto-save status removed per user request */}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col min-h-0 p-4 pt-6">
              <ScrollArea className="flex-1 min-h-[400px] max-h-[60vh]">
                <EnhancedEditorErrorBoundary
                  fallbackContent={editedText}
                  onReset={() => {
                    console.log('[DocumentVerificationModal] Error boundary reset to original JSON');
                    const originalText = generateFormattedText(initialDocumentJson);
                    setDocumentJson(initialDocumentJson);
                    setEditedText(originalText);
                  }}
                  componentName="Document Verification Editor"
                  onContentRestore={(content) => {
                    console.log('[DocumentVerificationModal] Content restored from error boundary');
                    const json = textToJson(content);
                    const formattedText = generateFormattedText(json);
                    setDocumentJson(json);
                    setEditedText(formattedText);
                    handleContentChange(json, formattedText);
                  }}
                >
              <SafeRichTextEditor
                ref={editorRef}
                initialContent={documentJson}
                onContentChange={handleContentChange}
                className="min-h-[400px] border rounded-md text-black dark:text-white"
                placeholder="Document content appears here..."
                showAIFeatures={true}
                enableAutoSave={false}
                debounceMs={2000}
              />
                </EnhancedEditorErrorBoundary>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Footer with 3 buttons - Reordered: 1. Ask AI to Review My CV, 2. Revert to Original, 3. Save & Close */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-background">
          <div className="flex items-center space-x-3">
            {documentType === 'cv' ? (
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  // Removed toast notification to prevent interruptions during editing
                  console.log("AI CV review feature coming soon");
                }}
                className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
              >
                <WandSparkles className="h-4 w-4 mr-2" />
                Ask AI to Review My CV
              </Button>
            ) : null}
            <Button 
              variant="outline" 
              size="sm"
                onClick={() => {
                  // Complete revert to original state with zero session changes
                  console.log('[DocumentVerificationModal] Complete revert to original JSON - zero session changes');
                  const originalText = generateFormattedText(initialDocumentJson);
                  setDocumentJson(initialDocumentJson);
                  setEditedText(originalText);
                  setHasUnsavedChanges(false);
                  setLastSaved(null);
                  setIsAutoSaving(false);
                  
                  // Force editor reset if available
                  if (editorRef.current) {
                    // Reset editor to original content
                    handleContentChange(initialDocumentJson, originalText);
                  }
                }}
              className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Revert to Original
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                // Save current content before closing using editor ref
                if (editorRef.current) {
                  try {
                    await editorRef.current.saveChanges();
                    console.log('[DocumentVerificationModal] Save completed before close');
                  } catch (error) {
                    console.error('Save failed on close:', error);
                  }
                }
                onClose();
              }}
              className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Save & Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentVerificationModal;