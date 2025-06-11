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
          // Don't escape the <br> tags we just added
          const escapedContent = escapeHtml(contentWithBreaks).replace(/&lt;br&gt;/g, '<br>');
          htmlParts.push(`<p data-section-id="${section.id}">${escapedContent}</p>`);
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

// Enhanced HTML to JSON conversion with improved round-trip consistency
export const htmlToJson = (html: string): DocumentJson => {
  console.log('[jsonHtmlConverters] htmlToJson called:', { htmlLength: html.length, preview: html.substring(0, 100) });
  
  if (!html || typeof html !== 'string') {
    console.warn('[jsonHtmlConverters] Invalid HTML input:', html);
    return { version: '1.0' as const, sections: [] };
  }

  // Clean up HTML while preserving structure but keep intentional <br> tags
  const cleanHtml = html
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '</p><p>') // Double <br> becomes paragraph break
    .replace(/<p[^>]*>\s*<br\s*\/?>/gi, '<p>') // Remove <br> at start of <p>
    .replace(/<br\s*\/?>\s*<\/p>/gi, '</p>') // Remove <br> at end of <p>
    .replace(/<p[^>]*>\s*<\/p>/gi, '') // Remove empty paragraphs
    .replace(/<p[^>]*>\s*(&nbsp;|\u00A0|\s)*\s*<\/p>/gi, ''); // Remove paragraphs with only whitespace

  // Create a temporary DOM element for parsing
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanHtml;
  
  const sections: DocumentSection[] = [];
  const elements = Array.from(tempDiv.children);
  
  for (const element of elements) {
    const sectionId = element.getAttribute('data-section-id') || generateSectionId();
    
    switch (element.tagName.toLowerCase()) {
      case 'h1':
      case 'h2':
      case 'h3':
        const level = parseInt(element.tagName.charAt(1)) as 1 | 2 | 3;
        const headingContent = unescapeHtml(element.textContent || '').trim();
        if (headingContent) {
          sections.push({
            type: 'heading',
            level,
            content: headingContent,
            id: sectionId
          });
        }
        break;
        
      case 'p':
        // Handle paragraphs with <br> tags for line breaks
        const innerHTML = element.innerHTML || '';
        if (innerHTML.trim()) {
          // Convert <br> tags back to newlines for consistent storage
          const contentWithNewlines = innerHTML
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '') // Remove any other HTML tags
            .trim();
          
          if (contentWithNewlines) {
            sections.push({
              type: 'paragraph',
              content: contentWithNewlines,
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
  
  const result: DocumentJson = {
    version: '1.0' as const,
    sections: sections.filter(section => 
      section.content?.trim() || (section.items && section.items.length > 0)
    )
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
    .replace(/<p[^>]*>(.*?)<\/p>/g, (match, content) => {
      // Convert <br> to newlines in paragraph content
      return content.replace(/<br\s*\/?>/g, '\n') + '\n';
    })
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
};