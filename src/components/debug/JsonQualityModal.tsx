import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DocumentJson } from '@/utils/documentJsonUtils';
import { ProfessionalTextProcessor } from '@/utils/professionalTextProcessor';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface JsonQualityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentJson?: DocumentJson;
  extractedText?: string;
}

export const JsonQualityModal: React.FC<JsonQualityModalProps> = ({
  open,
  onOpenChange,
  documentJson,
  extractedText
}) => {
  if (!documentJson) return null;

  const structureQuality = documentJson.metadata?.structureQuality || 0;
  const processingMethod = documentJson.metadata?.processingMethod || 'unknown';
  const sectionsCount = documentJson.sections.length;
  const headingsCount = documentJson.sections.filter(s => s.type === 'heading').length;
  const paragraphsCount = documentJson.sections.filter(s => s.type === 'paragraph').length;
  const listsCount = documentJson.sections.filter(s => s.type === 'list').length;

  const getQualityColor = (quality: number) => {
    if (quality >= 0.8) return 'text-success';
    if (quality >= 0.6) return 'text-warning';
    return 'text-destructive';
  };

  const getQualityIcon = (quality: number) => {
    if (quality >= 0.8) return <CheckCircle className="h-4 w-4 text-success" />;
    if (quality >= 0.6) return <AlertTriangle className="h-4 w-4 text-warning" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  const getQualityBadge = (quality: number) => {
    if (quality >= 0.8) return <Badge variant="outline" className="border-success text-success">Excellent</Badge>;
    if (quality >= 0.6) return <Badge variant="outline" className="border-warning text-warning">Good</Badge>;
    return <Badge variant="outline" className="border-destructive text-destructive">Poor</Badge>;
  };

  const avgConfidence = documentJson.sections.reduce((sum, s) => sum + (s.confidence || 0), 0) / sectionsCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Document JSON Quality Analysis
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 p-1">
            {/* Overall Quality */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Overall Quality</span>
                  {getQualityBadge(structureQuality)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {getQualityIcon(structureQuality)}
                  <span className={`font-medium ${getQualityColor(structureQuality)}`}>
                    {Math.round(structureQuality * 100)}% Structure Quality
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-caption">
                  <div>
                    <span className="text-muted-foreground">Processing Method:</span>
                    <Badge variant={processingMethod === 'professional' ? 'default' : 'secondary'} className="ml-2">
                      {processingMethod}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Average Confidence:</span>
                    <span className="ml-2 font-medium">{Math.round(avgConfidence * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Structure Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Structure Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="text-h3 font-bold text-primary">{sectionsCount}</div>
                    <div className="text-caption text-muted-foreground">Total Sections</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-h3 font-bold text-primary">{headingsCount}</div>
                    <div className="text-caption text-muted-foreground">Headings</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-h3 font-bold text-primary">{paragraphsCount}</div>
                    <div className="text-caption text-muted-foreground">Paragraphs</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-h3 font-bold text-primary">{listsCount}</div>
                    <div className="text-caption text-muted-foreground">Lists</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Details */}
            <Card>
              <CardHeader>
                <CardTitle>Section Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-60">
                  <div className="space-y-3">
                    {documentJson.sections.map((section, index) => (
                      <div key={section.id} className="border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-micro">
                              {section.type}
                              {section.level && ` H${section.level}`}
                            </Badge>
                            <span className="text-caption font-medium">Section {index + 1}</span>
                          </div>
                          {section.confidence && (
                            <Badge 
                              variant="outline" 
                              className={section.confidence > 0.8 ? 'border-success text-success' : 
                                        section.confidence > 0.6 ? 'border-warning text-warning' : 
                                        'border-destructive text-destructive'}
                            >
                              {Math.round(section.confidence * 100)}%
                            </Badge>
                          )}
                        </div>
                        <div className="text-micro text-muted-foreground">
                          {section.content && (
                            <div>Content: {section.content.substring(0, 100)}{section.content.length > 100 ? '...' : ''}</div>
                          )}
                          {section.items && (
                            <div>Items: {section.items.length} bullet points</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Raw JSON Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Raw JSON Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-60">
                  <pre className="text-micro bg-muted/50 p-3 rounded-md overflow-x-auto">
                    {ProfessionalTextProcessor.beautifyJSON(documentJson)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quality Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-caption">
                  {structureQuality < 0.6 && (
                    <div className="flex items-start gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        Document structure quality is poor. Consider improving source document formatting with clear headings and organized sections.
                      </div>
                    </div>
                  )}
                  {headingsCount === 0 && (
                    <div className="flex items-start gap-2 text-warning">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        No headings detected. Add clear section headers to improve document structure.
                      </div>
                    </div>
                  )}
                  {processingMethod === 'legacy' && (
                    <div className="flex items-start gap-2 text-warning">
                      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        Using legacy processing. Document structure could be improved for better results.
                      </div>
                    </div>
                  )}
                  {structureQuality >= 0.8 && (
                    <div className="flex items-start gap-2 text-success">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        Excellent document structure! Your content is well-organized and will render beautifully.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};