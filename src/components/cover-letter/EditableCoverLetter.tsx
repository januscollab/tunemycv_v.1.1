
import React, { useState, useEffect, useCallback } from 'react';
import ControlledRichTextEditor from '@/components/common/ControlledRichTextEditor';
import EnhancedEditorErrorBoundary from '@/components/common/EnhancedEditorErrorBoundary';
import { textToJson, DocumentJson, generateFormattedText } from '@/utils/documentJsonUtils';
import { initializeEditorContent } from '@/utils/contentConverter';


interface EditableCoverLetterProps {
  content: string;
  onSave: (newContent: string) => void;
}

const EditableCoverLetter: React.FC<EditableCoverLetterProps> = ({ content, onSave }) => {
  const [originalContent] = useState(content);

  // No need for local state management - let ControlledRichTextEditor handle it

  // Handle rich text editor content changes - NO TOAST NOTIFICATIONS
  const handleContentChange = useCallback((newJson: DocumentJson, newText: string) => {
    // Silent auto-save with debounce
    if (newText !== content && newText.trim() !== '') {
      const timeoutId = setTimeout(() => {
        onSave(newText);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [content, onSave]);

  return (
    <div className="space-y-6">
      <div className="bg-muted/20 p-4 rounded-lg">
        <div className="mb-4">
          <h3 className="text-caption font-medium text-foreground">Edit Cover Letter</h3>
          <p className="text-micro text-muted-foreground">Use formatting tools and AI assistance to enhance your cover letter</p>
        </div>
        <EnhancedEditorErrorBoundary
          fallbackContent={content}
          onReset={() => {}}
          componentName="Cover Letter Editor"
          onContentRestore={(content) => {
            const json = textToJson(content);
            handleContentChange(json, content);
          }}
        >
          <ControlledRichTextEditor
            initialContent={content}
            onContentChange={handleContentChange}
            className="min-h-[400px] bg-background"
            placeholder="Edit your cover letter content here..."
            showAIFeatures={true}
            enableAutoSave={true}
            debounceMs={2000}
          />
        </EnhancedEditorErrorBoundary>
      </div>
    </div>
  );
};

export default EditableCoverLetter;
