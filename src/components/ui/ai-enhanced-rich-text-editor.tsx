import React, { forwardRef, useImperativeHandle } from 'react';
import { RichTextEditor, RichTextEditorRef, RichTextEditorProps } from './rich-text-editor';
// Using new ExperimentalAIMenu - no action interface needed
import { useAIContentProcessor } from '@/hooks/useAIContentProcessor';
import { useToast } from '@/hooks/use-toast';

interface AIEnhancedRichTextEditorProps extends RichTextEditorProps {
  // Enhanced with built-in AI processing
}

/**
 * AI-Enhanced Rich Text Editor with built-in AI processing capabilities
 * This component wraps the base RichTextEditor and adds AI functionality
 */
const AIEnhancedRichTextEditor = forwardRef<RichTextEditorRef, AIEnhancedRichTextEditorProps>(({
  ...props
}, ref) => {
  const richTextEditorRef = React.useRef<RichTextEditorRef>(null);

  // Forward ref methods
  useImperativeHandle(ref, () => ({
    htmlContent: richTextEditorRef.current?.htmlContent || '',
    saveChanges: async () => {
      await richTextEditorRef.current?.saveChanges();
    },
    getPlainText: () => richTextEditorRef.current?.getPlainText() || ''
  }), []);

  return (
    <RichTextEditor
      ref={richTextEditorRef}
      {...props}
    />
  );
});

AIEnhancedRichTextEditor.displayName = 'AIEnhancedRichTextEditor';

export default AIEnhancedRichTextEditor;
export { type AIEnhancedRichTextEditorProps };