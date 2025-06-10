import { DocumentJson, DocumentSection } from './documentJsonUtils';

// Enhanced JSON to HTML conversion with stability optimizations
export const jsonToHtml = (json: DocumentJson): string => {
  const htmlParts: string[] = [];
  
  for (const section of json.sections) {
    switch (section.type) {
      case 'heading':
        const level = Math.min(section.level || 1, 3);
        const content = section.content || '';
        htmlParts.push(`<h${level} data-section-id="${section.id}">${escapeHtml(content)}</h${level}>`);
        break;
        
      case 'paragraph':
        if (section.content) {
          htmlParts.push(`<p data-section-id="${section.id}">${escapeHtml(section.content)}</p>`);
        }
        break;
        
      case 'list':
        if (section.items && section.items.length > 0) {
          const listItems = section.items
            .map((item, index) => `<li data-item-index="${index}">${escapeHtml(item)}</li>`)
            .join('');
          htmlParts.push(`<ul data-section-id="${section.id}">${listItems}</ul>`);
        }
        break;
    }
  }
  
  return htmlParts.length > 0 ? htmlParts.join('') : '<p><br></p>';
};

// Enhanced HTML to JSON conversion with improved parsing
export const htmlToJson = (html: string): DocumentJson => {
  // Create a temporary DOM element for parsing
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const sections: DocumentSection[] = [];
  const elements = Array.from(tempDiv.children);
  
  for (const element of elements) {
    const sectionId = element.getAttribute('data-section-id') || generateSectionId();
    
    switch (element.tagName.toLowerCase()) {
      case 'h1':
      case 'h2':
      case 'h3':
        const level = parseInt(element.tagName.charAt(1)) as 1 | 2 | 3;
        sections.push({
          type: 'heading',
          level,
          content: unescapeHtml(element.textContent || ''),
          id: sectionId
        });
        break;
        
      case 'p':
        const paragraphContent = unescapeHtml(element.textContent || '').trim();
        if (paragraphContent && paragraphContent !== '') {
          sections.push({
            type: 'paragraph',
            content: paragraphContent,
            id: sectionId
          });
        }
        break;
        
      case 'ul':
        const listItems = Array.from(element.querySelectorAll('li'))
          .map(li => unescapeHtml(li.textContent || '').trim())
          .filter(item => item.length > 0);
        
        if (listItems.length > 0) {
          sections.push({
            type: 'list',
            items: listItems,
            id: sectionId
          });
        }
        break;
    }
  }
  
  return {
    version: '1.0',
    sections: sections.filter(section => 
      section.content?.trim() || (section.items && section.items.length > 0)
    )
  };
};

// Utility functions
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const unescapeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
};

const generateSectionId = (): string => {
  return `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Validation function to check HTML compatibility
export const validateHtmlCompatibility = (html: string): boolean => {
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.children.length > 0;
  } catch {
    return false;
  }
};

// Convert HTML back to plain text for fallback scenarios
export const htmlToPlainText = (html: string): string => {
  return html
    .replace(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/g, '$1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n')
    .replace(/<ul[^>]*>|<\/ul>/g, '')
    .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
};