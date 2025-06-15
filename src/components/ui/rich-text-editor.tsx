import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { WandSparkles, RotateCcw, Check, X, AlertCircle, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface AIContext {
  selectedText: string;
  selectionRange: { index: number; length: number };
  fullText: string;
}

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
  onDownload?: (value: string, filename?: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  showAIFeatures?: boolean;
  variant?: 'default';
  size?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'error' | 'success';
  disabled?: boolean;
  minHeight?: string;
  filename?: string;
  onAIRequest?: (context: AIContext, action: 'improve' | 'rewrite' | 'tone') => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  onSave,
  onDownload,
  className,
  placeholder = 'Start writing...',
  readOnly = false,
  showAIFeatures = false,
  variant = 'default',
  size = 'md',
  state = 'default',
  disabled = false,
  minHeight = '200px',
  filename = 'document',
  onAIRequest,
  autoSave = false,
  autoSaveDelay = 2000
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const [content, setContent] = useState(value);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<AIContext | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Update content when value prop changes
  useEffect(() => {
    if (value !== content) {
      setContent(value);
    }
  }, [value, content]);

  // Auto-save functionality
  const performAutoSave = useCallback(async (contentToSave: string) => {
    if (onSave && autoSave && !readOnly && !disabled) {
      setIsSaving(true);
      try {
        await onSave(contentToSave);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [onSave, autoSave, readOnly, disabled]);

  // Content change handler
  const handleContentChange = useCallback((newValue: string) => {
    setContent(newValue);
    onChange?.(newValue);
    
    // Auto-save logic
    if (autoSave && onSave && !readOnly && !disabled) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Set new timeout for auto-save
      autoSaveTimeoutRef.current = setTimeout(() => {
        performAutoSave(newValue);
      }, autoSaveDelay);
    }
  }, [onChange, autoSave, onSave, readOnly, disabled, autoSaveDelay, performAutoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Handle text selection for AI features
  const handleSelectionChange = useCallback((range: any, source: any, editor: any) => {
    if (!showAIFeatures || source !== 'user' || readOnly || disabled) return;
    
    if (range && range.length > 0) {
      const selectedText = editor.getText(range.index, range.length);
      const fullText = editor.getText();
      
      setSelectionInfo({
        selectedText: selectedText.trim(),
        selectionRange: range,
        fullText: fullText
      });
      setIsAIEnabled(selectedText.trim().length > 10);
    } else {
      setSelectionInfo(null);
      setIsAIEnabled(false);
    }
  }, [showAIFeatures, readOnly, disabled]);

  // Save and download handlers
  const handleSave = useCallback(() => {
    if (onSave && content) {
      onSave(content);
    }
  }, [onSave, content]);

  const handleDownload = useCallback(async (format?: 'pdf' | 'docx' | 'txt' | 'html') => {
    if (!content) return;
    
    setIsDownloading(true);
    
    try {
      // Strip HTML tags for plain text formats
      const stripHtml = (html: string) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      };

      const plainText = stripHtml(content);
      const baseFilename = filename || 'document';

      if (onDownload && !format) {
        // Use custom download handler if provided
        onDownload(content, baseFilename);
        return;
      }

      switch (format) {
        case 'pdf':
          const pdf = new jsPDF();
          const splitText = pdf.splitTextToSize(plainText, 180);
          pdf.text(splitText, 10, 10);
          pdf.save(`${baseFilename}.pdf`);
          toast({
            title: 'Success',
            description: 'Document downloaded as PDF',
          });
          break;

        case 'docx':
          const doc = new Document({
            sections: [{
              properties: {},
              children: [
                new Paragraph({
                  children: [
                    new TextRun(plainText)
                  ],
                }),
              ],
            }],
          });
          const blob = await Packer.toBlob(doc);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${baseFilename}.docx`;
          link.click();
          window.URL.revokeObjectURL(url);
          toast({
            title: 'Success',
            description: 'Document downloaded as Word document',
          });
          break;

        case 'txt':
          const textBlob = new Blob([plainText], { type: 'text/plain' });
          const textUrl = window.URL.createObjectURL(textBlob);
          const textLink = document.createElement('a');
          textLink.href = textUrl;
          textLink.download = `${baseFilename}.txt`;
          textLink.click();
          window.URL.revokeObjectURL(textUrl);
          toast({
            title: 'Success',
            description: 'Document downloaded as text file',
          });
          break;

        default:
        case 'html':
          const htmlBlob = new Blob([content], { type: 'text/html' });
          const htmlUrl = URL.createObjectURL(htmlBlob);
          const htmlLink = document.createElement('a');
          htmlLink.href = htmlUrl;
          htmlLink.download = `${baseFilename}.html`;
          document.body.appendChild(htmlLink);
          htmlLink.click();
          document.body.removeChild(htmlLink);
          URL.revokeObjectURL(htmlUrl);
          toast({
            title: 'Success',
            description: 'Document downloaded as HTML file',
          });
          break;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  }, [content, filename, onDownload, toast]);

  // Removed custom save and download buttons from toolbar

  // Toolbar configuration
  const getToolbarConfig = () => {
    return [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ];
  };

  // AI improvement handlers
  const handleAIImprovement = useCallback((action: 'improve' | 'rewrite' | 'tone') => {
    if (selectionInfo && onAIRequest) {
      onAIRequest(selectionInfo, action);
    }
  }, [selectionInfo, onAIRequest]);

  // Quill configuration
  const modules = {
    toolbar: {
      container: getToolbarConfig()
    },
    clipboard: {
      matchVisual: false
    },
    history: {
      delay: 1000,
      maxStack: 100,
      userOnly: false
    }
  };

  const formats = ['header', 'bold', 'italic', 'list', 'bullet', 'ordered'];

  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-body',
    lg: 'text-subheading'
  };

  // State classes
  const stateClasses = {
    default: 'border-border',
    error: 'border-destructive',
    success: 'border-success'
  };

  const stateIcons = {
    error: <AlertCircle className="h-4 w-4 text-destructive" />,
    success: <Check className="h-4 w-4 text-success" />,
    default: null
  };

  return (
    <div className={cn('relative', className)}>
      {/* State Indicator */}
      {(state !== 'default' || isSaving) && (
        <div className="absolute top-2 left-2 z-20 flex items-center space-x-1">
          {isSaving && <Save className="h-4 w-4 text-muted-foreground animate-pulse" />}
          {stateIcons[state]}
        </div>
      )}

      {/* AI Enhancement Toolbar */}
      {showAIFeatures && isAIEnabled && selectionInfo && !readOnly && !disabled && (
        <div className="absolute top-2 right-2 z-20 flex space-x-1 bg-background border border-border rounded-lg p-1 shadow-lg">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAIImprovement('improve')}
            className="text-micro px-2 py-1 h-6"
          >
            <WandSparkles className="h-3 w-3 mr-1" />
            Improve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAIImprovement('rewrite')}
            className="text-micro px-2 py-1 h-6"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Rewrite
          </Button>
        </div>
      )}

      {/* Quill Editor */}
      <div 
        className={cn(
          'rich-text-editor-wrapper',
          sizeClasses[size],
          stateClasses[state],
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{ minHeight }}
      >
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={handleContentChange}
          onChangeSelection={handleSelectionChange}
          readOnly={readOnly || disabled}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          className="rich-text-editor"
        />
      </div>

      {/* Selected Text Info for AI features */}
      {showAIFeatures && selectionInfo && !readOnly && !disabled && (
        <div className="mt-2 text-micro text-muted-foreground">
          Selected: {selectionInfo.selectedText.length > 50 
            ? `${selectionInfo.selectedText.substring(0, 50)}...` 
            : selectionInfo.selectedText}
        </div>
      )}
    </div>
  );
};

export { RichTextEditor, type RichTextEditorProps, type AIContext };