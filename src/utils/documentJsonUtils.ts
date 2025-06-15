import { ProfessionalTextProcessor } from './professionalTextProcessor';

export interface DocumentSection {
  type: 'heading' | 'paragraph' | 'list';
  level?: 1 | 2 | 3;
  content?: string;
  items?: string[];
  id: string;
  formatting?: {
    bold?: boolean; // Only bold formatting allowed
  };
  confidence?: number; // Quality confidence score
}

export interface DocumentJson {
  version: '1.0';
  sections: DocumentSection[];
  metadata?: {
    structureQuality?: number;
    processingMethod?: 'professional' | 'legacy' | 'preserved';
    extractedAt?: string;
  };
}

// Generate unique ID for sections
const generateId = (): string => {
  return `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Apply JSON formatting rules - preserve bold and line breaks, strip unwanted formatting
const applyFormattingRules = (text: string, preserveFormatting = true): string => {
  let processed = text;
  
  if (preserveFormatting) {
    // Preserve intentional line breaks and bold formatting
    processed = processed
      // Normalize bullets to "-" only
      .replace(/[•·‐−–—]/g, '-')
      // Remove font styling but keep semantic formatting
      .replace(/font-family:[^;]+;?/gi, '')
      .replace(/font-size:[^;]+;?/gi, '')
      // Clean up excessive whitespace but preserve single line breaks
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Max 2 consecutive newlines
      .trim();
  } else {
    // Legacy mode - strip all formatting
    processed = processed
      .replace(/[_*~`]+/g, '')
      .replace(/[•·‐−–—]/g, '-')
      .replace(/font-family:[^;]+;?/gi, '')
      .replace(/font-size:[^;]+;?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  return processed;
};

// Enhanced text processing with file-type awareness
export const textToJson = (text: string, preserveOriginalFormat = false): DocumentJson => {
  console.log('[documentJsonUtils] Starting text processing', { preserveOriginalFormat });
  
  // If preservation mode is enabled, do minimal processing
  if (preserveOriginalFormat) {
    console.log('[documentJsonUtils] Using preservation mode - minimal processing');
    return preserveOriginalTextStructure(text);
  }
  
  // Check if text looks like a simple document that shouldn't be restructured
  if (shouldPreserveAsIs(text)) {
    console.log('[documentJsonUtils] Text appears to be simple format - preserving structure');
    return preserveOriginalTextStructure(text);
  }
  
  // Use professional text processor for complex CVs only
  const normalizedText = ProfessionalTextProcessor.normalizeText(text);
  const structureAnalysis = ProfessionalTextProcessor.structureCVContent(normalizedText);
  
  if (structureAnalysis.quality > 0.7) {
    console.log('[documentJsonUtils] Using professional structure analysis');
    return professionalTextToJson(structureAnalysis);
  }
  
  console.log('[documentJsonUtils] Using minimal processing to preserve format');
  return preserveOriginalTextStructure(text);
};

// Professional text to JSON conversion using NLP analysis
const professionalTextToJson = (analysis: {
  sections: Array<{
    title: string;
    content: string;
    type: 'header' | 'paragraph' | 'list';
    confidence: number;
  }>;
  quality: number;
}): DocumentJson => {
  const sections: DocumentSection[] = [];
  
  for (const section of analysis.sections) {
    // Add section header
    sections.push({
      type: 'heading',
      level: 2,
      content: section.title,
      id: generateId(),
      confidence: section.confidence
    });
    
    // Process section content
    if (section.type === 'list') {
      const items = ProfessionalTextProcessor.structureBulletPoints(section.content);
      if (items.length > 0) {
        sections.push({
          type: 'list',
          items,
          id: generateId(),
          confidence: section.confidence
        });
      }
    } else {
      // Enhanced paragraph structure
      const enhancedContent = ProfessionalTextProcessor.enhanceParagraphStructure(section.content);
      const paragraphs = enhancedContent.split('\n\n').filter(p => p.trim());
      
      for (const paragraph of paragraphs) {
        if (paragraph.trim()) {
          sections.push({
            type: 'paragraph',
            content: paragraph.trim(),
            id: generateId(),
            confidence: section.confidence
          });
        }
      }
    }
  }
  
  return {
    version: '1.0',
    sections,
    metadata: {
      structureQuality: analysis.quality,
      processingMethod: 'professional',
      extractedAt: new Date().toISOString()
    }
  };
};

