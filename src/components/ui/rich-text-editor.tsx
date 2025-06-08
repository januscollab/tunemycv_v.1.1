import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Bold, Heading1, Heading2, Heading3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const lastValueRef = useRef(value);

  // Convert markdown-style text to formatted HTML
  const textToHtml = useCallback((text: string): string => {
    const lines = text.split('\n');
    const htmlLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (!trimmed) {
        htmlLines.push('<br>');
        continue;
      }
      
      // Handle headings
      if (trimmed.match(/^#{1,3}\s+/)) {
        const level = trimmed.match(/^(#{1,3})/)?.[1].length;
        const content = trimmed.replace(/^#{1,3}\s+/, '');
        const headingClass = level === 1 ? 'text-xl font-bold mb-4' 
                           : level === 2 ? 'text-lg font-semibold mb-3'
                           : 'text-base font-medium mb-2';
        htmlLines.push(`<h${level} class="${headingClass}">${content}</h${level}>`);
        continue;
      }
      
      // Handle bullet points
      if (trimmed.match(/^[-•*]\s+/)) {
        const content = trimmed.replace(/^[-•*]\s+/, '');
        htmlLines.push(`<li class="ml-4">${content}</li>`);
        continue;
      }
      
      // Regular paragraphs - handle bold formatting
      let formattedLine = line;
      formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      htmlLines.push(`<p class="mb-4 leading-relaxed">${formattedLine}</p>`);
    }
    
    // Wrap consecutive list items in ul tags
    const processedLines: string[] = [];
    let inList = false;
    
    for (const line of htmlLines) {
      if (line.startsWith('<li')) {
        if (!inList) {
          processedLines.push('<ul class="mb-4 list-disc list-inside">');
          inList = true;
        }
        processedLines.push(line);
      } else {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(line);
      }
    }
    
    if (inList) {
      processedLines.push('</ul>');
    }
    
    return processedLines.join('');
  }, []);

  // Convert HTML back to markdown-style text
  const htmlToText = useCallback((html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        const textContent = element.textContent || '';
        
        switch (tagName) {
          case 'h1':
            return `# ${textContent}`;
          case 'h2':
            return `## ${textContent}`;
          case 'h3':
            return `### ${textContent}`;
          case 'li':
            return `• ${textContent}`;
          case 'strong':
          case 'b':
            return `**${textContent}**`;
          case 'em':
          case 'i':
            return `*${textContent}*`;
          case 'p':
            return textContent;
          case 'br':
            return '\n';
          case 'ul':
          case 'ol':
            return Array.from(element.children).map(child => processNode(child)).join('\n');
          default:
            return Array.from(element.childNodes).map(child => processNode(child)).join('');
        }
      }
      
      return '';
    };
    
    const sections: string[] = [];
    Array.from(tempDiv.childNodes).forEach(node => {
      const processed = processNode(node);
      if (processed.trim()) {
        sections.push(processed);
      }
    });
    
    return sections.join('\n\n');
  }, []);

  // Initialize editor content only once
  useEffect(() => {
    if (editorRef.current && lastValueRef.current !== value) {
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      
      editorRef.current.innerHTML = textToHtml(value);
      lastValueRef.current = value;
      
      // Restore cursor position if possible
      if (range && editorRef.current.contains(range.startContainer)) {
        try {
          selection?.removeAllRanges();
          selection?.addRange(range);
        } catch (e) {
          // Ignore range restoration errors
        }
      }
    }
  }, [value, textToHtml]);

  // Debounced onChange with proper timing
  const debouncedOnChange = useCallback(
    debounce((text: string) => {
      onChange(text);
    }, 500),
    [onChange]
  );

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = htmlToText(html);
      debouncedOnChange(text);
    }
  }, [htmlToText, debouncedOnChange]);

  // Handle selection changes for contextual toolbar
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setToolbarPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + window.scrollY + 8
        });
        setIsToolbarVisible(true);
      }
    } else {
      setIsToolbarVisible(false);
    }
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl+Z for undo (browser native)
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('undo');
      handleInput();
      return;
    }
    
    // Ctrl+Y or Ctrl+Shift+Z for redo
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      document.execCommand('redo');
      handleInput();
      return;
    }
    
    // Ctrl+B for bold
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold');
      handleInput();
      return;
    }
    
    // Ctrl+I for italic
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      document.execCommand('italic');
      handleInput();
      return;
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
    
    // Enter key handling for lists
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        const listItem = container.nodeType === Node.TEXT_NODE 
          ? container.parentElement?.closest('li') 
          : (container as Element).closest('li');
        
        if (listItem && listItem.textContent?.trim() === '') {
          // Exit list on empty list item
          e.preventDefault();
          document.execCommand('outdent');
          handleInput();
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

  // Event listeners for selection
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  // Cleanup debounced function
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  // Simple debounce helper
  function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
    let timeoutId: NodeJS.Timeout;
    const debounced = (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
    debounced.cancel = () => clearTimeout(timeoutId);
    return debounced;
  }

  return (
    <div className={cn("relative border rounded-md", className)}>
      {/* Contextual Toolbar */}
      {isToolbarVisible && (
        <div 
          className="fixed bg-background border rounded-md shadow-lg p-1 flex items-center space-x-1 z-50"
          style={{
            left: `${toolbarPosition.x}px`,
            top: `${toolbarPosition.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
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
        className="p-4 min-h-[200px] outline-none prose prose-sm max-w-none focus:ring-2 focus:ring-primary/20"
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