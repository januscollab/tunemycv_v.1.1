import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Bold, Heading1, Heading2, Heading3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DocumentJson, DocumentSection, FormattedText, textToJson, jsonToText } from '@/utils/documentJsonUtils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  autoFocus = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [documentJson, setDocumentJson] = useState<DocumentJson>(() => textToJson(value));
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);

  // Convert DocumentJson to HTML for display
  const documentToHtml = useCallback((doc: DocumentJson): string => {
    return doc.sections.map(section => {
      switch (section.type) {
        case 'heading':
          const headingTag = `h${section.level || 1}`;
          const headingClass = section.level === 1 ? 'text-xl font-bold mb-4' 
                            : section.level === 2 ? 'text-lg font-semibold mb-3'
                            : 'text-base font-medium mb-2';
          return `<${headingTag} class="${headingClass}" data-section-id="${section.id}">${section.content || ''}</${headingTag}>`;
        
        case 'paragraph':
          return `<p class="mb-4 leading-relaxed" data-section-id="${section.id}">${section.content || ''}</p>`;
        
        case 'list':
          const listItems = section.items?.map(item => `<li class="ml-4">${item}</li>`).join('') || '';
          return `<ul class="mb-4 list-disc list-inside" data-section-id="${section.id}">${listItems}</ul>`;
        
        default:
          return '';
      }
    }).join('');
  }, []);

  // Convert HTML back to text for onChange
  const htmlToText = useCallback((html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Extract sections and convert back to markdown-like text
    const sections: string[] = [];
    const children = Array.from(tempDiv.children);
    
    children.forEach(child => {
      if (child.tagName === 'H1') {
        sections.push(`# ${child.textContent}`);
      } else if (child.tagName === 'H2') {
        sections.push(`## ${child.textContent}`);
      } else if (child.tagName === 'H3') {
        sections.push(`### ${child.textContent}`);
      } else if (child.tagName === 'P') {
        sections.push(child.textContent || '');
      } else if (child.tagName === 'UL') {
        const listItems = Array.from(child.children).map(li => `• ${li.textContent}`);
        sections.push(...listItems);
      }
    });
    
    return sections.filter(s => s.trim()).join('\n\n');
  }, []);

  // Update editor content when value changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== documentToHtml(documentJson)) {
      const newDoc = textToJson(value);
      setDocumentJson(newDoc);
      editorRef.current.innerHTML = documentToHtml(newDoc);
    }
  }, [value, documentJson, documentToHtml]);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = htmlToText(html);
      const newDoc = textToJson(text);
      setDocumentJson(newDoc);
      onChange(text);
    }
  }, [htmlToText, onChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl+B for bold
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold');
      handleInput();
    }
    
    // Tab for list creation
    if (e.key === 'Tab') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        e.preventDefault();
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        
        if (selectedText) {
          // Convert selected lines to list
          const lines = selectedText.split('\n');
          const listItems = lines.map(line => `• ${line.trim()}`).join('\n');
          
          range.deleteContents();
          range.insertNode(document.createTextNode(listItems));
          handleInput();
        }
      }
    }
    
    // Auto-format markdown-style headings
    if (e.key === ' ') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        
        if (container.nodeType === Node.TEXT_NODE) {
          const text = container.textContent || '';
          const beforeCursor = text.substring(0, range.startOffset);
          
          // Check for heading patterns
          if (beforeCursor === '#') {
            e.preventDefault();
            range.setStart(container, 0);
            range.deleteContents();
            document.execCommand('formatBlock', false, 'h1');
            handleInput();
          } else if (beforeCursor === '##') {
            e.preventDefault();
            range.setStart(container, 0);
            range.deleteContents();
            document.execCommand('formatBlock', false, 'h2');
            handleInput();
          } else if (beforeCursor === '###') {
            e.preventDefault();
            range.setStart(container, 0);
            range.deleteContents();
            document.execCommand('formatBlock', false, 'h3');
            handleInput();
          }
        }
      }
    }
  }, [handleInput]);

  // Toolbar actions
  const insertHeading = (level: 1 | 2 | 3) => {
    document.execCommand('formatBlock', false, `h${level}`);
    handleInput();
    editorRef.current?.focus();
  };

  const toggleBold = () => {
    document.execCommand('bold');
    handleInput();
    editorRef.current?.focus();
  };

  const insertList = () => {
    document.execCommand('insertUnorderedList');
    handleInput();
    editorRef.current?.focus();
  };

  // Focus management
  const handleFocus = () => {
    setIsToolbarVisible(true);
  };

  const handleBlur = () => {
    // Delay hiding toolbar to allow toolbar clicks
    setTimeout(() => setIsToolbarVisible(false), 150);
  };

  return (
    <div className={cn("relative border rounded-md", className)}>
      {/* Toolbar */}
      {isToolbarVisible && (
        <div className="absolute top-2 left-2 bg-background border rounded-md shadow-lg p-1 flex items-center space-x-1 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(1)}
            className="h-8 w-8 p-0"
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(2)}
            className="h-8 w-8 p-0"
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(3)}
            className="h-8 w-8 p-0"
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleBold}
            className="h-8 w-8 p-0"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertList}
            className="h-8 w-8 p-0"
            title="List"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="p-4 min-h-[200px] outline-none prose prose-sm max-w-none"
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
        autoFocus={autoFocus}
        style={{
          wordBreak: 'break-word'
        }}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
        `
      }} />
    </div>
  );
};