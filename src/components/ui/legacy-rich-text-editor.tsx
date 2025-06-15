import React, { forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './rich-text-editor.css';
import { cn } from '@/lib/utils';

/**
 * Legacy Rich Text Editor for backward compatibility
 * Maintains the same props interface as the original components
 */

interface LegacyRichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void | Promise<void>;
  onDownload?: (value: string, filename: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
  filename?: string;
  minHeight?: string;
  state?: 'default' | 'loading' | 'error' | 'success';
}

interface LegacyRichTextEditorRef {
  getValue: () => string;
  setValue: (value: string) => void;
  save: () => void | Promise<void>;
}

const LegacyRichTextEditor = forwardRef<LegacyRichTextEditorRef, LegacyRichTextEditorProps>(({
  value = '',
  onChange,
  onSave,
  onDownload,
  className = '',
  placeholder = 'Start editing...',
  readOnly = false,
  disabled = false,
  autoSave = false,
  autoSaveDelay = 1000,
  filename = 'document',
  minHeight = '200px',
  state = 'default'
}, ref) => {
  const [content, setContent] = useState(value);
  const quillRef = React.useRef<ReactQuill>(null);

  // Update content when value prop changes
  React.useEffect(() => {
    if (value !== content) {
      setContent(value);
    }
  }, [value]);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    getValue: () => content,
    setValue: (newValue: string) => {
      setContent(newValue);
      if (onChange) {
        onChange(newValue);
      }
    },
    save: async () => {
      if (onSave) {
        await onSave(content);
      }
    }
  }), [content, onChange, onSave]);

  // Handle content changes
  const handleChange = useCallback((newValue: string) => {
    setContent(newValue);
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);

  // Quill modules configuration
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

  const formats = ['header', 'bold', 'list', 'bullet'];

  const editorClassName = cn(
    'rich-text-editor bg-background text-foreground border border-border rounded-md',
    {
      'opacity-50': disabled,
      'border-destructive': state === 'error',
      'border-success': state === 'success',
    },
    className
  );

  return (
    <div className="rich-text-editor-wrapper relative">
      {/* Loading indicator */}
      {state === 'loading' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-background/80 rounded-lg p-2">
          <div className="animate-spin rounded-full h-4 w-4 border border-current border-t-transparent" />
        </div>
      )}

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={handleChange}
        readOnly={readOnly || disabled || state === 'loading'}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        className={editorClassName}
        style={{ minHeight }}
      />

      {/* State indicators */}
      {state === 'error' && (
        <div className="mt-2 text-micro text-destructive">
          There was an error with the editor
        </div>
      )}
      
      {state === 'success' && (
        <div className="mt-2 text-micro text-success">
          Content saved successfully
        </div>
      )}
    </div>
  );
});

LegacyRichTextEditor.displayName = 'LegacyRichTextEditor';

export default LegacyRichTextEditor;
export { type LegacyRichTextEditorProps, type LegacyRichTextEditorRef };