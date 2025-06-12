
import React, { useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { jsonToHtml, htmlToJson } from '@/utils/jsonHtmlConverters';
import { DocumentJson, textToJson, generateFormattedText } from '@/utils/documentJsonUtils';


interface EditableCoverLetterProps {
  content: string;
  onSave: (newContent: string) => void;
}

interface EditableCoverLetterRef {
  forceSave: () => Promise<void>;
}

const EditableCoverLetter = forwardRef<EditableCoverLetterRef, EditableCoverLetterProps>(({ content, onSave }, ref) => {
  // Initialize HTML from JSON content
  const [htmlContent, setHtmlContent] = useState(() => {
    try {
      // Try to parse as JSON first
      const jsonData = JSON.parse(content);
      return jsonToHtml(jsonData);
    } catch {
      // Fallback to text if not JSON
      const jsonData = textToJson(content);
      return jsonToHtml(jsonData);
    }
  });
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Force save function exposed through ref
  const forceSave = useCallback(async () => {
    try {
      // Cancel any pending debounced save
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Convert current HTML to JSON and save immediately
      const jsonData = htmlToJson(htmlContent);
      const textContent = generateFormattedText(jsonData);
      
      if (textContent !== content && textContent.trim() !== '') {
        console.log('[EditableCoverLetter] Force saving changes...');
        await onSave(JSON.stringify(jsonData));
      }
    } catch (error) {
      console.error('Error force saving cover letter:', error);
    }
  }, [htmlContent, content, onSave]);

  // Expose force save through ref
  useImperativeHandle(ref, () => ({
    forceSave
  }), [forceSave]);

  // Handle content changes with immediate save (no debouncing)
  const handleContentChange = useCallback(async (html: string) => {
    console.log('[EditableCoverLetter] Content changed:', {
      htmlLength: html.length,
      timestamp: new Date().toISOString()
    });
    
    setHtmlContent(html);
    
    // Clear any pending debounced save
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Immediate save for better reliability
    try {
      const jsonData = htmlToJson(html);
      const textContent = generateFormattedText(jsonData);
      
      if (textContent !== content && textContent.trim() !== '') {
        console.log('[EditableCoverLetter] Saving changes immediately...', {
          htmlLength: html.length,
          jsonSections: jsonData.sections.length,
          textLength: textContent.length
        });
        await onSave(JSON.stringify(jsonData));
        console.log('[EditableCoverLetter] Save completed successfully');
      } else {
        console.log('[EditableCoverLetter] No changes detected, skipping save');
      }
    } catch (error) {
      console.error('[EditableCoverLetter] Error saving changes:', error);
    }
  }, [content, onSave]);

  // Quill configuration with AI features and download button
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold'],
      [{ 'list': 'bullet' }],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header', 'bold', 'list', 'bullet'
  ];

  return (
    <div className="space-y-6">
      <div className="bg-muted/20 p-4 rounded-lg">
        <div className="mb-4">
          <h3 className="text-caption font-medium text-foreground">Edit Cover Letter</h3>
          <p className="text-micro text-muted-foreground">Use formatting tools to enhance your cover letter</p>
        </div>
        <ReactQuill
          theme="snow"
          value={htmlContent}
          onChange={handleContentChange}
          placeholder="Edit your cover letter content here..."
          modules={modules}
          formats={formats}
          className="min-h-[400px] bg-background text-foreground border border-border rounded-md"
        />
      </div>
    </div>
  );
});

EditableCoverLetter.displayName = 'EditableCoverLetter';

export default EditableCoverLetter;
