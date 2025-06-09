import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { WandSparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

  // Convert JSON to HTML for Quill display
  const jsonToHtml = useCallback((json: DocumentJson): string => {
    const textContent = generateFormattedText(json);
    return textContent
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '<p><br></p>';
        
        // Handle headings
        if (trimmed.match(/^#{3}\s+/)) {
          return `<h3>${trimmed.replace(/^#{3}\s+/, '')}</h3>`;
        }
        if (trimmed.match(/^#{2}\s+/)) {
          return `<h2>${trimmed.replace(/^#{2}\s+/, '')}</h2>`;
        }
        if (trimmed.match(/^#{1}\s+/)) {
          return `<h1>${trimmed.replace(/^#{1}\s+/, '')}</h1>`;
        }
        
        // Handle lists
        if (trimmed.match(/^-\s+/)) {
          return `<li>${trimmed.replace(/^-\s+/, '')}</li>`;
        }
        
        // Regular paragraphs
        return `<p>${trimmed}</p>`;
      })
      .join('')
      .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
      .replace(/<\/ul><ul>/g, '');
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

  // Content change handler with improved debouncing
  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    
    // Only trigger onChange if content actually changed
    if (value !== content) {
      const newJson = htmlToJson(value);
      const newText = generateFormattedText(newJson);
      onContentChange(newJson, newText);
    }
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

  // AI improvement handlers
  const handleAIImprovement = useCallback((action: 'improve' | 'rewrite' | 'tone') => {
    if (selectionInfo && onAIRequest) {
      onAIRequest(selectionInfo, action);
      toast({
        title: "AI Enhancement Coming Soon",
        description: "This feature will be available in the next update!",
      });
    }
  }, [selectionInfo, onAIRequest, toast]);

  // Revert to original
  const handleRevert = useCallback(() => {
    const originalHtml = jsonToHtml(originalJson);
    setContent(originalHtml);
    const originalText = generateFormattedText(originalJson);
    onContentChange(originalJson, originalText);
    toast({
      title: "Reverted",
      description: "Content has been reverted to original state.",
    });
  }, [originalJson, jsonToHtml, onContentChange, toast]);

  // Quill configuration
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
      userOnly: true
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

      {/* Revert Button */}
      <div className="absolute top-2 left-2 z-10">
        <Button
          size="sm"
          variant="outline"
          onClick={handleRevert}
          className="text-micro px-2 py-1"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Revert
        </Button>
      </div>

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
        className="bg-background text-foreground"
        style={{
          backgroundColor: 'transparent',
          color: 'inherit'
        }}
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