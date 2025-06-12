import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';
import { WandSparkles, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useJsonFirstEditor } from '@/hooks/useJsonFirstEditor';
import { DocumentJson } from '@/utils/documentJsonUtils';

interface AIContext {
  selectedText: string;
  selectionRange: { index: number; length: number };
  fullText: string;
  bounds?: { top: number; left: number; width: number; height: number };
}

interface SafeRichTextEditorProps {
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

interface SafeRichTextEditorRef {
  htmlContent: string;
  saveChanges: (html: string) => Promise<void>;
}

const SafeRichTextEditor = forwardRef<SafeRichTextEditorRef, SafeRichTextEditorProps>(({
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
  const [editorError, setEditorError] = useState<string | null>(null);
  const [isQuillReady, setIsQuillReady] = useState(false);

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
    debounceMs,
    enableAutoSave: false
  });

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    htmlContent,
    saveChanges
  }), [htmlContent, saveChanges]);

  // Validate HTML content before passing to ReactQuill
  const validateHtmlContent = useCallback((html: string): string => {
    try {
      if (!html || typeof html !== 'string') {
        return '<p><br></p>';
      }
      
      // Basic validation - ensure it's not empty and has proper structure
      const trimmed = html.trim();
      if (!trimmed) {
        return '<p><br></p>';
      }
      
      // Test if HTML can be parsed safely
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = trimmed;
      
      return trimmed;
    } catch (error) {
      console.error('HTML validation error:', error);
      return '<p><br></p>';
    }
  }, []);

  const validatedHtmlContent = validateHtmlContent(htmlContent);

  // Handle content changes from Quill with error protection
  const handleContentChange = useCallback((value: string) => {
    try {
      setEditorError(null);
      
      if (typeof value === 'string') {
        updateFromHtml(value);
      } else {
        throw new Error('Invalid content type received from editor');
      }
    } catch (error) {
      console.error('Editor content change error:', error);
      setEditorError(error instanceof Error ? error.message : 'Content update failed');
    }
  }, [updateFromHtml]);

  // Handle ReactQuill ready state
  const handleEditorReady = useCallback(() => {
    setIsQuillReady(true);
    setEditorError(null);
  }, []);

  // Handle text selection for AI features with position calculation
  const handleSelectionChange = useCallback((range: any, source: any, editor: any) => {
    if (!showAIFeatures || source !== 'user' || !isQuillReady) return;
    
    try {
      if (range && range.length > 0) {
        const selectedText = editor.getText(range.index, range.length);
        const fullText = getPlainText();
        
        // Get selection position for menu positioning
        const bounds = quillRef.current?.getEditor().getBounds(range.index, range.length);
        
        setSelectionInfo({
          selectedText: selectedText.trim(),
          selectionRange: range,
          fullText: fullText,
          bounds: bounds
        });
        setIsAIEnabled(selectedText.trim().length > 10);
      } else {
        setSelectionInfo(null);
        setIsAIEnabled(false);
      }
    } catch (error) {
      console.error('Selection change error:', error);
      setSelectionInfo(null);
      setIsAIEnabled(false);
    }
  }, [showAIFeatures, getPlainText, isQuillReady]);

  // AI improvement handlers
  const handleAIImprovement = useCallback((action: 'improve' | 'rewrite' | 'tone') => {
    if (selectionInfo && onAIRequest) {
      onAIRequest(selectionInfo, action);
    }
  }, [selectionInfo, onAIRequest]);

  // Reset editor error
  const handleResetError = useCallback(() => {
    setEditorError(null);
    resetToOriginal();
  }, [resetToOriginal]);

  // Quill configuration with enhanced error handling and cleaned toolbar (removed "T" icon)
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

  // Show error state
  if (editorError) {
    return (
      <div className={`relative ${className}`}>
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Editor error: {editorError}
          </AlertDescription>
        </Alert>
        <Button onClick={handleResetError} variant="outline" size="sm">
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset Editor
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* AI Enhancement Toolbar - Positioned below selection */}
      {showAIFeatures && isAIEnabled && selectionInfo && selectionInfo.bounds && (
        <div 
          className="absolute z-50 flex space-x-2 bg-background border border-border rounded-lg p-2 shadow-lg"
          style={{
            top: `${selectionInfo.bounds.top + selectionInfo.bounds.height + 8}px`,
            left: `${Math.max(8, selectionInfo.bounds.left)}px`,
            maxWidth: '300px'
          }}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAIImprovement('improve')}
            className="text-micro px-2 py-1 whitespace-nowrap"
          >
            <WandSparkles className="h-3 w-3 mr-1" />
            Improve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAIImprovement('rewrite')}
            className="text-micro px-2 py-1 whitespace-nowrap"
          >
            <WandSparkles className="h-3 w-3 mr-1" />
            Rewrite
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAIImprovement('tone')}
            className="text-micro px-2 py-1 whitespace-nowrap"
          >
            <WandSparkles className="h-3 w-3 mr-1" />
            Tone
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
        value={validatedHtmlContent}
        onChange={handleContentChange}
        onChangeSelection={handleSelectionChange}
        onFocus={handleEditorReady}
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

SafeRichTextEditor.displayName = 'SafeRichTextEditor';

export default SafeRichTextEditor;