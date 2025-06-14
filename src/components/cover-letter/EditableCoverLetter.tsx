
import React, { useState, useCallback, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { jsonToHtml, htmlToJson } from '@/utils/jsonHtmlConverters';
import { DocumentJson, textToJson, generateFormattedText } from '@/utils/documentJsonUtils';
import DownloadOptions from '@/components/cover-letter/DownloadOptions';


interface EditableCoverLetterProps {
  content: string;
  onSave: (newContent: string) => void;
  fileName?: string;
}

interface EditableCoverLetterRef {
  forceSave: () => Promise<void>;
}

const EditableCoverLetter = forwardRef<EditableCoverLetterRef, EditableCoverLetterProps>(({ content, onSave, fileName = 'cover-letter' }, ref) => {
  // Track initialization state to fix first save bug
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState('');
  
  // Initialize HTML from JSON content with proper error handling
  const [htmlContent, setHtmlContent] = useState(() => {
    try {
      // Try to parse as JSON first
      const jsonData = JSON.parse(content);
      const html = jsonToHtml(jsonData);
      setLastSavedContent(content); // Track what was loaded
      return html;
    } catch {
      // Fallback to text if not JSON
      const jsonData = textToJson(content);
      const html = jsonToHtml(jsonData);
      const jsonString = JSON.stringify(jsonData);
      setLastSavedContent(jsonString); // Track what was loaded
      return html;
    }
  });
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const quillRef = useRef<ReactQuill>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Mark as initialized after first render
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialized(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Add download button to Quill toolbar
  useEffect(() => {
    if (quillRef.current) {
      const toolbar = quillRef.current.getEditor().getModule('toolbar');
      if (toolbar && toolbar.container) {
        // Remove existing download button if any
        const existingBtn = toolbar.container.querySelector('.ql-download-container');
        if (existingBtn) existingBtn.remove();

        // Make toolbar container flexbox for proper alignment
        toolbar.container.style.display = 'flex';
        toolbar.container.style.justifyContent = 'space-between';
        toolbar.container.style.alignItems = 'center';
        
        // Wrap existing toolbar groups in a container
        const existingGroups = Array.from(toolbar.container.children);
        const leftContainer = document.createElement('div');
        leftContainer.style.display = 'flex';
        leftContainer.style.alignItems = 'center';
        leftContainer.style.gap = '4px';
        
        // Move existing groups to left container
        existingGroups.forEach(group => {
          if (group instanceof HTMLElement && group.className !== 'ql-download-container') {
            leftContainer.appendChild(group as Node);
          }
        });
        
        // Create download component container on the right
        const downloadContainer = document.createElement('div');
        downloadContainer.className = 'ql-download-container';
        downloadContainer.style.display = 'flex';
        downloadContainer.style.alignItems = 'center';
        downloadContainer.style.height = '28px'; // Match toolbar button height
        
        // Clear toolbar and add both containers
        toolbar.container.innerHTML = '';
        toolbar.container.appendChild(leftContainer);
        toolbar.container.appendChild(downloadContainer);

        // Render download options
        import('react-dom/client').then(({ createRoot }) => {
          const root = createRoot(downloadContainer);
          root.render(
            React.createElement(DownloadOptions, {
              content: generateFormattedText(htmlToJson(htmlContent)),
              fileName: fileName,
              triggerComponent: React.createElement('button', {
                className: 'text-black hover:text-orange-500 transition-colors px-2 py-1 rounded flex items-center gap-1 text-caption font-normal',
                 onClick: () => {},
                style: { 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }
              }, 
              React.createElement('svg', {
                className: 'h-4 w-4',
                fill: 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24',
                xmlns: 'http://www.w3.org/2000/svg'
              }, React.createElement('path', {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: '2',
                d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
              })),
              'Download')
            })
          );
        });
      }
    }
  }, [htmlContent, fileName]);

  // Enhanced force save function with better error handling and state tracking
  const forceSave = useCallback(async () => {
    console.log('[EditableCoverLetter] Force save triggered');
    setSaveState('saving');
    
    try {
      // Cancel any pending debounced save
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Convert current HTML to JSON and save immediately
      const jsonData = htmlToJson(htmlContent);
      const newJsonString = JSON.stringify(jsonData);
      
      console.log('[EditableCoverLetter] Force save - content comparison:', {
        sectionsCount: jsonData.sections.length,
        formattedSections: jsonData.sections.filter(s => s.formatting?.bold).length,
        lastSavedLength: lastSavedContent.length,
        newContentLength: newJsonString.length,
        hasChanges: newJsonString !== lastSavedContent
      });
      
      // Only save if there are actual changes and content exists
      if (newJsonString !== lastSavedContent && jsonData.sections.length > 0) {
        console.log('[EditableCoverLetter] Force saving changes...');
        await onSave(newJsonString);
        setLastSavedContent(newJsonString); // Update tracking
        setSaveState('saved');
        console.log('[EditableCoverLetter] Force save completed successfully');
      } else {
        console.log('[EditableCoverLetter] No changes to force save');
        setSaveState('idle');
      }
    } catch (error) {
      console.error('[EditableCoverLetter] Error force saving cover letter:', error);
      setSaveState('error');
      throw error; // Re-throw so caller can handle
    }
  }, [htmlContent, lastSavedContent, onSave]);

  // Expose force save through ref
  useImperativeHandle(ref, () => ({
    forceSave
  }), [forceSave]);

  // Enhanced content change handler with initialization fix and immediate save
  const handleContentChange = useCallback(async (html: string) => {
    console.log('[EditableCoverLetter] Content changed:', {
      htmlLength: html.length,
      hasBoldElements: html.includes('<strong>') || html.includes('<b>'),
      isInitialized,
      timestamp: new Date().toISOString()
    });
    
    setHtmlContent(html);
    
    // Clear any pending debounced save
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Skip saving if not initialized (prevents first save bug)
    if (!isInitialized) {
      console.log('[EditableCoverLetter] Skipping save - not initialized yet');
      return;
    }
    
    setSaveState('saving');
    
    // Immediate save for better reliability with proper error handling
    try {
      const jsonData = htmlToJson(html);
      const newJsonString = JSON.stringify(jsonData);
      
      console.log('[EditableCoverLetter] HTML→JSON conversion:', {
        sectionsCount: jsonData.sections.length,
        formattedSections: jsonData.sections.filter(s => s.formatting?.bold).length,
        hasChanges: newJsonString !== lastSavedContent
      });
      
      // Only save if there are actual changes and content exists
      if (newJsonString !== lastSavedContent && jsonData.sections.length > 0) {
        console.log('[EditableCoverLetter] Auto-saving changes...', {
          htmlLength: html.length,
          jsonSections: jsonData.sections.length,
          formattedSections: jsonData.sections.filter(s => s.formatting?.bold).length
        });
        
        await onSave(newJsonString);
        setLastSavedContent(newJsonString); // Update tracking
        setSaveState('saved');
        console.log('[EditableCoverLetter] Auto-save completed successfully');
      } else {
        console.log('[EditableCoverLetter] No changes detected, skipping auto-save');
        setSaveState('idle');
      }
    } catch (error) {
      console.error('[EditableCoverLetter] Error auto-saving changes:', error);
      setSaveState('error');
      // Don't throw here - let the component continue working
    }
  }, [isInitialized, lastSavedContent, onSave]);

  // Quill configuration with download button on toolbar
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold'],
        [{ 'list': 'bullet' }],
        ['clean'],
        ['download'] // Add custom download button
      ]
    },
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header', 'bold', 'list', 'bullet'
  ];

  return (
    <div className="space-y-6">
      {/* Save state indicator */}
      {saveState !== 'idle' && (
        <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md ${
          saveState === 'saving' ? 'bg-blue-50 text-blue-700' :
          saveState === 'saved' ? 'bg-green-50 text-green-700' :
          'bg-red-50 text-red-700'
        }`}>
          {saveState === 'saving' && (
            <>
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Saving changes...
            </>
          )}
          {saveState === 'saved' && (
            <>
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              Changes saved successfully
            </>
          )}
          {saveState === 'error' && (
            <>
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              Error saving changes
            </>
          )}
        </div>
      )}
      
      <div className="bg-muted/20 p-4 rounded-lg">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={htmlContent}
          onChange={handleContentChange}
          placeholder="Edit your cover letter content here..."
          modules={modules}
          formats={formats}
          className="min-h-[400px] bg-background text-foreground border border-border rounded-md [&_.ql-editor]:focus-visible:outline-none [&_.ql-toolbar_.ql-stroke]:hover:stroke-orange-500 [&_.ql-toolbar_.ql-fill]:hover:fill-orange-500 [&_.ql-toolbar_button]:text-black [&_.ql-toolbar_button]:hover:text-orange-500 [&_.ql-toolbar_button.ql-active]:text-orange-500 [&_.ql-toolbar_button.ql-active_.ql-stroke]:stroke-orange-500 [&_.ql-toolbar_button.ql-active_.ql-fill]:fill-orange-500"
        />
      </div>
    </div>
  );
});

EditableCoverLetter.displayName = 'EditableCoverLetter';

export default EditableCoverLetter;
