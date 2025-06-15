import { DocumentJson, DocumentSection } from './documentJsonUtils';

// Enhanced JSON to HTML conversion with formatting preservation
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
        const formattedContent = section.formatting?.bold 
          ? `<strong>${escapeHtml(content)}</strong>`
          : escapeHtml(content);
        htmlParts.push(`<h${level} data-section-id="${section.id}">${formattedContent}</h${level}>`);
        break;
        
      case 'paragraph':
        if (section.content) {
          // Preserve line breaks and paragraph indentation
          const contentLines = section.content.split('\n');
          let processedContent = '';
          
          // Handle indented paragraphs by preserving leading spaces as non-breaking spaces
          const processedLines = contentLines.map(line => {
            const leadingSpaces = line.match(/^(\s*)/)?.[1] || '';
            const trimmedLine = line.trim();
            if (!trimmedLine) return '';
            
            // Convert leading spaces to non-breaking spaces for indentation
            const indentation = '&nbsp;'.repeat(leadingSpaces.length);
            return indentation + escapeHtml(trimmedLine);
          }).filter(line => line.length > 0);
          
          processedContent = processedLines.join('<br>');
          
          // Apply bold formatting if specified
          if (section.formatting?.bold) {
            processedContent = `<strong>${processedContent}</strong>`;
          }
          
          htmlParts.push(`<p data-section-id="${section.id}">${processedContent}</p>`);
        }
        break;
        
      case 'list':
        if (section.items && section.items.length > 0) {
          const listItems = section.items
            .map((item, index) => {
              const formattedItem = section.formatting?.bold 
                ? `<strong>${escapeHtml(item)}</strong>`
                : escapeHtml(item);
              return `<li data-item-index="${index}">${formattedItem}</li>`;
            })
            .join('');
          htmlParts.push(`<ul data-section-id="${section.id}">${listItems}</ul>`);
        }
        break;
    }
  }
  
  const result = htmlParts.length > 0 ? htmlParts.join('') : '<p><br></p>';
  console.log('[jsonHtmlConverters] jsonToHtml result:', { 
    htmlLength: result.length, 
    preview: result.substring(0, 100),
    hasBoldElements: result.includes('<strong>')
  });
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
        const headingHasBold = element.querySelector('strong, b') !== null;
        // Extract clean heading content without any formatting markup
        let headingContent = element.innerHTML
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1')
          .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1')
          .replace(/<[^>]*>/g, '');
        headingContent = unescapeHtml(headingContent).trim();
        
        if (headingContent) {
          const headingSection: DocumentSection = {
            type: 'heading',
            level,
            content: headingContent,
            id: sectionId
          };
          if (headingHasBold) {
            headingSection.formatting = { bold: true };
          }
          sections.push(headingSection);
        }
        break;
        
      case 'p':
        // Handle paragraphs with <br> tags for line breaks and bold formatting
        const innerHTML = element.innerHTML || '';
        if (innerHTML.trim()) {
          const hasBold = element.querySelector('strong, b') !== null;
          
          // Clean and preserve paragraph content - PRESERVE INDENTATION
          let contentWithNewlines = innerHTML
            .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1') // Remove bold tags but preserve content
            .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1') // Remove bold tags but preserve content  
            .replace(/<(?!br\s*\/?>)[^>]*>/g, '') // Remove HTML tags except <br>
            .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to newlines
            .replace(/&nbsp;/g, ' ') // Convert non-breaking spaces back to regular spaces AFTER line processing
            .replace(/\s+$/g, '') // Only trim trailing whitespace, preserve leading spaces for indentation
            .replace(/\*\*/g, ''); // Remove any double asterisks from markdown
          
          if (contentWithNewlines) {
            const paragraphSection: DocumentSection = {
              type: 'paragraph',
              content: contentWithNewlines,
              id: sectionId
            };
            if (hasBold) {
              paragraphSection.formatting = { bold: true };
            }
            sections.push(paragraphSection);
          }
        }
        break;
        
      case 'ul':
        const listHasBold = element.querySelector('strong, b') !== null;
        const listItems = Array.from(element.querySelectorAll('li'))
          .map(li => {
            // Extract clean text content 
            const liContent = li.innerHTML
              .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1')
              .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1')
              .replace(/<[^>]*>/g, '')
              .replace(/\*\*/g, ''); // Remove any double asterisks
            return unescapeHtml(liContent).trim();
          })
          .filter(item => item.length > 0);
        
        if (listItems.length > 0) {
          const listSection: DocumentSection = {
            type: 'list',
            items: listItems,
            id: sectionId
          };
          if (listHasBold) {
            listSection.formatting = { bold: true };
          }
          sections.push(listSection);
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

// Utility functions - FIXED: Don't double-escape HTML content
const escapeHtml = (text: string): string => {
  // Don't escape if text already contains HTML entities or tags
  if (text.includes('&') || text.includes('<') || text.includes('>')) {
    return text;
  }
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