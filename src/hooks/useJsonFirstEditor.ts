import { useState, useCallback, useRef, useEffect } from 'react';
import { DocumentJson, textToJson, generateFormattedText } from '@/utils/documentJsonUtils';
import { jsonToHtml, htmlToJson, validateHtmlCompatibility } from '@/utils/jsonHtmlConverters';

interface UseJsonFirstEditorOptions {
  initialContent: string;
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
  // Core state - JSON is the single source of truth
  const [documentJson, setDocumentJson] = useState<DocumentJson>(() => {
    const cleanContent = initialContent?.trim() || '';
    return textToJson(cleanContent);
  });
  const [htmlContent, setHtmlContent] = useState<string>(() => {
    const cleanContent = initialContent?.trim() || '';
    const json = textToJson(cleanContent);
    return jsonToHtml(json);
  });
  const [isConverting, setIsConverting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // References for debouncing and original content
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const originalJsonRef = useRef<DocumentJson>(textToJson(initialContent));
  const lastValidJsonRef = useRef<DocumentJson>(documentJson);

  // Sync HTML content when JSON changes (controlled updates)
  useEffect(() => {
    const newHtml = jsonToHtml(documentJson);
    if (newHtml !== htmlContent) {
      setHtmlContent(newHtml);
    }
  }, [documentJson, htmlContent]);

  // Update from HTML input (from Quill editor)
  const updateFromHtml = useCallback((html: string) => {
    if (!validateHtmlCompatibility(html)) {
      console.warn('Invalid HTML detected, maintaining last valid state');
      return;
    }

    setIsConverting(true);
    
    try {
      const newJson = htmlToJson(html);
      
      // Validate the conversion
      if (newJson.sections.length === 0 && html.trim() !== '<p><br></p>') {
        console.warn('HTML to JSON conversion resulted in empty document');
        setIsConverting(false);
        return;
      }

      // Update states
      setDocumentJson(newJson);
      setHtmlContent(html);
      setHasUnsavedChanges(true);
      lastValidJsonRef.current = newJson;

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
    setDocumentJson(originalJson);
    setHtmlContent(jsonToHtml(originalJson));
    setHasUnsavedChanges(false);
    lastValidJsonRef.current = originalJson;
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