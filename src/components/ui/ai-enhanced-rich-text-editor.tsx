import React, { forwardRef, useImperativeHandle } from 'react';
import { RichTextEditor, RichTextEditorRef, RichTextEditorProps } from './rich-text-editor';
import { AIAction } from './ai-context-menu';
import { useAIContentProcessor } from '@/hooks/useAIContentProcessor';
import { useToast } from '@/hooks/use-toast';

interface AIEnhancedRichTextEditorProps extends Omit<RichTextEditorProps, 'onAIRequest'> {
  onAIProcessed?: (processedText: string, originalAction: AIAction) => void;
}

/**
 * AI-Enhanced Rich Text Editor with built-in AI processing capabilities
 * This component wraps the base RichTextEditor and adds AI functionality
 */
const AIEnhancedRichTextEditor = forwardRef<RichTextEditorRef, AIEnhancedRichTextEditorProps>(({
  onAIProcessed,
  ...props
}, ref) => {
  const { toast } = useToast();
  const richTextEditorRef = React.useRef<RichTextEditorRef>(null);

  // AI content processor hook
  const { isProcessing, processContent } = useAIContentProcessor({
    onSuccess: (processedText) => {
      toast({
        title: 'AI Processing Complete',
        description: 'Your content has been enhanced!',
      });
    },
    onError: (error) => {
      toast({
        title: 'AI Processing Failed',
        description: error,
        variant: 'destructive',
      });
    }
  });

  // Forward ref methods
  useImperativeHandle(ref, () => ({
    htmlContent: richTextEditorRef.current?.htmlContent || '',
    saveChanges: async () => {
      await richTextEditorRef.current?.saveChanges();
    },
    getPlainText: () => richTextEditorRef.current?.getPlainText() || ''
  }), []);

  // Handle AI requests
  const handleAIRequest = async (action: AIAction) => {
    try {
      const processedText = await processContent(action);
      
      if (processedText && onAIProcessed) {
        onAIProcessed(processedText, action);
      }
    } catch (error) {
      console.error('AI processing error:', error);
    }
  };

  return (
    <RichTextEditor
      ref={richTextEditorRef}
      {...props}
      onAIRequest={handleAIRequest}
      readOnly={props.readOnly || isProcessing}
    />
  );
});

AIEnhancedRichTextEditor.displayName = 'AIEnhancedRichTextEditor';

export default AIEnhancedRichTextEditor;
export { type AIEnhancedRichTextEditorProps };