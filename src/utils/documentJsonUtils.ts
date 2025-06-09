export interface DocumentSection {
  type: 'heading' | 'paragraph' | 'list';
  level?: 1 | 2 | 3;
  content?: string;
  items?: string[];
  id: string;
  formatting?: {
    bold?: boolean; // Only bold formatting allowed
  };
}

export interface DocumentJson {
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
export const textToJson = (text: string): DocumentJson => {
  const cleanedText = applyFormattingRules(text);
  const lines = cleanedText.split('\n');
  const sections: DocumentSection[] = [];
  
  let currentParagraph: string[] = [];
  
  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const content = currentParagraph.join('\n').trim();
      if (content) {
        // Split very long paragraphs into smaller chunks for better readability
        if (content.length > 500) {
          const sentences = content.split(/[.!?]+\s+/);
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
              currentChunk += (currentChunk ? '. ' : '') + sentence;
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
  return JSON.stringify(docJson, null, 2);
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