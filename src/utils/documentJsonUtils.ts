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
    processingMethod?: 'professional' | 'legacy';
    extractedAt?: string;
  };
}

// Generate unique ID for sections
const generateId = (): string => {
  return `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Apply JSON formatting rules - strip unwanted formatting
const applyFormattingRules = (text: string): string => {
  return text
    // Remove italics, underlines, and other formatting
    .replace(/[_*~`]+/g, '')
    // Normalize bullets to "-" only
    .replace(/[•·‐−–—]/g, '-')
    // Remove multiple font information (keep single font type)
    .replace(/font-family:[^;]+;?/gi, '')
    .replace(/font-size:[^;]+;?/gi, '')
    // Clean up excessive whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

// Enhanced CV text processing with intelligent structure recognition
export const textToJson = (text: string): DocumentJson => {
  console.log('[documentJsonUtils] Starting professional text processing');
  
  // Use professional text processor for better structure detection
  const normalizedText = ProfessionalTextProcessor.normalizeText(text);
  const structureAnalysis = ProfessionalTextProcessor.structureCVContent(normalizedText);
  
  if (structureAnalysis.quality > 0.6) {
    console.log('[documentJsonUtils] Using professional structure analysis');
    return professionalTextToJson(structureAnalysis);
  }
  
  console.log('[documentJsonUtils] Falling back to legacy processing');
  return legacyTextToJson(text);
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
export const enforceFormattingRules = (docJson: DocumentJson): DocumentJson => {
  return {
    ...docJson,
    sections: docJson.sections.map(section => {
      const cleanedSection = { ...section };
      
      // Apply formatting rules to content
      if (cleanedSection.content) {
        cleanedSection.content = applyFormattingRules(cleanedSection.content);
      }
      
      // Apply formatting rules to list items
      if (cleanedSection.items) {
        cleanedSection.items = cleanedSection.items
          .map(item => applyFormattingRules(item))
          .filter(item => item.trim().length > 0);
      }
      
      // Enforce heading level limits (H1, H2, H3 only)
      if (cleanedSection.type === 'heading' && cleanedSection.level) {
        cleanedSection.level = Math.min(cleanedSection.level, 3) as 1 | 2 | 3;
      }
      
      // Remove any unsupported formatting
      delete cleanedSection.formatting;
      
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
  return ProfessionalTextProcessor.beautifyJSON(docJson);
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

// Enhanced text generation with improved formatting
export const generateFormattedText = (docJson: DocumentJson): string => {
  const textLines: string[] = [];
  
  for (const section of docJson.sections) {
    switch (section.type) {
      case 'heading':
        // Add proper spacing before headings (except first)
        if (textLines.length > 0) {
          textLines.push('');
        }
        const hashes = '#'.repeat(section.level || 1);
        textLines.push(`${hashes} ${section.content}`);
        textLines.push(''); // Empty line after heading
        break;
        
      case 'paragraph':
        if (section.content) {
          // Split long paragraphs into readable chunks
          const paragraphLines = section.content.split('\n').filter(line => line.trim());
          textLines.push(...paragraphLines);
          textLines.push(''); // Empty line after paragraph
        }
        break;
        
      case 'list':
        if (section.items) {
          for (const item of section.items) {
            textLines.push(`- ${item}`); // Use "-" bullets consistently
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