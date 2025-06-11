
import React, { useState, useCallback, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { textToHtml } from '@/utils/contentConverter';


interface EditableCoverLetterProps {
  content: string;
  onSave: (newContent: string) => void;
}

const EditableCoverLetter: React.FC<EditableCoverLetterProps> = ({ content, onSave }) => {
  const [htmlContent, setHtmlContent] = useState(() => textToHtml(content));
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Simple HTML content change handler with debounced save
  const handleContentChange = useCallback((html: string) => {
    setHtmlContent(html);
    
    // Debounced save - convert HTML back to plain text
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      // Convert HTML back to plain text for saving
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      if (plainText !== content && plainText.trim() !== '') {
        onSave(plainText);
      }
    }, 2000);
  }, [content, onSave]);

  // Quill configuration
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
};

export default EditableCoverLetter;
