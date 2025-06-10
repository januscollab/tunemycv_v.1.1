import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';
import { WandSparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DocumentJson, 
  jsonToText, 
  textToJson,
  updateDocumentContent,
  generateFormattedText 
} from '@/utils/documentJsonUtils';

interface AIContext {
  selectedText: string;
  selectionRange: { index: number; length: number };
  fullText: string;
}

interface RichTextEditorProps {
  documentJson: DocumentJson;
  onContentChange: (json: DocumentJson, text: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  showAIFeatures?: boolean;
  onAIRequest?: (context: AIContext, action: 'improve' | 'rewrite' | 'tone') => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  documentJson,
  onContentChange,
  className = '',
  placeholder = 'Start editing...',
  readOnly = false,
  showAIFeatures = true,
  onAIRequest
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const [content, setContent] = useState('');
  const [originalJson] = useState<DocumentJson>(documentJson);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<AIContext | null>(null);

  // Convert JSON to stable HTML for Quill display
  const jsonToHtml = useCallback((json: DocumentJson): string => {
    const htmlParts: string[] = [];
    
    for (const section of json.sections) {
      switch (section.type) {
        case 'heading':
          const level = Math.min(section.level || 1, 3);
          htmlParts.push(`<h${level}>${section.content || ''}</h${level}>`);
          break;
          
        case 'paragraph':
          if (section.content) {
            htmlParts.push(`<p>${section.content}</p>`);
          }
          break;
          
        case 'list':
          if (section.items && section.items.length > 0) {
            const listItems = section.items.map(item => `<li>${item}</li>`).join('');
            htmlParts.push(`<ul>${listItems}</ul>`);
          }
          break;
      }
    }
    
    return htmlParts.length > 0 ? htmlParts.join('') : '<p><br></p>';
  }, []);

  // Convert HTML back to JSON
  const htmlToJson = useCallback((html: string): DocumentJson => {
    // Convert HTML back to markdown-like text
    const textContent = html
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1')
      .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1')
      .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1')
      .replace(/<li[^>]*>(.*?)<\/li>/g, '- $1')
      .replace(/<ul[^>]*>|<\/ul>/g, '')
      .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    return textToJson(textContent);
  }, []);

  // Initialize content from JSON
  useEffect(() => {
    const htmlContent = jsonToHtml(documentJson);
    setContent(htmlContent);
  }, [documentJson, jsonToHtml]);

  // Content change handler with improved stability
  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    
    // Improved debounced conversion with stability checks
    const timeoutId = setTimeout(() => {
      if (value !== content && value.trim() !== '') {
        try {
          const newJson = htmlToJson(value);
          const newText = generateFormattedText(newJson);
          onContentChange(newJson, newText);
        } catch (error) {
          console.warn('Content conversion error:', error);
        }
      }
    }, 150);
    
    return () => clearTimeout(timeoutId);
  }, [content, htmlToJson, onContentChange]);

  // Handle text selection for AI features
  const handleSelectionChange = useCallback((range: any, source: any, editor: any) => {
    if (!showAIFeatures || source !== 'user') return;
    
    if (range && range.length > 0) {
      const selectedText = editor.getText(range.index, range.length);
      const fullText = editor.getText();
      
      setSelectionInfo({
        selectedText: selectedText.trim(),
        selectionRange: range,
        fullText: fullText
      });
      setIsAIEnabled(selectedText.trim().length > 10); // Enable AI for meaningful selections
    } else {
      setSelectionInfo(null);
      setIsAIEnabled(false);
    }
  }, [showAIFeatures]);

  // AI improvement handlers - NO TOAST NOTIFICATIONS
  const handleAIImprovement = useCallback((action: 'improve' | 'rewrite' | 'tone') => {
    if (selectionInfo && onAIRequest) {
      onAIRequest(selectionInfo, action);
      // No toast - feature not implemented yet
    }
  }, [selectionInfo, onAIRequest]);

  // Quill configuration with custom toolbar
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold'],
        [{ 'list': 'bullet' }],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false
    },
    history: {
      delay: 1000,
      maxStack: 100,
      userOnly: false
    },
    keyboard: {
      bindings: {
        undo: {
          key: 'Z',
          ctrlKey: true,
          handler: function(range: any, context: any) {
            this.quill.history.undo();
            return false;
          }
        },
        redo: {
          key: 'Z',
          ctrlKey: true,
          shiftKey: true,
          handler: function(range: any, context: any) {
            this.quill.history.redo();
            return false;
          }
        }
      }
    }
  };

  const formats = [
    'header', 'bold', 'list', 'bullet'
  ];

  return (
    <div className={`relative ${className}`}>
      {/* AI Enhancement Toolbar */}
      {showAIFeatures && isAIEnabled && selectionInfo && (
        <div className="absolute top-2 right-2 z-10 flex space-x-2 bg-background border border-border rounded-lg p-2 shadow-lg">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAIImprovement('improve')}
            className="text-micro px-2 py-1"
          >
            <WandSparkles className="h-3 w-3 mr-1" />
            Improve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAIImprovement('rewrite')}
            className="text-micro px-2 py-1"
          >
            <WandSparkles className="h-3 w-3 mr-1" />
            Rewrite
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAIImprovement('tone')}
            className="text-micro px-2 py-1"
          >
            <WandSparkles className="h-3 w-3 mr-1" />
            Tone
          </Button>
        </div>
      )}

      {/* Quill Editor */}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={handleContentChange}
        onChangeSelection={handleSelectionChange}
        readOnly={readOnly}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        className="rich-text-editor bg-background text-foreground border border-border rounded-md"
      />

      {/* Selected Text Info */}
      {showAIFeatures && selectionInfo && (
        <div className="mt-2 text-micro text-muted-foreground">
          Selected: {selectionInfo.selectedText.length > 50 
            ? `${selectionInfo.selectedText.substring(0, 50)}...` 
            : selectionInfo.selectedText}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;