import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { VybeButton } from '@/components/design-system/VybeButton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Network, FileText, Bug } from 'lucide-react';

interface RetryLog {
  url: string;
  attempt: number;
  timestamp: number;
  status: 'success' | 'failed' | 'error';
  statusCode?: number;
  error?: string;
  delay?: number;
}

interface N8nDebugModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debugInfo?: {
    networkTest: string;
    webhookStatus: string;
    webhookResponse: any;
    webhookError: string | null;
  };
  testFiles?: {
    html: string;
    pdf: string;
  };
  pdfData?: string | null;
  htmlData?: string | null;
  retryLogs?: RetryLog[];
}

const N8nDebugModal: React.FC<N8nDebugModalProps> = ({
  open,
  onOpenChange,
  debugInfo,
  testFiles,
  pdfData,
  htmlData,
  retryLogs,
}) => {
  const getStatusIcon = (status: string) => {
    if (status.includes('success') || status.includes('200')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (status.includes('failed') || status.includes('error')) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (status: string) => {
    if (status.includes('success') || status.includes('200')) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
    }
    if (status.includes('failed') || status.includes('error')) {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bug className="h-5 w-5 text-zapier-orange" />
            <span>N8N Webhook Debug Information</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
            <TabsTrigger value="files">Test Files</TabsTrigger>
            <TabsTrigger value="retry">Retry Details</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center space-x-2 mb-2">
                  <Network className="h-4 w-4" />
                  <h3 className="font-medium">Network Test</h3>
                  {debugInfo && getStatusIcon(debugInfo.networkTest)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {debugInfo?.networkTest || 'Not tested'}
                </p>
                {debugInfo && getStatusBadge(debugInfo.networkTest)}
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center space-x-2 mb-2">
                  <Network className="h-4 w-4" />
                  <h3 className="font-medium">Webhook Status</h3>
                  {debugInfo && getStatusIcon(debugInfo.webhookStatus)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {debugInfo?.webhookStatus || 'Not called'}
                </p>
                {debugInfo && getStatusBadge(debugInfo.webhookStatus)}
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <h3 className="font-medium">HTML File</h3>
                  {htmlData ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  {htmlData ? `Loaded (${htmlData.length} chars)` : 'Failed to load'}
                </p>
                {htmlData ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">Downloaded</Badge>
                ) : (
                  <Badge variant="destructive">Missing</Badge>
                )}
              </div>

              <div className="bg-card rounded-lg p-4 border">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <h3 className="font-medium">PDF File</h3>
                  {pdfData ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  {pdfData ? `Loaded (${pdfData.length} chars base64)` : 'Failed to load'}
                </p>
                {pdfData ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">Downloaded</Badge>
                ) : (
                  <Badge variant="destructive">Missing</Badge>
                )}
              </div>
            </div>

            {debugInfo?.webhookError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Webhook Error</h4>
                <p className="text-sm text-red-700">{debugInfo.webhookError}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="webhook" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Webhook URL</h4>
                <code className="block bg-muted p-2 rounded text-sm">
                  https://januscollab.app.n8n.cloud/webhook/cv-analysis
                </code>
              </div>

              <div>
                <h4 className="font-medium mb-2">Request Method</h4>
                <Badge>POST</Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Form Data Fields</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li><code>cv</code> - JSON blob with CV data</li>
                  <li><code>jd</code> - JSON blob with job description data</li>
                </ul>
              </div>

              {debugInfo?.webhookResponse && (
                <div>
                  <h4 className="font-medium mb-2">Response Data</h4>
                  <ScrollArea className="h-64 w-full border rounded p-4">
                    <pre className="text-xs">{JSON.stringify(debugInfo.webhookResponse, null, 2)}</pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Test HTML File</h4>
                <code className="block bg-muted p-2 rounded text-xs break-all mb-2">
                  {testFiles?.html || 'No URL available'}
                </code>
                {htmlData ? (
                  <div>
                    <p className="text-sm text-green-600 mb-2">✓ Successfully downloaded</p>
                    <ScrollArea className="h-32 w-full border rounded p-2">
                      <pre className="text-xs">{htmlData.substring(0, 500)}...</pre>
                    </ScrollArea>
                  </div>
                ) : (
                  <p className="text-sm text-red-600">✗ Failed to download</p>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Test PDF File</h4>
                <code className="block bg-muted p-2 rounded text-xs break-all mb-2">
                  {testFiles?.pdf || 'No URL available'}
                </code>
                {pdfData ? (
                  <p className="text-sm text-green-600">✓ Successfully downloaded and converted to base64</p>
                ) : (
                  <p className="text-sm text-red-600">✗ Failed to download</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="retry" className="space-y-4">
            <div>
              <h4 className="font-medium mb-4">File Download Retry Log</h4>
              {retryLogs && retryLogs.length > 0 ? (
                <ScrollArea className="h-80 w-full border rounded p-4">
                  <div className="space-y-3">
                    {retryLogs.map((log, index) => (
                      <div key={index} className="bg-muted/50 rounded p-3 border-l-4 border-l-gray-300">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{log.url}</span>
                            {log.attempt > 0 && <Badge variant="outline">Attempt {log.attempt}</Badge>}
                            {log.statusCode && <Badge variant="outline">HTTP {log.statusCode}</Badge>}
                          </div>
                          <div className="flex items-center space-x-2">
                            {log.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {log.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                            {log.status === 'error' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                            {log.status === 'success' ? (
                              <Badge className="bg-green-100 text-green-800">Success</Badge>
                            ) : log.status === 'failed' ? (
                              <Badge variant="destructive">Failed</Badge>
                            ) : (
                              <Badge variant="secondary">Error</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            <strong>Time:</strong> {new Date(log.timestamp).toLocaleTimeString()}.{log.timestamp % 1000}ms
                          </p>
                          {log.delay && (
                            <p>
                              <strong>Delay:</strong> {log.delay}ms
                            </p>
                          )}
                          {log.error && (
                            <p>
                              <strong>Details:</strong> {log.error}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground">No retry logs available</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="raw" className="space-y-4">
            <ScrollArea className="h-96 w-full border rounded p-4">
              <pre className="text-xs">
                {JSON.stringify({
                  debugInfo,
                  testFiles,
                  hasHtmlData: !!htmlData,
                  hasPdfData: !!pdfData,
                  htmlLength: htmlData?.length || 0,
                  pdfLength: pdfData?.length || 0
                }, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <VybeButton vybeVariant="outline" onClick={() => onOpenChange(false)}>
            Close
          </VybeButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default N8nDebugModal;