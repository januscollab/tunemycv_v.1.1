
import React, { useState } from 'react';
import { Download, FileText, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface DownloadOptionsProps {
  content: string;
  fileName: string;
  triggerComponent?: React.ReactNode;
}

const DownloadOptions: React.FC<DownloadOptionsProps> = ({ 
  content, 
  fileName, 
  triggerComponent 
}) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  // Function to properly convert HTML content to clean text
  const convertHtmlToText = (htmlContent: string): string => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Replace <br> tags with newlines before getting text content
    const brTags = tempDiv.querySelectorAll('br');
    brTags.forEach(br => {
      br.replaceWith('\n');
    });
    
    // Replace </p> tags with double newlines for paragraph breaks
    const pTags = tempDiv.querySelectorAll('p');
    pTags.forEach(p => {
      p.after('\n\n');
    });
    
    // Get clean text content
    let cleanText = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up excessive whitespace and newlines
    cleanText = cleanText
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple newlines with double newlines
      .replace(/^\s+|\s+$/g, '') // Trim start and end
      .replace(/[ \t]+/g, ' '); // Replace multiple spaces/tabs with single space
    
    return cleanText;
  };

  const downloadAsWord = async () => {
    setIsDownloading(true);
    try {
      const cleanContent = convertHtmlToText(content);
      
      // Split content into paragraphs for better Word formatting
      const paragraphs = cleanContent.split('\n\n').filter(p => p.trim().length > 0);
      const docParagraphs = paragraphs.map(paragraph => 
        new Paragraph({
          children: [new TextRun(paragraph.trim())],
          spacing: { after: 240 } // Add spacing between paragraphs
        })
      );
      
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: docParagraphs,
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Document downloaded as Word file',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download Word document',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadAsText = () => {
    try {
      const cleanContent = convertHtmlToText(content);
      const blob = new Blob([cleanContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Document downloaded as text file',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download text file',
        variant: 'destructive',
      });
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" disabled={isDownloading}>
      <Download className="h-4 w-4 mr-1" />
      {isDownloading ? 'Downloading...' : 'Download'}
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerComponent || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuItem 
          onClick={downloadAsWord}
          className="cursor-pointer"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Download as Word
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={downloadAsText}
          className="cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-2" />
          Download as Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadOptions;
