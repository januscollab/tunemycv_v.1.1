import React from 'react';
import { FileText, Edit, AlertTriangle, CheckCircle, Info, X, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatFileSize } from '@/utils/fileUtils';
import { assessDocumentQuality, getQualityColor, getQualityBadge, QualityAssessment } from '@/utils/documentQuality';

interface DocumentPreviewCardProps {
  fileName: string;
  fileSize: number;
  extractedText: string;
  documentType: 'cv' | 'job_description';
  onOpenVerification: () => void;
  onRemove: () => void;
  onSaveToCVs?: () => void;
  canSaveToCVs?: boolean;
  onConfirmDocumentType?: (confirmedType: 'cv' | 'job_description') => void;
}

const DocumentPreviewCard: React.FC<DocumentPreviewCardProps> = ({
  fileName,
  fileSize,
  extractedText,
  documentType,
  onOpenVerification,
  onRemove,
  onSaveToCVs,
  canSaveToCVs = false,
  onConfirmDocumentType
}) => {
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
              <CardTitle className="text-body font-medium text-blueberry dark:text-citrus truncate">
                {fileName}
              </CardTitle>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-caption text-blueberry/60 dark:text-apple-core/60">
                  {formatFileSize(fileSize)}
                </span>
                <span className="text-caption text-blueberry/60 dark:text-apple-core/60">
                  {quality.wordCount} words
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-micro ${getQualityColor(quality.score)} border-current`}
                >
                  {getQualityBadge(quality.score)}
                </Badge>
                {quality.typeDetection && quality.typeDetection.needsUserConfirmation && (
                  <Badge variant="outline" className="text-micro text-yellow-600 dark:text-yellow-400 border-yellow-500">
                    Type Confirmation Needed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Document Type Detection Info */}
        {quality.typeDetection && quality.typeDetection.needsUserConfirmation && onConfirmDocumentType && (
          <div className="mb-4">
            <Alert className="py-2 border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-caption">
                <span className="font-medium">Document type confirmation needed:</span> 
                {quality.typeDetection.detectedType === 'unknown' ? (
                  ' Unable to automatically determine document type.'
                ) : (
                  ` Detected as ${quality.typeDetection.detectedType === 'cv' ? 'CV/Resume' : 'Job Description'} with ${quality.typeDetection.confidence}% confidence.`
                )}
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => onConfirmDocumentType(quality.typeDetection!.detectedType === 'unknown' ? 'cv' : quality.typeDetection!.detectedType)}
                  className="text-micro text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 p-0 h-auto ml-1"
                >
                  Click to confirm →
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Quality Issues */}
        <div className="space-y-2 mb-4">
          {quality.issues.slice(0, 2).map((issue, index) => (
            <Alert key={index} className="py-2">
              <div className="flex items-start space-x-2">
                {getIssueIcon(issue.type)}
                <div className="flex-1 min-w-0">
                  <AlertDescription className="text-caption">
                    <span className="font-medium">{issue.title}:</span> {issue.description}
                    {issue.suggestion && (
                      <div className="mt-1 text-micro text-blueberry/70 dark:text-apple-core/70">
                        💡 {issue.suggestion}
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
              className="text-micro text-zapier-orange hover:text-zapier-orange/80 p-0 h-auto"
            >
              View {quality.issues.length - 2} more issues
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenVerification}
            className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
          >
            <Edit className="h-3 w-3 mr-2" />
            Review & Edit
          </Button>
          {onSaveToCVs && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveToCVs}
              disabled={!canSaveToCVs}
              className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
            >
              <Heart className="h-3 w-3 mr-2" />
              Add to Saved CVs
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
          >
            <X className="h-3 w-3 mr-2" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentPreviewCard;