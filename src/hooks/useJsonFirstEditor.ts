import { useState, useCallback, useRef } from 'react';
import { DocumentJson, textToJson, generateFormattedText } from '@/utils/documentJsonUtils';
import { jsonToHtml, htmlToJson } from '@/utils/jsonHtmlConverters';

interface UseJsonFirstEditorOptions {
  initialContent: string | DocumentJson | { document_content_json?: DocumentJson };
  onContentChange?: (json: DocumentJson, text: string) => void;
  enableAutoSave?: boolean;
}

interface UseJsonFirstEditorReturn {
  documentJson: DocumentJson;
  htmlContent: string;
  isConverting: boolean;
  hasUnsavedChanges: boolean;
  updateFromHtml: (html: string) => void;
  updateFromJson: (json: DocumentJson) => void;
  resetToOriginal: () => void;
  saveChanges: () => Promise<void>;
  getPlainText: () => string;
}

export const useJsonFirstEditor = ({
  initialContent,
  onContentChange,
  enableAutoSave = true
}: UseJsonFirstEditorOptions): UseJsonFirstEditorReturn => {
  
  // Initialize JSON as source of truth - prioritize structured JSON over plain text
  const [documentJson, setDocumentJson] = useState<DocumentJson>(() => {
    console.log('[useJsonFirstEditor] Initializing with content type:', typeof initialContent);
    
    // Priority 1: Use structured DocumentJson if provided
    if (typeof initialContent === 'object' && 'sections' in initialContent && initialContent.sections) {
      console.log('[useJsonFirstEditor] Using provided DocumentJson with', initialContent.sections.length, 'sections');
      return initialContent as DocumentJson;
    }
    
    // Priority 2: Parse from document_content_json if available (from database)
    if (typeof initialContent === 'object' && 'document_content_json' in initialContent && initialContent.document_content_json) {
      console.log('[useJsonFirstEditor] Found document_content_json, using as master');
      return initialContent.document_content_json as DocumentJson;
    }
    
    // Priority 3: Convert plain text to structured JSON
    const content = (initialContent as string)?.trim() || '';
    console.log('[useJsonFirstEditor] Converting plain text to JSON, length:', content.length);
    return textToJson(content);
  });
  
  // Generate HTML from JSON (JSON is always master)
  const [htmlContent, setHtmlContent] = useState<string>(() => {
    let json: DocumentJson;
    
    // Same prioritization for HTML generation
    if (typeof initialContent === 'object' && 'sections' in initialContent && initialContent.sections) {
      json = initialContent as DocumentJson;
    } else if (typeof initialContent === 'object' && 'document_content_json' in initialContent && initialContent.document_content_json) {
      json = initialContent.document_content_json as DocumentJson;
    } else {
      json = textToJson((initialContent as string)?.trim() || '');
    }
    
    const html = jsonToHtml(json);
    console.log('[useJsonFirstEditor] Generated HTML from JSON:', { 
      htmlLength: html?.length || 0, 
      preview: html?.substring(0, 100),
      hasRawTags: html?.includes('<') && !html?.includes('&lt;')
    });
    return html || '<p><br></p>';
  });
  
  const [isConverting, setIsConverting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const originalJsonRef = useRef<DocumentJson>(documentJson);

  // Update from HTML (editor changes)
  const updateFromHtml = useCallback((html: string) => {
    try {
      console.log('[useJsonFirstEditor] updateFromHtml called:', {
        htmlLength: html.length,
        enableAutoSave,
        hasBoldElements: html.includes('<strong>') || html.includes('<b>'),
        hasBreakElements: html.includes('<br>'),
        timestamp: new Date().toISOString()
      });
      
      const validHtml = html || '<p><br></p>';
      setHtmlContent(validHtml);
      
      const newJson = htmlToJson(validHtml);
      console.log('[useJsonFirstEditor] HTML→JSON conversion result:', {
        sectionsCount: newJson.sections.length,
        formattedSections: newJson.sections.filter(s => s.formatting?.bold).length,
        sectionsWithLineBreaks: newJson.sections.filter(s => s.content?.includes('\n')).length
      });
      
      setDocumentJson(newJson);
      setHasUnsavedChanges(true);
      
      if (onContentChange && enableAutoSave) {
        console.log('[useJsonFirstEditor] Auto-saving changes...');
        const text = generateFormattedText(newJson);
        console.log('[useJsonFirstEditor] Generated text for auto-save:', {
          textLength: text.length,
          preview: text.substring(0, 200),
          hasFormatting: text.includes('#') || text.includes('\n\n')
        });
        onContentChange(newJson, text);
        setHasUnsavedChanges(false);
        console.log('[useJsonFirstEditor] Auto-save completed');
      }
    } catch (error) {
      console.error('[useJsonFirstEditor] Error updating from HTML:', error);
    }
  }, [onContentChange, enableAutoSave]);

  // Update from JSON (programmatic updates)
  const updateFromJson = useCallback((json: DocumentJson) => {
    try {
      if (!json || !json.sections) {
        console.warn('Invalid JSON provided to updateFromJson');
        return;
      }
      
      setDocumentJson(json);
      const html = jsonToHtml(json);
      const validHtml = html && html.trim() ? html : '<p><br></p>';
      setHtmlContent(validHtml);
      setHasUnsavedChanges(true);

      if (onContentChange && enableAutoSave) {
        const text = generateFormattedText(json);
        onContentChange(json, text);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error updating from JSON:', error);
    }
  }, [onContentChange, enableAutoSave]);

  // Reset to original content
  const resetToOriginal = useCallback(() => {
    const originalJson = originalJsonRef.current;
    const originalHtml = jsonToHtml(originalJson);
    setDocumentJson(originalJson);
    setHtmlContent(originalHtml);
    setHasUnsavedChanges(false);
  }, []);

  // Manual save - Use current JSON state
  const saveChanges = useCallback(async () => {
    if (!onContentChange) {
      console.warn('[useJsonFirstEditor] saveChanges called but no onContentChange handler');
      return;
    }
    
    console.log('[useJsonFirstEditor] Manual save started:', {
      sectionsCount: documentJson.sections.length,
      hasUnsavedChanges,
      timestamp: new Date().toISOString()
    });
    
    setIsConverting(true);
    
    try {
      const textToSave = generateFormattedText(documentJson);
      console.log('[useJsonFirstEditor] Generated text for save:', {
        textLength: textToSave.length,
        preview: textToSave.substring(0, 100)
      });
      
      await onContentChange(documentJson, textToSave);
      setHasUnsavedChanges(false);
      
      console.log('[useJsonFirstEditor] Manual save completed successfully');
    } catch (error) {
      console.error('[useJsonFirstEditor] Manual save failed:', error);
      throw error;
    } finally {
      setIsConverting(false);
    }
  }, [onContentChange, documentJson, hasUnsavedChanges]);

  // Get plain text representation
  const getPlainText = useCallback(() => {
    return generateFormattedText(documentJson);
  }, [documentJson]);

  return {
    documentJson,
    htmlContent,
    isConverting,
    hasUnsavedChanges,
    updateFromHtml,
    updateFromJson,
    resetToOriginal,
    saveChanges,
    getPlainText
  };
};