// Legacy text processing for fallback
const legacyTextToJson = (text: string): DocumentJson => {
  const cleanedText = applyFormattingRules(text);
  const lines = cleanedText.split('\n');
  const sections: DocumentSection[] = [];
  
  let currentParagraph: string[] = [];
  
  // Improved CV section detection patterns
  const sectionHeaderPatterns = [
    /^(professional\s+summary|summary|profile|objective)/i,
    /^(work\s+experience|experience|employment|career)/i,
    /^(education|qualifications|academic)/i,
    /^(skills|technical\s+skills|competencies)/i,
    /^(achievements|accomplishments)/i,
    /^(certifications?|licenses?)/i,
    /^(projects?|portfolio)/i,
    /^(contact|personal\s+details|references)/i
  ];
  
  const isLikelySectionHeader = (line: string): boolean => {
    const trimmed = line.trim();
    // Check for CV section patterns
    if (sectionHeaderPatterns.some(pattern => pattern.test(trimmed))) return true;
    // Check for all caps (common in CVs)
    if (trimmed.length > 3 && trimmed === trimmed.toUpperCase() && /^[A-Z\s&]+$/.test(trimmed)) return true;
    // Check for standalone short lines that might be headers
    if (trimmed.length < 50 && !trimmed.includes('.') && !trimmed.includes(',')) return true;
    return false;
  };
  
  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const content = currentParagraph.join(' ').trim();
      if (content) {
        // Improved paragraph chunking for better readability
        if (content.length > 500) {
          const sentences = content.split(/(?<=[.!?])\s+/);
          let currentChunk = '';
          
          for (const sentence of sentences) {
            if (currentChunk.length + sentence.length > 400 && currentChunk) {
              sections.push({
                type: 'paragraph',
                content: applyFormattingRules(currentChunk.trim()),
                id: generateId()
              });
              currentChunk = sentence;
            } else {
              currentChunk += (currentChunk ? ' ' : '') + sentence;
            }
          }
          
          if (currentChunk.trim()) {
            sections.push({
              type: 'paragraph',
              content: applyFormattingRules(currentChunk.trim()),
              id: generateId()
            });
          }
        } else {
          sections.push({
            type: 'paragraph',
            content: applyFormattingRules(content),
            id: generateId()
          });
        }
      }
      currentParagraph = [];
    }
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) {
      if (currentParagraph.length > 0) {
        currentParagraph.push('');
      }
      continue;
    }
    
    // Check for explicit markdown headings (# ## ### only)
    if (trimmed.match(/^#{1,3}\s+/)) {
      flushParagraph();
      const level = Math.min(trimmed.match(/^(#{1,3})/)?.[1].length || 1, 3) as 1 | 2 | 3;
      const content = applyFormattingRules(trimmed.replace(/^#{1,3}\s+/, ''));
      sections.push({
        type: 'heading',
        level,
        content,
        id: generateId()
      });
      continue;
    }
    
    // Intelligent header detection for CV content
    if (isLikelySectionHeader(trimmed)) {
      flushParagraph();
      sections.push({
        type: 'heading',
        level: 2, // Default to H2 for CV sections
        content: applyFormattingRules(trimmed),
        id: generateId()
      });
      continue;
    }
    
    // Check for bullet points (normalize all to "-")
    if (trimmed.match(/^[-•*·‐−–—]\s+/)) {
      flushParagraph();
      
      // Collect consecutive bullet points with lookahead
      const listItems: string[] = [];
      let j = i;
      
      while (j < lines.length) {
        const currentLine = lines[j].trim();
        if (currentLine.match(/^[-•*·‐−–—]\s+/)) {
          const cleanItem = applyFormattingRules(currentLine.replace(/^[-•*·‐−–—]\s+/, ''));
          if (cleanItem) {
            listItems.push(cleanItem);
          }
          j++;
        } else if (currentLine === '') {
          j++;
        } else {
          break;
        }
      }
      
      if (listItems.length > 0) {
        sections.push({
          type: 'list',
          items: listItems,
          id: generateId()
        });
        i = j - 1; // Skip processed lines
      }
      continue;
    }
    
    // Regular paragraph content
    currentParagraph.push(line);
  }
  
  // Flush any remaining paragraph
  flushParagraph();
  
  return {
    version: '1.0',
    sections: sections.filter(section => 
      section.content?.trim() || (section.items && section.items.length > 0)
    ),
    metadata: {
      structureQuality: 0.5, // Lower quality for legacy processing
      processingMethod: 'legacy',
      extractedAt: new Date().toISOString()
    }
  };
};

// Convert structured JSON back to plain text
export const jsonToText = (docJson: DocumentJson): string => {
  const textLines: string[] = [];
  
  for (const section of docJson.sections) {
    switch (section.type) {
      case 'heading':
        const hashes = '#'.repeat(section.level || 1);
        textLines.push(`${hashes} ${section.content}`);
        textLines.push(''); // Empty line after heading
        break;
        
      case 'paragraph':
        if (section.content) {
          textLines.push(section.content);
          textLines.push(''); // Empty line after paragraph
        }
        break;
        
      case 'list':
        if (section.items) {
          for (const item of section.items) {
            textLines.push(`- ${item}`); // Use "-" bullets as per formatting rules
          }
          textLines.push(''); // Empty line after list
        }
        break;
    }
  }
  
  // Remove trailing empty lines
  while (textLines.length > 0 && textLines[textLines.length - 1] === '') {
    textLines.pop();
  }
  
  return textLines.join('\n');
};

// Update JSON content while preserving structure
export const updateJsonContent = (docJson: DocumentJson, sectionId: string, newContent: string): DocumentJson => {
  return {
    ...docJson,
    sections: docJson.sections.map(section => 
      section.id === sectionId
        ? { ...section, content: newContent }
        : section
    )
  };
};

// Validate JSON structure and formatting compliance
export const isValidDocumentJson = (obj: any): obj is DocumentJson => {
  return obj &&
    obj.version === '1.0' &&
    Array.isArray(obj.sections) &&
    obj.sections.every((section: any) => 
      section.type && 
      section.id &&
      ['heading', 'paragraph', 'list'].includes(section.type)
    );
};

// Enforce JSON formatting rules on existing DocumentJson
export const enforceFormattingRules = (docJson: DocumentJson, preserveFormatting = true): DocumentJson => {
  console.log('[documentJsonUtils] enforceFormattingRules called:', { 
    preserveFormatting, 
    sectionsCount: docJson.sections.length,
    formattedSections: docJson.sections.filter(s => s.formatting?.bold).length
  });
  
  return {
    ...docJson,
    sections: docJson.sections.map(section => {
      const cleanedSection = { ...section };
      
      // Apply formatting rules to content
      if (cleanedSection.content) {
        cleanedSection.content = applyFormattingRules(cleanedSection.content, preserveFormatting);
      }
      
      // Apply formatting rules to list items
      if (cleanedSection.items) {
        cleanedSection.items = cleanedSection.items
          .map(item => applyFormattingRules(item, preserveFormatting))
          .filter(item => item.trim().length > 0);
      }
      
      // Enforce heading level limits (H1, H2, H3 only)
      if (cleanedSection.type === 'heading' && cleanedSection.level) {
        cleanedSection.level = Math.min(cleanedSection.level, 3) as 1 | 2 | 3;
      }
      
      // Keep formatting if preserveFormatting is true, otherwise remove it
      if (!preserveFormatting) {
        delete cleanedSection.formatting;
      }
      
      return cleanedSection;
    }).filter(section => 
      // Remove empty sections
      section.content?.trim() || (section.items && section.items.length > 0)
    )
  };
};

// Bidirectional sync - ensure JSON and text are 100% consistent
export const syncJsonAndText = (
  json: DocumentJson, 
  text: string
): { json: DocumentJson; text: string; isConsistent: boolean } => {
  // Convert JSON to text (authoritative)
  const textFromJson = jsonToText(json);
  
  // Convert text to JSON (authoritative)
  const jsonFromText = textToJson(text);
  
  // Check consistency
  const isConsistent = textFromJson === text;
  
  // Return synchronized versions
  return {
    json: enforceFormattingRules(jsonFromText),
    text: jsonToText(enforceFormattingRules(jsonFromText)),
    isConsistent
  };
};

// Update both JSON and text maintaining 100% consistency
export const updateDocumentContent = (
  currentJson: DocumentJson,
  currentText: string,
  updatedText: string
): { json: DocumentJson; text: string } => {
  // Create new JSON from updated text
  const newJson = enforceFormattingRules(textToJson(updatedText));
  
  // Generate consistent text from the enforced JSON
  const consistentText = jsonToText(newJson);
  
  return {
    json: newJson,
    text: consistentText
  };
};

// Create pretty, human-readable JSON for database storage
export const prettifyDocumentJson = (docJson: DocumentJson): string => {
  try {
    // Check document size to prevent stack overflow
    const jsonString = JSON.stringify(docJson);
    const sizeInKB = new Blob([jsonString]).size / 1024;
    
    console.log('[documentJsonUtils] Prettifying JSON:', { sizeKB: sizeInKB.toFixed(1) });
    
    // For very large documents, use simple formatting to prevent stack overflow
    if (sizeInKB > 500) { // 500KB limit
      console.log('[documentJsonUtils] Large document detected, using simple formatting');
      return JSON.stringify(docJson, null, 2);
    }
    
    // Try to use js-beautify import
    import('js-beautify').then(({ js: jsBeautify }) => {
      if (jsBeautify) {
        const beautified = jsBeautify(jsonString, {
          indent_size: 2,
          space_in_empty_paren: false,
          preserve_newlines: true,
          max_preserve_newlines: 2,
          wrap_line_length: 120
        });
        console.log('[documentJsonUtils] js-beautify successfully formatted JSON');
        return beautified;
      }
    }).catch(() => {
      console.log('[documentJsonUtils] js-beautify import failed, using fallback');
    });
    
    // Safe fallback - never causes recursion
    return JSON.stringify(docJson, null, 2);
    
  } catch (error) {
    console.warn('[documentJsonUtils] Prettification failed, using simple fallback:', error.message || error);
    // Ultimate safe fallback
    return JSON.stringify(docJson, null, 2);
  }
};

// Parse pretty JSON back to DocumentJson object
export const parseDocumentJson = (jsonString: string): DocumentJson | null => {
  try {
    const parsed = JSON.parse(jsonString);
    return isValidDocumentJson(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

// Enhanced text generation with formatting preservation
export const generateFormattedText = (docJson: DocumentJson): string => {
  console.log('[documentJsonUtils] generateFormattedText called:', { 
    sectionsCount: docJson.sections.length,
    formattedSections: docJson.sections.filter(s => s.formatting?.bold).length
  });
  
  const textLines: string[] = [];
  
  for (const section of docJson.sections) {
    switch (section.type) {
      case 'heading':
        // Add proper spacing before headings (except first)
        if (textLines.length > 0) {
          textLines.push('');
        }
        const hashes = '#'.repeat(section.level || 1);
        let headingText = `${hashes} ${section.content}`;
        
        // Bold formatting will be handled by HTML, not markdown
        // Removed markdown asterisks to prevent double formatting
        
        textLines.push(headingText);
        textLines.push(''); // Empty line after heading
        break;
        
      case 'paragraph':
        if (section.content) {
          // Preserve line breaks within paragraphs
          let paragraphContent = section.content;
          
          // Bold formatting will be handled by HTML, not markdown
          // Removed markdown asterisks to prevent double formatting
          
          const paragraphLines = paragraphContent.split('\n').filter(line => line.trim());
          textLines.push(...paragraphLines);
          textLines.push(''); // Empty line after paragraph
        }
        break;
        
      case 'list':
        if (section.items) {
          for (const item of section.items) {
            let listItem = `- ${item}`;
            
            // Bold formatting will be handled by HTML, not markdown
            // Removed markdown asterisks to prevent double formatting
            
            textLines.push(listItem);
          }
          textLines.push(''); // Empty line after list
        }
        break;
    }
  }
  
  // Remove trailing empty lines
  while (textLines.length > 0 && textLines[textLines.length - 1] === '') {
    textLines.pop();
  }
  
  const result = textLines.join('\n');
  console.log('[documentJsonUtils] generateFormattedText result:', { 
    textLength: result.length,
    hasBoldMarkdown: result.includes('**'),
    preview: result.substring(0, 100)
  });
  
  return result;
};

// Check if text should be preserved as-is (TXT files, simple docs)
const shouldPreserveAsIs = (text: string): boolean => {
  const lines = text.split('\n');
  const totalLines = lines.length;
  
  // If text has many line breaks and looks formatted, preserve it
  if (totalLines > 10 && text.includes('\n\n')) {
    return true;
  }
  
  // If text doesn't have typical CV section headers, preserve it
  const cvHeaders = ['experience', 'education', 'skills', 'summary', 'objective'];
  const hasMultipleCVHeaders = cvHeaders.filter(header => 
    text.toLowerCase().includes(header)
  ).length >= 2;
  
  return !hasMultipleCVHeaders;
};

// Preserve original text structure with minimal processing
const preserveOriginalTextStructure = (text: string): DocumentJson => {
  const lines = text.split('\n');
  const sections: DocumentSection[] = [];
  let currentParagraph: string[] = [];
  
  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const content = currentParagraph.join('\n').trim();
      if (content) {
        sections.push({
          type: 'paragraph',
          content,
          id: generateId()
        });
      }
      currentParagraph = [];
    }
  };
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Empty line - end current paragraph
    if (!trimmed) {
      flushParagraph();
      continue;
    }
    
    // Check for obvious headings (short lines, all caps, or markdown headers)
    if (trimmed.match(/^#{1,3}\s+/) || 
        (trimmed.length < 50 && trimmed === trimmed.toUpperCase() && trimmed.length > 3)) {
      flushParagraph();
      const level = trimmed.match(/^(#{1,3})/)?.[1].length || 2;
      const content = trimmed.replace(/^#{1,3}\s+/, '');
      sections.push({
        type: 'heading',
        level: Math.min(level, 3) as 1 | 2 | 3,
        content,
        id: generateId()
      });
      continue;
    }
    
    // Add to current paragraph, preserving original line structure
    currentParagraph.push(line);
  }
  
  // Flush final paragraph
  flushParagraph();
  
  return {
    version: '1.0',
    sections: sections.filter(section => 
      section.content?.trim() || (section.items && section.items.length > 0)
    ),
    metadata: {
      structureQuality: 1.0, // High quality because we preserved original
      processingMethod: 'preserved',
      extractedAt: new Date().toISOString()
    }
  };
};

// Validate document structure is well-formed (not a text blob)
export const isWellStructuredDocument = (docJson: DocumentJson): boolean => {
  // Must have multiple sections or at least one heading
  const hasStructure = docJson.sections.length > 1 || 
    docJson.sections.some(section => section.type === 'heading');
  
  // Must not have excessively long paragraphs (indicating text blob)
  const hasReasonableParagraphs = docJson.sections
    .filter(section => section.type === 'paragraph')
    .every(section => (section.content?.length || 0) < 1000);
  
  return hasStructure && hasReasonableParagraphs;
};