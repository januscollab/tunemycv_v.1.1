import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JsonQualityModal } from './JsonQualityModal';
import FileUploadArea from '@/components/analyze/upload/FileUploadArea';
import { DocumentJson } from '@/utils/documentJsonUtils';
import { QualityAssessment } from '@/utils/documentQuality';
import { DocumentTypeDetection } from '@/utils/documentValidation';
import { FileText, TestTube2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface TestResult {
  id: string;
  fileName: string;
  fileSize: number;
  extractedText: string;
  documentJson: DocumentJson;
  typeDetection: DocumentTypeDetection;
  qualityAssessment: QualityAssessment;
  timestamp: Date;
}

export const FileUploadTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);

  const handleFileSelect = (
    file: File, 
    extractedText: string, 
    documentJson: any, 
    typeDetection: any, 
    qualityAssessment: any
  ) => {
    const testResult: TestResult = {
      id: `test-${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      extractedText,
      documentJson,
      typeDetection,
      qualityAssessment,
      timestamp: new Date()
    };
    
    setTestResults(prev => [testResult, ...prev]);
    setSelectedResult(testResult);
  };

  const clearResults = () => {
    setTestResults([]);
    setSelectedResult(null);
  };

  const getQualityIcon = (quality: number) => {
    if (quality >= 0.8) return <CheckCircle className="h-4 w-4 text-success" />;
    if (quality >= 0.6) return <AlertTriangle className="h-4 w-4 text-warning" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  const getProcessingMethodBadge = (method: string) => {
    return method === 'professional' 
      ? <Badge variant="default">Professional NLP</Badge>
      : <Badge variant="secondary">Legacy</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube2 className="h-5 w-5" />
            File Upload Testing Panel
          </CardTitle>
          <p className="text-caption text-muted-foreground">
            Test professional text processing and JSON structure quality
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Test CV Upload</h4>
              <FileUploadArea
                onFileSelect={handleFileSelect}
                uploading={false}
                accept=".pdf,.docx,.txt"
                maxSize="5MB"
                label="Upload test CV"
                fileType="cv"
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">Test Job Description Upload</h4>
              <FileUploadArea
                onFileSelect={handleFileSelect}
                uploading={false}
                accept=".pdf,.docx,.txt"
                maxSize="10MB"
                label="Upload test job description"
                fileType="job_description"
              />
            </div>
          </div>
          
          {testResults.length > 0 && (
            <div className="flex justify-between items-center">
              <Badge variant="outline">{testResults.length} test(s) completed</Badge>
              <Button variant="outline" size="sm" onClick={clearResults}>
                Clear Results
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Test Results List */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {testResults.map((result) => (
                    <div
                      key={result.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedResult?.id === result.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-caption truncate max-w-32">
                              {result.fileName}
                            </div>
                            <div className="text-micro text-muted-foreground">
                              {result.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getQualityIcon(result.documentJson.metadata?.structureQuality || 0)}
                          {getProcessingMethodBadge(result.documentJson.metadata?.processingMethod || 'legacy')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Selected Result Details */}
          {selectedResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Analysis Details</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowJsonModal(true)}
                  >
                    Inspect JSON
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-caption">
                  <div>
                    <span className="text-muted-foreground">File Size:</span>
                    <div className="font-medium">{(selectedResult.fileSize / 1024).toFixed(1)} KB</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Word Count:</span>
                    <div className="font-medium">{selectedResult.extractedText.split(' ').length}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sections:</span>
                    <div className="font-medium">{selectedResult.documentJson.sections.length}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quality Score:</span>
                    <div className="font-medium flex items-center gap-1">
                      {getQualityIcon(selectedResult.documentJson.metadata?.structureQuality || 0)}
                      {Math.round((selectedResult.documentJson.metadata?.structureQuality || 0) * 100)}%
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Processing Method</h4>
                  {getProcessingMethodBadge(selectedResult.documentJson.metadata?.processingMethod || 'legacy')}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Document Type Detection</h4>
                  <Alert>
                    <AlertDescription className="text-caption">
                      Detected as: <strong>{selectedResult.typeDetection?.detectedType || 'Unknown'}</strong>
                      {selectedResult.typeDetection?.confidence && (
                        <span className="ml-2">
                          (Confidence: {Math.round(selectedResult.typeDetection.confidence * 100)}%)
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Structure Preview</h4>
                  <ScrollArea className="h-40 border rounded p-2">
                    <div className="space-y-1 text-micro">
                      {selectedResult.documentJson.sections.slice(0, 10).map((section, index) => (
                        <div key={section.id} className="flex items-center gap-2">
                          <Badge variant="outline" className="text-micro">
                            {section.type}
                            {section.level && ` H${section.level}`}
                          </Badge>
                          <span className="truncate">
                            {section.content?.substring(0, 50) || 
                             (section.items && `${section.items.length} items`) || 
                             'Empty section'}
                          </span>
                        </div>
                      ))}
                      {selectedResult.documentJson.sections.length > 10 && (
                        <div className="text-muted-foreground">
                          ... and {selectedResult.documentJson.sections.length - 10} more sections
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* JSON Quality Modal */}
      <JsonQualityModal
        open={showJsonModal}
        onOpenChange={setShowJsonModal}
        documentJson={selectedResult?.documentJson}
        extractedText={selectedResult?.extractedText}
      />
    </div>
  );
};