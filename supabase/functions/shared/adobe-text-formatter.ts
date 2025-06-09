/**
 * Adobe Text Formatting Module
 * Handles post-processing of extracted text to improve readability and structure
 */

interface DocumentSection {
  type: 'heading' | 'paragraph' | 'list';
  level?: 1 | 2 | 3;
  content?: string;
  items?: string[];
  id: string;
  formatting?: {
    bold?: boolean;
  };
}

interface DocumentJson {
  version: '1.0';
  sections: DocumentSection[];
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

// Convert plain text to structured JSON with formatting rules applied
const textToJson = (text: string): DocumentJson => {
  const cleanedText = applyFormattingRules(text);
  const lines = cleanedText.split('\n');
  const sections: DocumentSection[] = [];
  
  let currentParagraph: string[] = [];
  
  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const content = currentParagraph.join('\n').trim();
      if (content) {
        sections.push({
          type: 'paragraph',
          content: applyFormattingRules(content),
          id: generateId()
        });
      }
      currentParagraph = [];
    }
  };
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) {
      if (currentParagraph.length > 0) {
        currentParagraph.push('');
      }
      continue;
    }
    
    // Check for headings (# ## ### only - enforce H1, H2, H3 limit)
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
    
    // Check for bullet points (normalize all to "-")
    if (trimmed.match(/^[-•*]\s+/)) {
      flushParagraph();
      
      // Collect consecutive bullet points
      const listItems: string[] = [];
      let i = lines.indexOf(line);
      
      while (i < lines.length) {
        const currentLine = lines[i].trim();
        if (currentLine.match(/^[-•*]\s+/)) {
          const cleanItem = applyFormattingRules(currentLine.replace(/^[-•*]\s+/, ''));
          if (cleanItem) {
            listItems.push(cleanItem);
          }
          i++;
        } else if (currentLine === '') {
          i++;
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
    
    // Convert to structured JSON
    const documentJson = textToJson(rawText);
    console.log(`[Formatter] Created ${documentJson.sections.length} sections`);
    
    // Check if document is well-structured
    const isWellStructured = isWellStructuredDocument(documentJson);
    console.log(`[Formatter] Document structure quality: ${isWellStructured ? 'good' : 'basic'}`);
    
    // Convert back to formatted text
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
