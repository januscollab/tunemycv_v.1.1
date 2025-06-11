import { DocumentJson, textToJson, generateFormattedText } from './documentJsonUtils';

/**
 * Robust data type conversion utilities for editor components
 */

export interface ConversionResult {
  success: boolean;
  data: DocumentJson | string;
  error?: string;
}

/**
 * Safely convert string content to DocumentJson with validation
 */
export const safeTextToJson = (text: string): ConversionResult => {
  try {
    if (!text || typeof text !== 'string') {
      return {
        success: false,
        data: textToJson(''),
        error: 'Invalid or empty text input'
      };
    }

    const result = textToJson(text.trim());
    
    if (!result || !result.sections || !Array.isArray(result.sections)) {
      return {
        success: false,
        data: textToJson(''),
        error: 'Failed to parse text into valid document structure'
      };
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Text to JSON conversion error:', error);
    return {
      success: false,
      data: textToJson(''),
      error: error instanceof Error ? error.message : 'Unknown conversion error'
    };
  }
};

/**
 * Safely convert DocumentJson to formatted string with validation
 */
export const safeJsonToText = (json: DocumentJson): ConversionResult => {
  try {
    if (!json || typeof json !== 'object' || !json.sections) {
      return {
        success: false,
        data: '',
        error: 'Invalid DocumentJson structure'
      };
    }

    const result = generateFormattedText(json);
    
    if (typeof result !== 'string') {
      return {
        success: false,
        data: '',
        error: 'Failed to generate text from DocumentJson'
      };
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('JSON to text conversion error:', error);
    return {
      success: false,
      data: '',
      error: error instanceof Error ? error.message : 'Unknown conversion error'
    };
  }
};

/**
 * Validate and normalize document content for editor compatibility
 */
export const normalizeDocumentContent = (content: unknown): ConversionResult => {
  // Handle string content
  if (typeof content === 'string') {
    return safeTextToJson(content);
  }
  
  // Handle DocumentJson content
  if (content && typeof content === 'object' && 'sections' in content) {
    const jsonResult = safeJsonToText(content as DocumentJson);
    if (jsonResult.success) {
      return safeTextToJson(jsonResult.data as string);
    }
    return jsonResult;
  }
  
  // Handle null/undefined
  if (content == null) {
    return {
      success: true,
      data: textToJson('')
    };
  }
  
  return {
    success: false,
    data: textToJson(''),
    error: 'Unsupported content type for document conversion'
  };
};

/**
 * Create a backward-compatible content loader that handles both string and JSON
 */
export const loadCompatibleContent = (
  extractedText?: string, 
  documentContentJson?: any
): { json: DocumentJson; text: string; source: 'json' | 'text' | 'empty' } => {
  
  // Try JSON first if available
  if (documentContentJson) {
    try {
      const jsonResult = normalizeDocumentContent(documentContentJson);
      if (jsonResult.success) {
        const textResult = safeJsonToText(jsonResult.data as DocumentJson);
        if (textResult.success) {
          return {
            json: jsonResult.data as DocumentJson,
            text: textResult.data as string,
            source: 'json'
          };
        }
      }
    } catch (error) {
      console.warn('Failed to load from JSON, falling back to text:', error);
    }
  }
  
  // Fallback to extracted text
  if (extractedText) {
    const textResult = safeTextToJson(extractedText);
    if (textResult.success) {
      return {
        json: textResult.data as DocumentJson,
        text: extractedText,
        source: 'text'
      };
    }
  }
  
  // Last resort: empty document
  const emptyJson = textToJson('');
  return {
    json: emptyJson,
    text: '',
    source: 'empty'
  };
};