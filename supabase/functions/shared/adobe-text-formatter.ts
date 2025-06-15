/**
 * Adobe Text Formatting Module
 * Handles post-processing of extracted text to improve readability and structure
 * Uses comprehensive documentJsonUtils for consistent formatting rules
 */

// Import types and utilities for comprehensive JSON formatting
interface DocumentSection {
  type: 'heading' | 'paragraph' | 'list';
  level?: 1 | 2 | 3;
  content?: string;
  items?: string[];
  id: string;
  formatting?: {
    bold?: boolean; // Only bold formatting allowed
  };
  confidence?: number;
}

interface DocumentJson {
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

// Comprehensive text to JSON conversion using advanced formatting rules
const textToJson = (text: string): DocumentJson => {
  const cleanedText = applyFormattingRules(text);
  const lines = cleanedText.split('\n');
  const sections: DocumentSection[] = [];
  
  let currentParagraph: string[] = [];
  
  // Enhanced CV section detection patterns
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
        // Enhanced paragraph chunking for better readability
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
    
    // Check for explicit markdown headings (# ## ### only - enforce H1, H2, H3 limit)
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
      structureQuality: 0.8, // Higher quality for Adobe processing
      processingMethod: 'professional',
      extractedAt: new Date().toISOString()
    }
  };
};

// Apply comprehensive formatting rules with enhanced processing
const enforceFormattingRules = (docJson: DocumentJson): DocumentJson => {
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
      
      // Only preserve bold formatting, remove all others
      if (cleanedSection.formatting) {
        cleanedSection.formatting = {
          bold: cleanedSection.formatting.bold || false
        };
      }
      
      return cleanedSection;
    }).filter(section => 
      // Remove empty sections
      section.content?.trim() || (section.items && section.items.length > 0)
    )
  };
};

// Convert structured JSON back to plain text
const jsonToText = (docJson: DocumentJson): string => {
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

// Validate document structure is well-formed (not a text blob)
const isWellStructuredDocument = (docJson: DocumentJson): boolean => {
  // Must have multiple sections or at least one heading
  const hasStructure = docJson.sections.length > 1 || 
    docJson.sections.some(section => section.type === 'heading');
  
  // Must not have excessively long paragraphs (indicating text blob)
  const hasReasonableParagraphs = docJson.sections
    .filter(section => section.type === 'paragraph')
    .every(section => (section.content?.length || 0) < 1000);
  
  return hasStructure && hasReasonableParagraphs;
};

/**
 * Main formatting function - processes raw extracted text into structured format
 * @param rawText - Raw text extracted from Adobe PDF
 * @param originalFileName - Original filename for logging
 * @returns Object containing both raw and formatted text, plus metadata
 */
export async function formatExtractedText(
  rawText: string, 
  originalFileName: string
): Promise<{
  rawText: string;
  formattedText: string;
  documentJson: DocumentJson;
  isWellStructured: boolean;
  wordCount: number;
  formattingApplied: boolean;
}> {
  try {
    console.log(`[Formatter] Processing text for: ${originalFileName}`);
    
    // Basic validation
    if (!rawText || rawText.trim().length === 0) {
      throw new Error('No text content to format');
    }
    
    const wordCount = rawText.split(/\s+/).length;
    console.log(`[Formatter] Input text: ${wordCount} words`);
    
    // Convert to structured JSON with comprehensive formatting rules
    const rawDocumentJson = textToJson(rawText);
    console.log(`[Formatter] Created ${rawDocumentJson.sections.length} sections`);
    
    // Apply comprehensive formatting rules (bold only, H1-H3, single font, "-" bullets)
    const documentJson = enforceFormattingRules(rawDocumentJson);
    console.log(`[Formatter] Applied formatting rules, final sections: ${documentJson.sections.length}`);
    
    // Check if document is well-structured
    const isWellStructured = isWellStructuredDocument(documentJson);
    console.log(`[Formatter] Document structure quality: ${isWellStructured ? 'good' : 'basic'}`);
    
    // Convert back to formatted text (JSON is now the master)
    const formattedText = jsonToText(documentJson);
    console.log(`[Formatter] Generated formatted text: ${formattedText.split(/\s+/).length} words`);
    
    return {
      rawText,
      formattedText,
      documentJson,
      isWellStructured,
      wordCount,
      formattingApplied: true
    };
    
  } catch (error) {
    console.error(`[Formatter] Error processing text for ${originalFileName}:`, error);
    
    // Return raw text if formatting fails
    return {
      rawText,
      formattedText: rawText, // Fallback to raw text
      documentJson: { version: '1.0', sections: [] },
      isWellStructured: false,
      wordCount: rawText.split(/\s+/).length,
      formattingApplied: false
    };
  }
}

/**
 * Utility function to detect if text needs formatting
 * @param text - Text to analyze
 * @returns true if text appears to be unformatted blob
 */
export function needsFormatting(text: string): boolean {
  const lines = text.split('\n');
  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  
  // Consider text needing formatting if:
  // - Very few line breaks (long paragraphs)
  // - No obvious structure markers
  // - Very long average line length
  return avgLineLength > 100 || 
         lines.length < 10 || 
         !text.includes('\n\n');
}
