import { DocumentJson, DocumentSection } from './documentJsonUtils';

// Enhanced JSON to HTML conversion with stability optimizations
export const jsonToHtml = (json: DocumentJson): string => {
  console.log('[jsonHtmlConverters] jsonToHtml called:', { sections: json.sections?.length || 0 });
  
  if (!json || !json.sections || !Array.isArray(json.sections)) {
    console.warn('[jsonHtmlConverters] Invalid DocumentJson structure:', json);
    return '<p><br></p>';
  }

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
          // Preserve line breaks within paragraphs by converting newlines to <br> tags
          const contentWithBreaks = section.content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('<br>');
          htmlParts.push(`<p data-section-id="${section.id}">${escapeHtml(contentWithBreaks)}</p>`);
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
  
  const result = htmlParts.length > 0 ? htmlParts.join('') : '<p><br></p>';
  console.log('[jsonHtmlConverters] jsonToHtml result:', { htmlLength: result.length, preview: result.substring(0, 100) });
  return result;
};

// Enhanced HTML to JSON conversion with improved parsing and <br> handling
export const htmlToJson = (html: string): DocumentJson => {
  console.log('[jsonHtmlConverters] htmlToJson called:', { htmlLength: html.length, preview: html.substring(0, 100) });
  
  if (!html || typeof html !== 'string') {
    console.warn('[jsonHtmlConverters] Invalid HTML input:', html);
    return { version: '1.0' as const, sections: [] };
  }

  // First, convert <br> tags to paragraph breaks for better structure
  const normalizedHtml = html
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '</p><p>') // Double <br> to paragraph break
    .replace(/<p[^>]*>\s*<br\s*\/?>/gi, '<p>') // Remove <br> at start of paragraph
    .replace(/<br\s*\/?>\s*<\/p>/gi, '</p>') // Remove <br> at end of paragraph
    .replace(/<br\s*\/?>/gi, '\n'); // Single <br> to newline within paragraphs

  // Create a temporary DOM element for parsing
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = normalizedHtml;
  
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
        let paragraphContent = element.innerHTML;
        // Handle internal newlines from converted <br> tags
        paragraphContent = paragraphContent.replace(/\n+/g, '\n').trim();
        const textContent = unescapeHtml(element.textContent || '').trim();
        
        if (textContent && textContent !== '') {
          // Split on multiple newlines to create separate paragraphs
          const paragraphs = textContent.split(/\n\s*\n/).filter(p => p.trim());
          
          if (paragraphs.length > 1) {
            // Multiple paragraphs detected, create separate sections
            paragraphs.forEach(para => {
              if (para.trim()) {
                sections.push({
                  type: 'paragraph',
                  content: para.trim(),
                  id: generateSectionId()
                });
              }
            });
          } else {
            // Single paragraph, preserve internal line breaks
            sections.push({
              type: 'paragraph',
              content: textContent.replace(/\n/g, ' '), // Convert internal breaks to spaces for readability
              id: sectionId
            });
          }
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
  
  const filteredSections = sections.filter(section => 
    section.content?.trim() || (section.items && section.items.length > 0)
  );
  
  const result: DocumentJson = {
    version: '1.0' as const,
    sections: filteredSections
  };
  
  console.log('[jsonHtmlConverters] htmlToJson result:', { sections: result.sections.length });
  return result;
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
  console.log('[jsonHtmlConverters] validateHtmlCompatibility called:', { htmlLength: html?.length || 0 });
  
  if (!html || typeof html !== 'string') {
    console.warn('[jsonHtmlConverters] Invalid HTML input for validation');
    return false;
  }
  
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const isValid = tempDiv.children.length > 0 || html.trim() === '<p><br></p>';
    console.log('[jsonHtmlConverters] HTML validation result:', { isValid, childrenCount: tempDiv.children.length });
    return isValid;
  } catch (error) {
    console.error('[jsonHtmlConverters] HTML validation error:', error);
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