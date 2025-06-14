import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { WandSparkles, RotateCcw, Check, X, AlertCircle, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  variant?: 'default' | 'minimal' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'error' | 'success';
  disabled?: boolean;
  minHeight?: string;
  filename?: string;
  onAIRequest?: (context: AIContext, action: 'improve' | 'rewrite' | 'tone') => void;
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
  onAIRequest
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const [content, setContent] = useState(value);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<AIContext | null>(null);

  // Update content when value prop changes
  useEffect(() => {
    if (value !== content) {
      setContent(value);
    }
  }, [value, content]);

  // Content change handler
  const handleContentChange = useCallback((newValue: string) => {
    setContent(newValue);
    onChange?.(newValue);
  }, [onChange]);

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

  const handleDownload = useCallback(() => {
    if (onDownload && content) {
      onDownload(content, filename);
    } else if (content) {
      // Default download functionality - create and download as HTML file
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [onDownload, content, filename]);

  // Add custom buttons to toolbar after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (variant === 'minimal' || readOnly || disabled) return;

      const toolbar = document.querySelector('.rich-text-editor .ql-toolbar');
      if (!toolbar) return;

      // Remove existing custom buttons
      const existingCustomButtons = toolbar.querySelectorAll('.ql-custom-button');
      existingCustomButtons.forEach(button => button.remove());

      // Create save button
      const saveButton = document.createElement('button');
      saveButton.className = 'ql-custom-button ql-custom-left';
      saveButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>';
      saveButton.title = 'Save';
      saveButton.type = 'button';
      saveButton.addEventListener('click', (e) => {
        e.preventDefault();
        handleSave();
      });

      // Create download button
      const downloadButton = document.createElement('button');
      downloadButton.className = 'ql-custom-button ql-custom-right';
      downloadButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
      downloadButton.title = 'Download';
      downloadButton.type = 'button';
      downloadButton.addEventListener('click', (e) => {
        e.preventDefault();
        handleDownload();
      });

      // Insert save button at the beginning
      if (toolbar.firstChild) {
        toolbar.insertBefore(saveButton, toolbar.firstChild);
      } else {
        toolbar.appendChild(saveButton);
      }

      // Insert download button at the end
      toolbar.appendChild(downloadButton);
    }, 100); // Small delay to ensure Quill has rendered

    return () => clearTimeout(timer);
  }, [handleSave, handleDownload, variant, readOnly, disabled, content]);

  // Toolbar configurations based on variant
  const getToolbarConfig = () => {
    switch (variant) {
      case 'minimal':
        return [
          ['bold'],
          [{ 'list': 'bullet' }]
        ];
      case 'compact':
        return [
          [{ 'header': [2, 3, false] }],
          ['bold'],
          [{ 'list': 'bullet' }]
        ];
      default:
        return [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link'],
          ['clean']
        ];
    }
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

  const formats = variant === 'minimal' 
    ? ['bold', 'list', 'bullet']
    : ['header', 'bold', 'italic', 'list', 'bullet', 'ordered', 'link'];

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
      {state !== 'default' && (
        <div className="absolute top-2 left-2 z-20">
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
          className={cn(
            'rich-text-editor',
            variant === 'minimal' && 'rich-text-editor-minimal',
            variant === 'compact' && 'rich-text-editor-compact'
          )}
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