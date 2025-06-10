import React, { useState, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import RichTextEditor from '@/components/common/RichTextEditor';
import { supabase } from '@/integrations/supabase/client';
import { 
  DocumentJson, 
  textToJson,
  generateFormattedText,
  parseDocumentJson 
} from '@/utils/documentJsonUtils';

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
  const [documentJson, setDocumentJson] = useState<DocumentJson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load CV content on modal open
  useEffect(() => {
    if (isOpen && cv.id) {
      loadCVContent();
    }
  }, [isOpen, cv.id]);

  const loadCVContent = async () => {
    setIsLoading(true);
    try {
      // Try to use existing document_content_json first
      if (cv.document_content_json) {
        const parsedJson = parseDocumentJson(JSON.stringify(cv.document_content_json));
        if (parsedJson) {
          setDocumentJson(parsedJson);
          setIsLoading(false);
          return;
        }
      }

      // Fallback to extracted_text
      if (cv.extracted_text) {
        const jsonFromText = textToJson(cv.extracted_text);
        setDocumentJson(jsonFromText);
      } else {
        // Fetch from database if not available
        const { data, error } = await supabase
          .from('uploads')
          .select('extracted_text, document_content_json')
          .eq('id', cv.id)
          .single();

        if (error) throw error;

        if (data.document_content_json) {
          const parsedJson = parseDocumentJson(JSON.stringify(data.document_content_json));
          if (parsedJson) {
            setDocumentJson(parsedJson);
          }
        } else if (data.extracted_text) {
          const jsonFromText = textToJson(data.extracted_text);
          setDocumentJson(jsonFromText);
        } else {
          throw new Error('No content available for editing');
        }
      }
    } catch (error) {
      console.error('Error loading CV content:', error);
      // Silent error handling - no toast notification
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = async (newJson: DocumentJson, newText: string) => {
    setDocumentJson(newJson);
    
    // Silent auto-save to database - NO TOAST NOTIFICATIONS
    try {
      const { error } = await supabase
        .from('uploads')
        .update({
          extracted_text: newText,
          document_content_json: newJson as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', cv.id);

      if (error) throw error;
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Silent failure - no user notification
    }
  };

  const handleSave = async () => {
    if (!documentJson) return;

    setIsSaving(true);
    try {
      const updatedText = generateFormattedText(documentJson);
      
      const { error } = await supabase
        .from('uploads')
        .update({
          extracted_text: updatedText,
          document_content_json: documentJson as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', cv.id);

      if (error) throw error;

      // Silent success - no toast notification
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error saving CV content:', error);
      // Silent error handling - no toast notification
    } finally {
      setIsSaving(false);
    }
  };

  if (!documentJson && !isLoading) {
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
          ) : documentJson ? (
            <RichTextEditor
              documentJson={documentJson}
              onContentChange={handleContentChange}
              className="h-[calc(100vh-200px)]"
              placeholder="Edit your CV content here..."
              showAIFeatures={true}
            />
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
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CVContentEditModal;