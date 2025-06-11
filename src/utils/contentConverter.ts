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
 * Safely initialize editor content from various input types
 */
export const initializeEditorContent = (
  extractedText?: string,
  documentJson?: any
): { html: string; json: DocumentJson; text: string } => {
  
  let sourceText = '';
  
  // Prioritize structured JSON content if available
  if (documentJson) {
    try {
      if (typeof documentJson === 'string') {
        const parsed = JSON.parse(documentJson);
        sourceText = generateFormattedText(parsed);
      } else if (documentJson.sections) {
        sourceText = generateFormattedText(documentJson);
      }
    } catch (error) {
      console.warn('Failed to parse document JSON, falling back to text:', error);
    }
  }
  
  // Fallback to extracted text
  if (!sourceText && extractedText) {
    sourceText = extractedText;
  }
  
  // Ensure we have some content
  if (!sourceText) {
    sourceText = '';
  }
  
  // Generate all formats
  const json = textToJson(sourceText);
  const html = jsonToHtml(json);
  const text = generateFormattedText(json);
  
  return { html, json, text };
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