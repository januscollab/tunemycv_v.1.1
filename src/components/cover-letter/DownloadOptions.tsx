
import React from 'react';
import { Download, FileText, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface DownloadOptionsProps {
  content: string;
  fileName: string;
}

const DownloadOptions: React.FC<DownloadOptionsProps> = ({ content, fileName }) => {
  const downloadAsText = () => {
    const blob = new Blob([content], { type: 'text/plain' });
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
    // Create a temporary div for PDF generation
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '210mm';
    tempDiv.style.padding = '20mm';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '12pt';
    tempDiv.style.lineHeight = '1.5';
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.textContent = content;
    
    document.body.appendChild(tempDiv);
    
    // Use the browser's print functionality to generate PDF
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
          <body>${content.replace(/\n/g, '<br>')}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
    
    document.body.removeChild(tempDiv);
  };

  const downloadAsWord = async () => {
    try {
      // Split content into paragraphs
      const paragraphs = content.split('\n').map(paragraph => 
        new Paragraph({
          children: [new TextRun(paragraph || ' ')], // Ensure empty lines are preserved
          spacing: { after: 120 } // Add spacing after each paragraph
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
      // Fallback to text download if Word generation fails
      downloadAsText();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={downloadAsText}>
          <FileText className="h-4 w-4 mr-2" />
          Download as TXT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadAsPDF}>
          <File className="h-4 w-4 mr-2" />
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadAsWord}>
          <File className="h-4 w-4 mr-2" />
          Download as Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadOptions;
