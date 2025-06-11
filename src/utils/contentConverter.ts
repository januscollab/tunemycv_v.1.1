import { DocumentJson, textToJson, generateFormattedText } from './documentJsonUtils';
import { jsonToHtml } from './jsonHtmlConverters';

/**
 * Convert plain text content to HTML format for rich text editors
 */
export const textToHtml = (text: string): string => {
  if (!text || text.trim() === '') {
    return '<p><br></p>';
  }

  // First convert to JSON structure to handle formatting
  const documentJson = textToJson(text);
  
  // Then convert to HTML
  return jsonToHtml(documentJson);
};

/**
 * Unified content initializer that handles all input types
 */
export const initializeEditorContent = (
  extractedText?: string,
  documentJson?: any
): { html: string; json: DocumentJson; text: string; contentType: 'json' | 'text' | 'empty' } => {
  
  console.log('[contentConverter] initializeEditorContent called:', {
    hasExtractedText: !!extractedText,
    hasDocumentJson: !!documentJson,
    extractedTextLength: extractedText?.length || 0,
    documentJsonType: typeof documentJson
  });

  // Handle DocumentJson directly
  if (documentJson) {
    console.log('[contentConverter] Processing DocumentJson...');
    try {
      let json: DocumentJson;
      
      if (typeof documentJson === 'string') {
        console.log('[contentConverter] Parsing JSON string');
        json = JSON.parse(documentJson);
      } else if (documentJson.sections) {
        console.log('[contentConverter] Using DocumentJson object directly');
        json = documentJson as DocumentJson;
      } else {
        throw new Error('Invalid JSON structure - no sections property');
      }
      
      const html = jsonToHtml(json);
      const text = generateFormattedText(json);
      
      console.log('[contentConverter] DocumentJson processing complete:', {
        sections: json.sections.length,
        htmlLength: html.length,
        textLength: text.length
      });
      
      return { html, json, text, contentType: 'json' };
    } catch (error) {
      console.warn('[contentConverter] Failed to parse document JSON, falling back to text:', error);
    }
  }
  
  // Handle text content
  if (extractedText && extractedText.trim()) {
    console.log('[contentConverter] Processing text content:', { length: extractedText.length });
    const json = textToJson(extractedText);
    const html = jsonToHtml(json);
    const text = generateFormattedText(json);
    
    console.log('[contentConverter] Text processing complete:', {
      sections: json.sections.length,
      htmlLength: html.length,
      textLength: text.length
    });
    
    return { html, json, text, contentType: 'text' };
  }
  
  // Handle empty content
  console.log('[contentConverter] No content provided, returning empty');
  const emptyJson = textToJson('');
  const emptyHtml = jsonToHtml(emptyJson);
  const emptyText = '';
  
  return { html: emptyHtml, json: emptyJson, text: emptyText, contentType: 'empty' };
};

/**
 * Initialize editor content for DocumentJson input specifically
 */
export const initializeEditorFromJson = (documentJson: DocumentJson): { html: string; json: DocumentJson; text: string } => {
  const html = jsonToHtml(documentJson);
  const text = generateFormattedText(documentJson);
  
  return { html, json: documentJson, text };
};

/**
 * Initialize editor content for text input specifically  
 */
export const initializeEditorFromText = (text: string): { html: string; json: DocumentJson; text: string } => {
  const json = textToJson(text);
  const html = jsonToHtml(json);
  const formattedText = generateFormattedText(json);
  
  return { html, json, text: formattedText };
};

/**
 * Validate and normalize content for editor consumption
 */
export const prepareContentForEditor = (content: unknown): string => {
  if (typeof content === 'string') {
    return textToHtml(content);
  }
  
  if (content && typeof content === 'object' && 'sections' in content) {
    try {
      return jsonToHtml(content as DocumentJson);
    } catch (error) {
      console.warn('Failed to convert JSON to HTML:', error);
      return '<p><br></p>';
    }
  }
  
  return '<p><br></p>';
};