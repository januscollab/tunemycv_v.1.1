import React, { useState } from 'react';
import { FileText, Eye, Edit, AlertTriangle, CheckCircle, Info, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatFileSize } from '@/utils/fileUtils';
import { assessDocumentQuality, getQualityColor, getQualityBadge, QualityAssessment } from '@/utils/documentQuality';

interface DocumentPreviewCardProps {
  fileName: string;
  fileSize: number;
  extractedText: string;
  documentType: 'cv' | 'job_description';
  onOpenVerification: () => void;
  onRemove: () => void;
}

const DocumentPreviewCard: React.FC<DocumentPreviewCardProps> = ({
  fileName,
  fileSize,
  extractedText,
  documentType,
  onOpenVerification,
  onRemove
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const quality = assessDocumentQuality(extractedText, fileName, documentType);
  
  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return quality.score >= 80 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border border-apple-core/20 dark:border-citrus/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <FileText className="h-6 w-6 text-apricot mt-1" />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-medium text-blueberry dark:text-citrus truncate">
                {fileName}
              </CardTitle>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm text-blueberry/60 dark:text-apple-core/60">
                  {formatFileSize(fileSize)}
                </span>
                <span className="text-sm text-blueberry/60 dark:text-apple-core/60">
                  {quality.wordCount} words
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getQualityColor(quality.score)} border-current`}
                >
                  {getQualityBadge(quality.score)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenVerification}
              className="text-zapier-orange border-zapier-orange hover:bg-zapier-orange hover:text-white"
            >
              <Edit className="h-4 w-4 mr-1" />
              Review
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Remove
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Quality Issues */}
        <div className="space-y-2 mb-4">
          {quality.issues.slice(0, 2).map((issue, index) => (
            <Alert key={index} className="py-2">
              <div className="flex items-start space-x-2">
                {getIssueIcon(issue.type)}
                <div className="flex-1 min-w-0">
                  <AlertDescription className="text-sm">
                    <span className="font-medium">{issue.title}:</span> {issue.description}
                    {issue.suggestion && (
                      <div className="mt-1 text-xs text-blueberry/70 dark:text-apple-core/70">
                        💡 {issue.suggestion}
                        {issue.helpUrl && (
                          <Button 
                            variant="link" 
                            className="h-auto p-0 ml-1 text-xs text-zapier-orange hover:text-zapier-orange/80"
                            onClick={() => window.open('/help-centre#document-quality', '_blank')}
                          >
                            Learn more
                          </Button>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
          
          {quality.issues.length > 2 && (
            <Button
              variant="link"
              size="sm"
              onClick={onOpenVerification}
              className="text-xs text-zapier-orange hover:text-zapier-orange/80 p-0 h-auto"
            >
              View {quality.issues.length - 2} more issues
            </Button>
          )}
        </div>

        {/* Text Preview */}
        <Collapsible open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              {isPreviewOpen ? 'Hide Preview' : 'Show Preview'}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="bg-muted rounded-md p-3 max-h-40 overflow-y-auto border border-border">
              <pre className="whitespace-pre-wrap text-xs text-muted-foreground leading-relaxed">
                {extractedText.substring(0, 500)}
                {extractedText.length > 500 && '...'}
              </pre>
            </div>
            {extractedText.length > 500 && (
              <Button
                variant="link"
                size="sm"
                onClick={onOpenVerification}
                className="text-xs text-zapier-orange hover:text-zapier-orange/80 mt-2 p-0 h-auto"
              >
                View full document →
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default DocumentPreviewCard;