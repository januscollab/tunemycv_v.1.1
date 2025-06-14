import React, { useState, useEffect, useRef } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ControlledRichTextEditor from '@/components/common/ControlledRichTextEditor';
import EnhancedEditorErrorBoundary from '@/components/common/EnhancedEditorErrorBoundary';
import { BounceLoader } from '@/components/ui/progress-indicator';
import { supabase } from '@/integrations/supabase/client';
import { 
  DocumentJson, 
  textToJson,
  generateFormattedText,
  parseDocumentJson 
} from '@/utils/documentJsonUtils';
import { initializeEditorContent } from '@/utils/contentConverter';

interface CVContentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  cv: {
    id: string;
    file_name: string;
    extracted_text?: string;
    document_content_json?: any;
  };
  onUpdate: () => void;
}

const CVContentEditModal: React.FC<CVContentEditModalProps> = ({
  isOpen,
  onClose,
  cv,
  onUpdate
}) => {
  const [editorContent, setEditorContent] = useState<string | DocumentJson>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<{ htmlContent: string; saveChanges: () => Promise<void> }>(null);

  // Load CV content on modal open
  useEffect(() => {
    if (isOpen && cv.id) {
      loadCVContent();
    }
  }, [isOpen, cv.id]);

  const loadCVContent = async () => {
    setIsLoading(true);
    console.log('[CVContentEditModal] Loading CV content for:', cv.id);
    
    try {
      let extractedText = cv.extracted_text;
      let documentContentJson = cv.document_content_json;

      console.log('[CVContentEditModal] Initial content state:', {
        hasExtractedText: !!extractedText,
        hasDocumentJson: !!documentContentJson,
        extractedTextLength: extractedText?.length || 0,
        documentJsonType: typeof documentContentJson
      });

      // Fetch from database if not available in props
      if (!extractedText && !documentContentJson) {
        console.log('[CVContentEditModal] Fetching from database...');
        const { data, error } = await supabase
          .from('uploads')
          .select('extracted_text, document_content_json')
          .eq('id', cv.id)
          .single();

        if (error) throw error;
        
        extractedText = data.extracted_text;
        documentContentJson = data.document_content_json;
        console.log('[CVContentEditModal] Fetched from database:', {
          hasExtractedText: !!extractedText,
          hasDocumentJson: !!documentContentJson
        });
      }

      // Parse JSON content if available, otherwise convert text to JSON
      let contentToLoad: DocumentJson;
      
      if (documentContentJson && typeof documentContentJson === 'object') {
        contentToLoad = parseDocumentJson(documentContentJson);
        console.log('[CVContentEditModal] Using JSON content:', {
          sectionsCount: contentToLoad.sections.length,
          source: 'database_json'
        });
      } else if (extractedText) {
        contentToLoad = textToJson(extractedText);
        console.log('[CVContentEditModal] Converting text to JSON:', {
          sectionsCount: contentToLoad.sections.length,
          source: 'extracted_text'
        });
      } else {
        contentToLoad = textToJson('');
        console.log('[CVContentEditModal] Using empty JSON content');
      }
      
      // Pass JSON object directly to editor (JSON-first architecture)
      setEditorContent(contentToLoad);
    } catch (error) {
      console.error('Error loading CV content:', error);
      // Silent error handling - no toast notification
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = async (newJson: DocumentJson, newText: string) => {
    console.log('[CVContentEditModal] Content changed in editor:', {
      sectionsCount: newJson.sections.length,
      textLength: newText.length,
      timestamp: new Date().toISOString()
    });
    
    // CRITICAL: Update React state to reflect editor changes for save consistency
    setEditorContent(newJson);
    console.log('[CVContentEditModal] Updated React state with new content');
    // Note: Auto-save disabled - only save on explicit save button click
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('[CVContentEditModal] Starting explicit save...');
      
      // Force save from editor to get latest content and verify state
      let finalJson: DocumentJson;
      let finalText: string;
      
      if (editorRef.current) {
        console.log('[CVContentEditModal] Forcing editor save to get live content...');
        await editorRef.current.saveChanges();
        
        // CRITICAL: Get the latest JSON from the editor's live state, not React state
        // React state may be stale - we need the actual editor content
        console.log('[CVContentEditModal] Current editorContent state type:', typeof editorContent);
        console.log('[CVContentEditModal] Current editorContent preview:', 
          typeof editorContent === 'object' ? `${editorContent.sections?.length} sections` : editorContent?.toString().substring(0, 100)
        );
        
        if (typeof editorContent === 'object' && editorContent.sections) {
          finalJson = editorContent as DocumentJson;
          finalText = generateFormattedText(finalJson);
          console.log('[CVContentEditModal] Using editor JSON content:', {
            sectionsCount: finalJson.sections.length,
            textLength: finalText.length
          });
        } else {
          throw new Error('Invalid editor content state - expected DocumentJson object');
        }
      } else {
        throw new Error('Editor reference not available');
      }

      console.log('[CVContentEditModal] Saving to database...', {
        sectionsCount: finalJson.sections.length,
        textLength: finalText.length
      });

      // Save to database with explicit transaction
      const { error } = await supabase
        .from('uploads')
        .update({
          extracted_text: finalText,
          document_content_json: finalJson as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', cv.id);

      if (error) {
        console.error('[CVContentEditModal] Database save error:', error);
        throw error;
      }
      
      console.log('[CVContentEditModal] Save completed successfully');
      
      // Only close after successful save
      onUpdate();
      onClose();
    } catch (error) {
      console.error('[CVContentEditModal] Save failed:', error);
      // Keep modal open on error so user can retry
      // Silent error handling - no toast notification
    } finally {
      setIsSaving(false);
    }
  };

  if (!editorContent && !isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <DialogTitle className="text-heading font-semibold text-foreground">
                  Edit CV Content
                </DialogTitle>
                <p className="text-caption text-muted-foreground mt-1">
                  {cv.file_name}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border border-primary border-t-transparent"></div>
              <span className="ml-3 text-muted-foreground">Loading CV content...</span>
            </div>
          ) : editorContent ? (
            <EnhancedEditorErrorBoundary
              fallbackContent={typeof editorContent === 'string' ? editorContent : generateFormattedText(editorContent)}
              onReset={() => {
                const resetJson = cv.document_content_json 
                  ? parseDocumentJson(cv.document_content_json)
                  : textToJson(cv.extracted_text || '');
                setEditorContent(resetJson);
              }}
              componentName="CV Content Editor"
              onContentRestore={(content) => {
                const json = textToJson(content);
                handleContentChange(json, content);
              }}
            >
              <ControlledRichTextEditor
                ref={editorRef}
                initialContent={editorContent}
                onContentChange={handleContentChange}
                className="h-[calc(100vh-200px)]"
                placeholder="Edit your CV content here..."
                showAIFeatures={true}
                enableAutoSave={false}
                debounceMs={1000}
              />
            </EnhancedEditorErrorBoundary>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-border bg-background">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="font-normal hover:scale-105 transition-all duration-200"
          >
            {isSaving ? (
              <>
                <BounceLoader size="sm" className="mr-2" />
                Converting & Saving...
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

export default CVContentEditModal;