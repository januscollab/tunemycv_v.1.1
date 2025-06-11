import React, { useState, useEffect, useRef } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ControlledRichTextEditor from '@/components/common/ControlledRichTextEditor';
import EnhancedEditorErrorBoundary from '@/components/common/EnhancedEditorErrorBoundary';
import BounceLoader from '@/components/ui/bounce-loader';
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
  const editorRef = useRef<{ htmlContent: string; saveChanges: (html: string) => Promise<void> }>(null);

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

      // Use the robust content initializer - PASS HTML TO RICH TEXT EDITOR
      const { html, text, contentType } = initializeEditorContent(extractedText, documentContentJson);
      
      console.log('[CVContentEditModal] Content initialization result:', {
        contentType,
        htmlLength: html.length,
        textLength: text.length,
        preview: html.substring(0, 100)
      });
      
      // CRITICAL FIX: Pass HTML content to rich text editor for proper formatting
      setEditorContent(html || '');
    } catch (error) {
      console.error('Error loading CV content:', error);
      // Silent error handling - no toast notification
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = async (newJson: DocumentJson, newText: string) => {
    console.log('[CVContentEditModal] Final save - converting and saving to database:', {
      sectionsCount: newJson.sections.length,
      textLength: newText.length
    });

    // Save to database (only called on explicit save)
    const { error } = await supabase
      .from('uploads')
      .update({
        extracted_text: newText,
        document_content_json: newJson as any,
        updated_at: new Date().toISOString()
      })
      .eq('id', cv.id);

    if (error) throw error;
    console.log('[CVContentEditModal] Save successful');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Get current HTML content from editor and trigger save
      if (editorRef.current) {
        const currentHtml = editorRef.current.htmlContent;
        await editorRef.current.saveChanges(currentHtml);
      }
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error saving CV content:', error);
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
                const resetContent = initializeEditorContent(cv.extracted_text, cv.document_content_json);
                setEditorContent(resetContent.html || '');
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