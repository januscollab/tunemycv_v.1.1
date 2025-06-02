
import React from 'react';
import { Download, FileText, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DownloadMenuProps {
  onDownloadTxt: () => void;
  onDownloadPdf: () => void;
  onDownloadWord: () => void;
  disabled?: boolean;
}

const DownloadMenu: React.FC<DownloadMenuProps> = ({
  onDownloadTxt,
  onDownloadPdf,
  onDownloadWord,
  disabled = false
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
        <DropdownMenuItem onClick={onDownloadTxt} className="hover:bg-gray-100 dark:hover:bg-gray-700">
          <FileText className="h-4 w-4 mr-2" />
          Download as TXT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownloadPdf} className="hover:bg-gray-100 dark:hover:bg-gray-700">
          <File className="h-4 w-4 mr-2" />
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDownloadWord} className="hover:bg-gray-100 dark:hover:bg-gray-700">
          <File className="h-4 w-4 mr-2" />
          Download as Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadMenu;
