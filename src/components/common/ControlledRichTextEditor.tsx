import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';
import { WandSparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJsonFirstEditor } from '@/hooks/useJsonFirstEditor';
import { DocumentJson } from '@/utils/documentJsonUtils';

interface AIContext {
  selectedText: string;
  selectionRange: { index: number; length: number };
  fullText: string;
}

interface ControlledRichTextEditorProps {
  initialContent: string | DocumentJson;
  onContentChange: (json: DocumentJson, text: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  showAIFeatures?: boolean;
  onAIRequest?: (context: AIContext, action: 'improve' | 'rewrite' | 'tone') => void;
  enableAutoSave?: boolean;
  debounceMs?: number;
}

interface ControlledRichTextEditorRef {
  htmlContent: string;
  saveChanges: () => Promise<void>;
}

const ControlledRichTextEditor = forwardRef<ControlledRichTextEditorRef, ControlledRichTextEditorProps>(({
  initialContent,
  onContentChange,
  className = '',
  placeholder = 'Start editing...',
  readOnly = false,
  showAIFeatures = true,
  onAIRequest,
  enableAutoSave = true,
  debounceMs = 300
}, ref) => {
  const quillRef = useRef<ReactQuill>(null);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<AIContext | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // DIAGNOSTIC: Log what content the editor receives
  console.log('[ControlledRichTextEditor] Received initialContent:', {
    type: typeof initialContent,
    isString: typeof initialContent === 'string',
    isObject: typeof initialContent === 'object',
    hasSection: typeof initialContent === 'object' && initialContent?.sections,
    contentLength: typeof initialContent === 'string' ? initialContent.length : 'N/A',
    preview: typeof initialContent === 'string' ? initialContent.substring(0, 100) : JSON.stringify(initialContent)?.substring(0, 100)
  });

  // Use the HTML-first editor hook
  const {
    documentJson,
    htmlContent,
    isConverting,
    hasUnsavedChanges,
    updateFromHtml,
    resetToOriginal,
    saveChanges,
    getPlainText
  } = useJsonFirstEditor({
    initialContent,
    onContentChange,
    enableAutoSave: false // Disable auto-save for manual control
  });

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    htmlContent,
    saveChanges
  }), [htmlContent, saveChanges]);

  // DIAGNOSTIC: Log HTML content being passed to ReactQuill
  console.log('[ControlledRichTextEditor] HTML content for ReactQuill:', {
    htmlLength: htmlContent.length,
    preview: htmlContent.substring(0, 200),
    hasContent: htmlContent.length > 0 && htmlContent !== '<p><br></p>'
  });

  // Handle content changes from Quill - HTML-first approach (no auto-save)
  const handleContentChange = useCallback((value: string) => {
    try {
      // Validate content before updating
      if (typeof value === 'string') {
        updateFromHtml(value);
      } else {
        console.warn('[ControlledRichTextEditor] Invalid content type received:', typeof value);
      }
    } catch (error) {
      console.error('[ControlledRichTextEditor] Error handling content change:', error);
    }
  }, [updateFromHtml]);

  // Handle text selection for AI features
  const handleSelectionChange = useCallback((range: any, source: any, editor: any) => {
    if (!showAIFeatures || source !== 'user') return;
    
    if (range && range.length > 0) {
      const selectedText = editor.getText(range.index, range.length);
      const fullText = getPlainText();
      
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
  }, [showAIFeatures, getPlainText]);

  // AI improvement handlers
  const handleAIImprovement = useCallback((action: 'improve' | 'rewrite' | 'tone') => {
    if (selectionInfo && onAIRequest) {
      onAIRequest(selectionInfo, action);
    }
  }, [selectionInfo, onAIRequest]);

  // Quill configuration with enhanced history and keyboard handling
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold'],
      [{ 'list': 'bullet' }],
      ['clean']
    ],
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

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

      {/* Reset Button */}
      {hasUnsavedChanges && (
        <div className="absolute top-2 left-2 z-10">
          <Button
            size="sm"
            variant="outline"
            onClick={resetToOriginal}
            className="text-micro px-2 py-1"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      )}

      {/* Loading indicator */}
      {isConverting && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-lg p-2">
          <div className="animate-spin rounded-full h-4 w-4 border border-current border-t-transparent" />
        </div>
      )}

      {/* Quill Editor */}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={htmlContent}
        onChange={handleContentChange}
        onChangeSelection={handleSelectionChange}
        readOnly={readOnly || isConverting}
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

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && hasUnsavedChanges && (
        <div className="mt-2 text-micro text-muted-foreground">
          Unsaved changes • {documentJson.sections.length} sections
        </div>
      )}
    </div>
  );
});

ControlledRichTextEditor.displayName = 'ControlledRichTextEditor';

export default ControlledRichTextEditor;