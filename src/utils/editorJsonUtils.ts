export interface TextFormatting {
  bold?: boolean;
}

export interface FormattedText {
  text: string;
  formatting?: TextFormatting;
}

export interface DocumentSection {
  type: 'heading' | 'paragraph' | 'list';
  level?: 1 | 2 | 3;
  content?: string;
  formattedContent?: FormattedText[];
  items?: string[];
  formattedItems?: FormattedText[][];
  id: string;
}

export interface DocumentJson {
  version: '1.0';
  sections: DocumentSection[];
}

// Generate unique ID for sections
const generateId = (): string => {
  return `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Convert plain text to structured JSON for rich text editor
export const editorTextToJson = (text: string): DocumentJson => {
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
    
    // Skip empty lines
    if (!trimmed) {
      if (currentParagraph.length > 0) {
        currentParagraph.push('');
      }
      continue;
    }
    
    // Check for headings (# ## ###)
    if (trimmed.match(/^#{1,3}\s+/)) {
      flushParagraph();
      const level = trimmed.match(/^(#{1,3})/)?.[1].length as 1 | 2 | 3;
      const content = trimmed.replace(/^#{1,3}\s+/, '');
      sections.push({
        type: 'heading',
        level,
        content,
        id: generateId()
      });
      continue;
    }
    
    // Check for bullet points (- • *)
    if (trimmed.match(/^[-•*]\s+/)) {
      flushParagraph();
      
      // Collect consecutive bullet points
      const listItems: string[] = [];
      let i = lines.indexOf(line);
      
      while (i < lines.length) {
        const currentLine = lines[i].trim();
        if (currentLine.match(/^[-•*]\s+/)) {
          listItems.push(currentLine.replace(/^[-•*]\s+/, ''));
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
    sections
  };
};

// Convert structured JSON back to plain text for rich text editor
export const editorJsonToText = (docJson: DocumentJson): string => {
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
            textLines.push(`• ${item}`);
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

// Validate JSON structure
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