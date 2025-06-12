import React, { useState } from 'react';
import { FileText, Edit, AlertTriangle, CheckCircle, Info, X, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatFileSize } from '@/utils/fileUtils';
import { assessDocumentQuality, getQualityColor, getQualityBadge, QualityAssessment } from '@/utils/documentQuality';
import BounceLoader from '@/components/ui/bounce-loader';

import { DocumentJson } from '@/utils/documentJsonUtils';

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
  documentJson?: DocumentJson;
  showDebugTools?: boolean;
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
  onConfirmDocumentType,
  documentJson,
  showDebugTools = process.env.NODE_ENV === 'development'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [saveButtonVisible, setSaveButtonVisible] = useState(canSaveToCVs);
  
  const quality = assessDocumentQuality(extractedText, fileName, documentType);

  const handleReviewEdit = async () => {
    setIsLoading(true);
    try {
      await onOpenVerification();
    } finally {
      // Keep loading state briefly to show user action was registered
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleSaveToCVs = async () => {
    if (onSaveToCVs) {
      setIsSaving(true);
      try {
        await onSaveToCVs();
        // Hide button immediately after successful save
        setSaveButtonVisible(false);
      } finally {
        // Keep saving state briefly to show user action was registered
        setTimeout(() => setIsSaving(false), 500);
      }
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove();
    } finally {
      // Keep removing state briefly to show user action was registered
      setTimeout(() => setIsRemoving(false), 500);
    }
  };
  
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
              </div>
            </div>
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
              View {quality.issues.length - 2} more observations
            </Button>
          )}
        </div>

        {/* Action Buttons - Reordered: 1. Add to Saved CVs, 2. Review & Edit, 3. Remove */}
        <div className="flex items-center justify-end space-x-2">
          {onSaveToCVs && canSaveToCVs && saveButtonVisible && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveToCVs}
              disabled={isSaving}
              className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
            >
              {isSaving ? (
                <BounceLoader size="sm" className="mr-2" />
              ) : (
                <Heart className="h-3 w-3 mr-2" />
              )}
              Add to Saved CVs
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReviewEdit}
            disabled={isLoading}
            className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
          >
            {isLoading ? (
              <BounceLoader size="sm" className="mr-2" />
            ) : (
              <Edit className="h-3 w-3 mr-2" />
            )}
            Review & Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={isRemoving}
            className="font-normal hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-200"
          >
            {isRemoving ? (
              <BounceLoader size="sm" className="mr-2" />
            ) : (
              <X className="h-3 w-3 mr-2" />
            )}
            Remove
          </Button>
        </div>
        
      </CardContent>
    </Card>
  );
};

export default DocumentPreviewCard;