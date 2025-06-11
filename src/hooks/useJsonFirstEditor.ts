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
  saveChanges: () => void;
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

  // Core state - JSON is the single source of truth
  const [documentJson, setDocumentJson] = useState<DocumentJson>(() => {
    if (typeof initialContent === 'object' && initialContent?.sections) {
      console.log('[useJsonFirstEditor] Using DocumentJson directly:', initialContent);
      return initialContent as DocumentJson;
    }
    const cleanContent = (initialContent as string)?.trim() || '';
    console.log('[useJsonFirstEditor] Converting string to JSON:', { cleanContent: cleanContent.substring(0, 100) });
    const result = textToJson(cleanContent);
    console.log('[useJsonFirstEditor] Conversion result:', { sections: result.sections.length });
    return result;
  });
  const [htmlContent, setHtmlContent] = useState<string>(() => {
    if (typeof initialContent === 'object' && initialContent?.sections) {
      const html = jsonToHtml(initialContent as DocumentJson);
      console.log('[useJsonFirstEditor] Generated HTML from JSON:', { htmlLength: html.length, preview: html.substring(0, 100) });
      return html;
    }
    const cleanContent = (initialContent as string)?.trim() || '';
    const json = textToJson(cleanContent);
    const html = jsonToHtml(json);
    console.log('[useJsonFirstEditor] Generated HTML from text:', { htmlLength: html.length, preview: html.substring(0, 100) });
    return html;
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

  // Update from HTML input (from Quill editor)
  const updateFromHtml = useCallback((html: string) => {
    console.log('[useJsonFirstEditor] updateFromHtml called:', { htmlLength: html.length, preview: html.substring(0, 100) });
    
    if (!validateHtmlCompatibility(html)) {
      console.warn('[useJsonFirstEditor] Invalid HTML detected, maintaining last valid state');
      return;
    }

    setIsConverting(true);
    
    try {
      const newJson = htmlToJson(html);
      console.log('[useJsonFirstEditor] HTML to JSON conversion:', { sections: newJson.sections.length });
      
      // Validate the conversion
      if (newJson.sections.length === 0 && html.trim() !== '<p><br></p>') {
        console.warn('[useJsonFirstEditor] HTML to JSON conversion resulted in empty document');
        setIsConverting(false);
        return;
      }

      // Update states
      setDocumentJson(newJson);
      setHtmlContent(html);
      setHasUnsavedChanges(true);
      lastValidJsonRef.current = newJson;
      console.log('[useJsonFirstEditor] Successfully updated from HTML');

      // Debounced callback
      if (onContentChange && enableAutoSave) {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        
        debounceTimeoutRef.current = setTimeout(() => {
          const text = generateFormattedText(newJson);
          onContentChange(newJson, text);
          setHasUnsavedChanges(false);
        }, debounceMs);
      }
    } catch (error) {
      console.error('Error converting HTML to JSON:', error);
      // Revert to last valid state
      setDocumentJson(lastValidJsonRef.current);
      setHtmlContent(jsonToHtml(lastValidJsonRef.current));
    } finally {
      setIsConverting(false);
    }
  }, [onContentChange, enableAutoSave, debounceMs]);

  // Update from JSON (programmatic updates)
  const updateFromJson = useCallback((json: DocumentJson) => {
    setDocumentJson(json);
    setHtmlContent(jsonToHtml(json)); // Manually sync HTML when JSON is updated
    setHasUnsavedChanges(true);
    lastValidJsonRef.current = json;

    if (onContentChange && enableAutoSave) {
      const text = generateFormattedText(json);
      onContentChange(json, text);
      setHasUnsavedChanges(false);
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

  // Manual save
  const saveChanges = useCallback(() => {
    if (onContentChange && hasUnsavedChanges) {
      const text = generateFormattedText(documentJson);
      onContentChange(documentJson, text);
      setHasUnsavedChanges(false);
    }
  }, [onContentChange, hasUnsavedChanges, documentJson]);

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