
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
import jsPDF from 'jspdf';
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

  const downloadAsPDF = async () => {
    setIsDownloading(true);
    try {
      const pdf = new jsPDF();
      const splitText = pdf.splitTextToSize(content, 180);
      pdf.text(splitText, 10, 10);
      pdf.save(`${fileName}.pdf`);
      
      toast({
        title: 'Success',
        description: 'Cover letter downloaded as PDF',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download PDF',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadAsWord = async () => {
    setIsDownloading(true);
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun(content)
              ],
            }),
          ],
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
        description: 'Cover letter downloaded as Word document',
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
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Cover letter downloaded as text file',
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
      <DropdownMenuContent className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" align="end">
        <DropdownMenuItem 
          onClick={downloadAsPDF}
          className="hover:bg-zapier-orange/10 hover:text-zapier-orange cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-2" />
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={downloadAsWord}
          className="hover:bg-zapier-orange/10 hover:text-zapier-orange cursor-pointer"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Download as Word
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={downloadAsText}
          className="hover:bg-zapier-orange/10 hover:text-zapier-orange cursor-pointer"
        >
          <FileText className="h-4 w-4 mr-2" />
          Download as Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadOptions;
