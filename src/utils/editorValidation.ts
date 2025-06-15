import { DocumentJson } from './documentJsonUtils';

/**
 * Comprehensive validation utilities for editor content
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate DocumentJson structure
 */
export const validateDocumentJson = (json: any): ValidationResult => {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

  console.log('[editorValidation] validateDocumentJson called:', {
    type: typeof json,
    hasVersion: !!json?.version,
    hasSections: !!json?.sections,
    sectionsIsArray: Array.isArray(json?.sections)
  });

  if (!json || typeof json !== 'object') {
    result.isValid = false;
    result.errors.push('DocumentJson must be an object');
    return result;
  }

  if (!json.version) {
    result.warnings.push('DocumentJson missing version field');
  }

  if (!json.sections) {
    result.isValid = false;
    result.errors.push('DocumentJson must have sections array');
    return result;
  }

  if (!Array.isArray(json.sections)) {
    result.isValid = false;
    result.errors.push('DocumentJson sections must be an array');
    return result;
  }

  // Validate each section
  json.sections.forEach((section: any, index: number) => {
    if (!section || typeof section !== 'object') {
      result.isValid = false;
      result.errors.push(`Section ${index} must be an object`);
      return;
    }

    if (!section.type || !['heading', 'paragraph', 'list'].includes(section.type)) {
      result.isValid = false;
      result.errors.push(`Section ${index} has invalid type: ${section.type}`);
    }

    if (!section.id) {
      result.warnings.push(`Section ${index} missing id field`);
    }

    // Type-specific validation
    if (section.type === 'heading' && !section.content) {
      result.errors.push(`Heading section ${index} missing content`);
    }

    if (section.type === 'paragraph' && !section.content) {
      result.warnings.push(`Paragraph section ${index} has no content`);
    }

    if (section.type === 'list' && (!section.items || !Array.isArray(section.items))) {
      result.errors.push(`List section ${index} must have items array`);
    }
  });

  console.log('[editorValidation] Validation result:', result);
  return result;
};

/**
 * Validate content before passing to editor
 */
export const validateEditorContent = (content: unknown): ValidationResult => {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

  console.log('[editorValidation] validateEditorContent called:', {
    type: typeof content,
    isString: typeof content === 'string',
    isObject: typeof content === 'object'
  });

  if (content === null || content === undefined) {
    result.warnings.push('Content is null or undefined');
    return result;
  }

  if (typeof content === 'string') {
    if (content.length === 0) {
      result.warnings.push('Content string is empty');
    }
    return result;
  }

  if (typeof content === 'object') {
    return validateDocumentJson(content);
  }

  result.isValid = false;
  result.errors.push(`Unsupported content type: ${typeof content}`);
  return result;
};

/**
 * Sanitize and normalize content for safe editor use
 */
export const sanitizeEditorContent = (content: unknown): string => {
  console.log('[editorValidation] sanitizeEditorContent called:', { type: typeof content });

  if (!content) {
    console.log('[editorValidation] Empty content, returning empty string');
    return '';
  }

  if (typeof content === 'string') {
    // Basic HTML sanitization - remove dangerous tags but keep basic formatting
    const sanitized = content
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .trim();
    
    console.log('[editorValidation] Sanitized string content:', { 
      originalLength: content.length, 
      sanitizedLength: sanitized.length 
    });
    return sanitized;
  }

  if (typeof content === 'object' && content !== null) {
    try {
      // Convert object to string representation
      const stringified = JSON.stringify(content, null, 2);
      console.log('[editorValidation] Converted object to string:', { length: stringified.length });
      return stringified;
    } catch (error) {
      console.error('[editorValidation] Failed to stringify object:', error);
      return '';
    }
  }

  console.warn('[editorValidation] Unsupported content type, returning empty string');
  return '';
};

/**
 * Check if content is empty or effectively empty
 */
export const isContentEmpty = (content: unknown): boolean => {
  if (!content) return true;
  
  if (typeof content === 'string') {
    const trimmed = content.trim();
    return trimmed === '' || trimmed === '<p><br></p>' || trimmed === '<p></p>';
  }
  
  if (typeof content === 'object' && content !== null && 'sections' in content) {
    const json = content as DocumentJson;
    return !json.sections || json.sections.length === 0 ||
           json.sections.every(section => 
             !section.content?.trim() && 
             (!section.items || section.items.length === 0)
           );
  }
  
  return true;
};
