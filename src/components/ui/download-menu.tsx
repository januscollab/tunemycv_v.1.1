import React, { useState } from 'react';
import { Download, FileText, FileImage, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface DownloadOption {
  label: string;
  format: 'pdf' | 'word' | 'text' | 'html';
  icon: React.ReactNode;
  action: () => void | Promise<void>;
}

interface DownloadMenuProps {
  /** The content or data to be downloaded */
  content?: any;
  /** Custom download options - if not provided, will show default PDF/Word/Text */
  options?: DownloadOption[];
  /** Button variant */
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Custom button text */
  buttonText?: string;
  /** Whether to show icon in button */
  showIcon?: boolean;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom download handlers */
  onDownloadPDF?: () => void | Promise<void>;
  onDownloadWord?: () => void | Promise<void>;
  onDownloadText?: () => void | Promise<void>;
  onDownloadHTML?: () => void | Promise<void>;
}

export const DownloadMenu: React.FC<DownloadMenuProps> = ({
  content,
  options,
  variant = "outline",
  size = "default",
  buttonText = "Download",
  showIcon = true,
  disabled = false,
  className = "",
  onDownloadPDF,
  onDownloadWord,
  onDownloadText,
  onDownloadHTML,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async (action: () => void | Promise<void>, format: string) => {
    setIsDownloading(true);
    try {
      await action();
      toast({
        title: "Download Started",
        description: `Your ${format} download has started.`,
      });
    } catch (error) {
      console.error(`Download failed for ${format}:`, error);
      toast({
        title: "Download Failed",
        description: `Failed to download ${format}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Default download options if none provided
  const defaultOptions: DownloadOption[] = [
    {
      label: "Download as PDF",
      format: "pdf",
      icon: <FileText className="h-4 w-4" />,
      action: onDownloadPDF || (() => console.log("PDF download not implemented")),
    },
    {
      label: "Download as Word",
      format: "word", 
      icon: <FileImage className="h-4 w-4" />,
      action: onDownloadWord || (() => console.log("Word download not implemented")),
    },
    {
      label: "Download as Text",
      format: "text",
      icon: <File className="h-4 w-4" />,
      action: onDownloadText || (() => console.log("Text download not implemented")),
    },
  ];

  // Add HTML option if handler is provided
  if (onDownloadHTML) {
    defaultOptions.push({
      label: "Download as HTML",
      format: "html",
      icon: <FileText className="h-4 w-4" />,
      action: onDownloadHTML,
    });
  }

  const downloadOptions = options || defaultOptions;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isDownloading}
          className={className}
        >
          {showIcon && <Download className="h-4 w-4 mr-2" />}
          {isDownloading ? "Downloading..." : buttonText}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {downloadOptions.map((option, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => handleDownload(option.action, option.format)}
            className="flex items-center gap-2 cursor-pointer"
            disabled={isDownloading}
          >
            {option.icon}
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DownloadMenu;