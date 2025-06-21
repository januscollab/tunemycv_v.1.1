
import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './rich-text-editor.css';
import { useJsonFirstEditor } from '@/hooks/useJsonFirstEditor';
import { DocumentJson } from '@/utils/documentJsonUtils';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  initialContent: string | DocumentJson;
  onContentChange: (json: DocumentJson, text: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  showAIFeatures?: boolean;
  enableAutoSave?: boolean;
  debounceMs?: number;
}

interface RichTextEditorRef {
  htmlContent: string;
  saveChanges: () => Promise<void>;
  getPlainText: () => string;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
  initialContent,
  onContentChange,
  className = '',
  placeholder = 'Start editing...',
  readOnly = false,
  showAIFeatures = false,
  enableAutoSave = true,
  debounceMs = 300
}, ref) => {
  const quillRef = useRef<ReactQuill>(null);
  const [selectedText, setSelectedText] = useState('');

  // Use the JSON-first editor hook
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
    enableAutoSave
  });

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    htmlContent,
    saveChanges,
    getPlainText
  }), [htmlContent, saveChanges, getPlainText]);

  // Handle content changes from Quill
  const handleContentChange = useCallback((value: string) => {
    try {
      if (typeof value === 'string') {
        updateFromHtml(value);
      }
    } catch (error) {
      console.error('[RichTextEditor] Error handling content change:', error);
    }
  }, [updateFromHtml]);

  // Handle text selection for AI features
  const handleSelectionChange = useCallback((range: any, source: any, editor: any) => {
    if (!showAIFeatures || source !== 'user' || !range) {
      setSelectedText('');
      return;
    }
    
    if (range.length > 0) {
      const selected = editor.getText(range.index, range.length);
      setSelectedText(selected.trim());
    } else {
      setSelectedText('');
    }
  }, [showAIFeatures]);

  // Quill configuration with enhanced features
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

  const editorContent = (
    <div className={cn('rich-text-editor-wrapper relative', className)}>
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

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && hasUnsavedChanges && (
        <div className="mt-2 text-micro text-muted-foreground">
          Unsaved changes • {documentJson.sections.length} sections
        </div>
      )}
    </div>
  );

  // Only wrap with AI features in specific contexts - removed by default
  return editorContent;
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
export { RichTextEditor, type RichTextEditorRef, type RichTextEditorProps };
