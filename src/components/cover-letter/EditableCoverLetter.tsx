
import React, { useState } from 'react';
import { Edit, Save, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import DocumentActions from '@/components/common/DocumentActions';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface EditableCoverLetterProps {
  content: string;
  isEditing: boolean;
  onEditToggle: () => void;
  fileName: string;
}

const EditableCoverLetter: React.FC<EditableCoverLetterProps> = ({
  content,
  isEditing,
  onEditToggle,
  fileName
}) => {
  const [editedContent, setEditedContent] = useState(content);

  const downloadAsText = () => {
    const blob = new Blob([editedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${fileName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                font-size: 12pt; 
                line-height: 1.5; 
                margin: 20mm; 
                white-space: pre-wrap;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>${editedContent.replace(/\n/g, '<br>')}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const downloadAsWord = async () => {
    try {
      const paragraphs = editedContent.split('\n').map(paragraph => 
        new Paragraph({
          children: [new TextRun(paragraph || ' ')],
          spacing: { after: 120 }
        })
      );

      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });

      const buffer = await Packer.toBlob(doc);
      const url = URL.createObjectURL(buffer);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Word document:', error);
      downloadAsText();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Generated Cover Letter
        </h3>
        <div className="flex items-center space-x-2">
          <DocumentActions
            onEdit={onEditToggle}
            onDownloadTxt={downloadAsText}
            onDownloadPdf={downloadAsPDF}
            onDownloadWord={downloadAsWord}
            showEdit={true}
            showDownload={true}
          />
        </div>
      </div>
      
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[400px] text-sm leading-relaxed"
              placeholder="Edit your cover letter content..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={onEditToggle}
                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-zapier-orange transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
              <button
                onClick={onEditToggle}
                className="flex items-center px-4 py-2 bg-zapier-orange text-white rounded-md hover:bg-zapier-orange/90 transition-colors"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {editedContent}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableCoverLetter;
