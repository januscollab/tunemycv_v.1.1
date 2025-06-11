import { DocumentJson } from './documentJsonUtils';
import { validateEditorContent, ValidationResult } from './editorValidation';

/**
 * Complete pipeline validation for rich text editor content flow
 */

export interface PipelineTestResult {
  success: boolean;
  stage: string;
  errors: string[];
  warnings: string[];
  data?: any;
}

/**
 * Test the complete data flow: Database → JSON → HTML → Editor Display
 */
export const validateCompletePipeline = async (
  extractedText?: string,
  documentContentJson?: any
): Promise<PipelineTestResult[]> => {
  const results: PipelineTestResult[] = [];
  
  console.log('[pipelineValidator] Starting complete pipeline validation');

  // Stage 1: Database Content Validation
  const dbValidation = validateDatabaseContent(extractedText, documentContentJson);
  results.push(dbValidation);

  if (!dbValidation.success) {
    console.error('[pipelineValidator] Database validation failed, stopping pipeline test');
    return results;
  }

  // Stage 2: Content Initialization Validation
  try {
    const { initializeEditorContent } = await import('./contentConverter');
    const initResult = initializeEditorContent(extractedText, documentContentJson);
    
    const initValidation: PipelineTestResult = {
      success: true,
      stage: 'Content Initialization',
      errors: [],
      warnings: [],
      data: initResult
    };

    if (!initResult.text && !initResult.html) {
      initValidation.success = false;
      initValidation.errors.push('Content initialization produced no output');
    }

    if (initResult.contentType === 'empty') {
      initValidation.warnings.push('Content initialization resulted in empty content');
    }

    results.push(initValidation);
    console.log('[pipelineValidator] Content initialization result:', initValidation);

  } catch (error) {
    results.push({
      success: false,
      stage: 'Content Initialization',
      errors: [`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: []
    });
  }

  // Stage 3: JSON ↔ HTML Conversion Testing
  const conversionValidation = await validateConversionPipeline(extractedText, documentContentJson);
  results.push(conversionValidation);

  // Stage 4: Editor Compatibility Testing
  const editorValidation = validateEditorCompatibility(extractedText, documentContentJson);
  results.push(editorValidation);

  console.log('[pipelineValidator] Pipeline validation complete:', {
    totalStages: results.length,
    successfulStages: results.filter(r => r.success).length,
    failedStages: results.filter(r => !r.success).length
  });

  return results;
};

/**
 * Validate database content integrity
 */
const validateDatabaseContent = (
  extractedText?: string,
  documentContentJson?: any
): PipelineTestResult => {
  const result: PipelineTestResult = {
    success: true,
    stage: 'Database Content',
    errors: [],
    warnings: []
  };

  if (!extractedText && !documentContentJson) {
    result.success = false;
    result.errors.push('No content available from database');
    return result;
  }

  if (extractedText) {
    if (typeof extractedText !== 'string') {
      result.errors.push('Extracted text is not a string');
      result.success = false;
    } else if (extractedText.trim().length === 0) {
      result.warnings.push('Extracted text is empty');
    }
  }

  if (documentContentJson) {
    const validation = validateEditorContent(documentContentJson);
    if (!validation.isValid) {
      result.errors.push(...validation.errors);
      result.success = false;
    }
    result.warnings.push(...validation.warnings);
  }

  return result;
};

/**
 * Test JSON ↔ HTML conversion pipeline
 */
const validateConversionPipeline = async (
  extractedText?: string,
  documentContentJson?: any
): Promise<PipelineTestResult> => {
  const result: PipelineTestResult = {
    success: true,
    stage: 'JSON ↔ HTML Conversion',
    errors: [],
    warnings: []
  };

  try {
    const { jsonToHtml, htmlToJson } = await import('./jsonHtmlConverters');
    const { textToJson, generateFormattedText } = await import('./documentJsonUtils');

    // Test text → JSON → HTML → JSON round trip
    if (extractedText) {
      const json1 = textToJson(extractedText);
      const html = jsonToHtml(json1);
      const json2 = htmlToJson(html);
      const text2 = generateFormattedText(json2);

      if (json1.sections.length !== json2.sections.length) {
        result.warnings.push('Section count changed during round-trip conversion');
      }

      if (!html || html === '<p><br></p>') {
        result.warnings.push('HTML conversion produced empty result');
      }
    }

    // Test DocumentJson → HTML → JSON round trip
    if (documentContentJson && typeof documentContentJson === 'object' && documentContentJson.sections) {
      const html = jsonToHtml(documentContentJson);
      const json2 = htmlToJson(html);

      if (documentContentJson.sections.length !== json2.sections.length) {
        result.warnings.push('DocumentJson round-trip changed section count');
      }
    }

  } catch (error) {
    result.success = false;
    result.errors.push(`Conversion pipeline failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

/**
 * Validate editor compatibility
 */
const validateEditorCompatibility = (
  extractedText?: string,
  documentContentJson?: any
): PipelineTestResult => {
  const result: PipelineTestResult = {
    success: true,
    stage: 'Editor Compatibility',
    errors: [],
    warnings: []
  };

  // Test string input compatibility
  if (extractedText) {
    if (extractedText.includes('<script>') || extractedText.includes('javascript:')) {
      result.errors.push('Extracted text contains potentially unsafe content');
      result.success = false;
    }

    if (extractedText.length > 1000000) { // 1MB
      result.warnings.push('Content is very large and may cause performance issues');
    }
  }

  // Test DocumentJson input compatibility
  if (documentContentJson) {
    const validation = validateEditorContent(documentContentJson);
    if (!validation.isValid) {
      result.errors.push('DocumentJson is not compatible with editor');
      result.success = false;
    }
  }

  return result;
};

/**
 * Validate backward compatibility with existing CV data formats
 */
export const validateBackwardCompatibility = async (
  sampleData: Array<{ extracted_text?: string; document_content_json?: any }>
): Promise<PipelineTestResult> => {
  const result: PipelineTestResult = {
    success: true,
    stage: 'Backward Compatibility',
    errors: [],
    warnings: []
  };

  console.log('[pipelineValidator] Testing backward compatibility with', sampleData.length, 'samples');

  for (let i = 0; i < sampleData.length; i++) {
    const sample = sampleData[i];
    try {
      const pipelineResults = await validateCompletePipeline(
        sample.extracted_text,
        sample.document_content_json
      );

      const failures = pipelineResults.filter(r => !r.success);
      if (failures.length > 0) {
        result.warnings.push(`Sample ${i + 1} has ${failures.length} pipeline failures`);
      }

    } catch (error) {
      result.errors.push(`Sample ${i + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  if (result.errors.length > 0) {
    result.success = false;
  }

  return result;
};

/**
 * Test edge cases
 */
export const validateEdgeCases = async (): Promise<PipelineTestResult[]> => {
  const results: PipelineTestResult[] = [];
  
  console.log('[pipelineValidator] Testing edge cases');

  // Test empty content
  const emptyTest = await validateCompletePipeline('', null);
  results.push({
    success: emptyTest.every(r => r.success),
    stage: 'Empty Content Edge Case',
    errors: emptyTest.flatMap(r => r.errors),
    warnings: emptyTest.flatMap(r => r.warnings)
  });

  // Test malformed JSON
  const malformedJsonTest = await validateCompletePipeline(undefined, { invalid: 'structure' });
  results.push({
    success: malformedJsonTest.some(r => r.success), // Should gracefully degrade
    stage: 'Malformed JSON Edge Case',
    errors: malformedJsonTest.flatMap(r => r.errors),
    warnings: malformedJsonTest.flatMap(r => r.warnings)
  });

  // Test corrupted text
  const corruptedTextTest = await validateCompletePipeline('\x00\x01\x02Invalid\xFF', undefined);
  results.push({
    success: corruptedTextTest.some(r => r.success), // Should handle gracefully
    stage: 'Corrupted Text Edge Case',
    errors: corruptedTextTest.flatMap(r => r.errors),
    warnings: corruptedTextTest.flatMap(r => r.warnings)
  });

  return results;
};