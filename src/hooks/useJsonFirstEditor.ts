import { useState, useCallback, useRef, useEffect } from 'react';
import { DocumentJson, textToJson, generateFormattedText } from '@/utils/documentJsonUtils';
import { jsonToHtml, htmlToJson, validateHtmlCompatibility } from '@/utils/jsonHtmlConverters';

interface UseJsonFirstEditorOptions {
  initialContent: string | DocumentJson;
  onContentChange?: (json: DocumentJson, text: string) => void;
  debounceMs?: number;
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
  saveChanges: (html: string) => Promise<void>;
  getPlainText: () => string;
}

export const useJsonFirstEditor = ({
  initialContent,
  onContentChange,
  debounceMs = 300,
  enableAutoSave = true
}: UseJsonFirstEditorOptions): UseJsonFirstEditorReturn => {
  // DIAGNOSTIC: Log initialization details
  console.log('[useJsonFirstEditor] Initializing with:', {
    contentType: typeof initialContent,
    isObject: typeof initialContent === 'object',
    hasSection: typeof initialContent === 'object' && initialContent?.sections,
    contentLength: typeof initialContent === 'string' ? initialContent?.length : 'N/A',
    preview: typeof initialContent === 'string' ? initialContent?.substring(0, 100) : JSON.stringify(initialContent)?.substring(0, 100)
  });

  // Core state - JSON is the single source of truth with robust validation
  const [documentJson, setDocumentJson] = useState<DocumentJson>(() => {
    try {
      if (typeof initialContent === 'object' && initialContent?.sections) {
        console.log('[useJsonFirstEditor] Using DocumentJson directly:', initialContent);
        return initialContent as DocumentJson;
      }
      const cleanContent = (initialContent as string)?.trim() || '';
      console.log('[useJsonFirstEditor] Converting string to JSON:', { cleanContent: cleanContent.substring(0, 100) });
      const result = textToJson(cleanContent);
      console.log('[useJsonFirstEditor] Conversion result:', { sections: result.sections.length });
      return result;
    } catch (error) {
      console.error('[useJsonFirstEditor] Initialization error, using empty document:', error);
      return textToJson('');
    }
  });
  
  const [htmlContent, setHtmlContent] = useState<string>(() => {
    try {
      if (typeof initialContent === 'object' && initialContent?.sections) {
        const html = jsonToHtml(initialContent as DocumentJson);
        // Validate HTML before setting
        const validHtml = html && html.trim() ? html : '<p><br></p>';
        console.log('[useJsonFirstEditor] Generated HTML from JSON:', { htmlLength: validHtml.length, preview: validHtml.substring(0, 100) });
        return validHtml;
      }
      const cleanContent = (initialContent as string)?.trim() || '';
      const json = textToJson(cleanContent);
      const html = jsonToHtml(json);
      // Validate HTML before setting
      const validHtml = html && html.trim() ? html : '<p><br></p>';
      console.log('[useJsonFirstEditor] Generated HTML from text:', { htmlLength: validHtml.length, preview: validHtml.substring(0, 100) });
      return validHtml;
    } catch (error) {
      console.error('[useJsonFirstEditor] HTML initialization error, using fallback:', error);
      return '<p><br></p>';
    }
  });
  const [isConverting, setIsConverting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // References for debouncing and original content
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const originalJsonRef = useRef<DocumentJson>(
    typeof initialContent === 'object' && initialContent.sections
      ? initialContent as DocumentJson
      : textToJson((initialContent as string) || '')
  );
  const lastValidJsonRef = useRef<DocumentJson>(documentJson);

  // REMOVED: Sync HTML content useEffect that was causing race conditions
  // HTML content is now managed directly through state updates only

  // Update from HTML input (from Quill editor) - NO AUTO-SAVE
  const updateFromHtml = useCallback((html: string) => {
    console.log('[useJsonFirstEditor] updateFromHtml called (HTML-first mode):', { htmlLength: html.length });
    
    try {
      // Validate HTML content before setting
      const validHtml = html && typeof html === 'string' ? html : '<p><br></p>';
      setHtmlContent(validHtml);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('[useJsonFirstEditor] Error updating HTML content:', error);
      // Don't update on error to prevent breaking the editor
    }
  }, []);

  // Update from JSON (programmatic updates)
  const updateFromJson = useCallback((json: DocumentJson) => {
    try {
      if (!json || !json.sections) {
        console.warn('[useJsonFirstEditor] Invalid JSON provided to updateFromJson');
        return;
      }
      
      setDocumentJson(json);
      const html = jsonToHtml(json);
      const validHtml = html && html.trim() ? html : '<p><br></p>';
      setHtmlContent(validHtml);
      setHasUnsavedChanges(true);
      lastValidJsonRef.current = json;

      if (onContentChange && enableAutoSave) {
        const text = generateFormattedText(json);
        onContentChange(json, text);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('[useJsonFirstEditor] Error updating from JSON:', error);
    }
  }, [onContentChange, enableAutoSave]);

  // Reset to original content
  const resetToOriginal = useCallback(() => {
    const originalJson = originalJsonRef.current;
    const originalHtml = jsonToHtml(originalJson);
    setDocumentJson(originalJson);
    setHtmlContent(originalHtml);
    setHasUnsavedChanges(false);
    lastValidJsonRef.current = originalJson;
    console.log('[useJsonFirstEditor] Reset to original:', { originalHtml: originalHtml.substring(0, 100) });
  }, []);

  // Manual save - Convert HTML to JSON and save
  const saveChanges = useCallback(async (currentHtml: string) => {
    if (!onContentChange) return;
    
    console.log('[useJsonFirstEditor] saveChanges called - converting HTML to JSON');
    setIsConverting(true);
    
    try {
      // Convert current HTML to JSON
      const newJson = htmlToJson(currentHtml);
      const newText = generateFormattedText(newJson);
      
      // Update internal state
      setDocumentJson(newJson);
      lastValidJsonRef.current = newJson;
      
      // Save to database
      await onContentChange(newJson, newText);
      setHasUnsavedChanges(false);
      
      console.log('[useJsonFirstEditor] Save successful');
    } catch (error) {
      console.error('[useJsonFirstEditor] Save failed:', error);
      throw error;
    } finally {
      setIsConverting(false);
    }
  }, [onContentChange]);

  // Get plain text representation
  const getPlainText = useCallback(() => {
    return generateFormattedText(documentJson);
  }, [documentJson]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

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