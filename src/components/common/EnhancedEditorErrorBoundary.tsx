import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { validateEditorContent, sanitizeEditorContent } from '@/utils/editorValidation';

interface Props {
  children: ReactNode;
  fallbackContent: string;
  onReset: () => void;
  onContentRestore?: (content: string) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryCount: number;
}

class EnhancedEditorErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`[EnhancedEditorErrorBoundary] Error in ${this.props.componentName}:`, error, errorInfo);
    
    // Enhanced error logging for debugging
    console.error('[EnhancedEditorErrorBoundary] Error boundary triggered:', {
      component: this.props.componentName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      fallbackContent: this.props.fallbackContent?.substring(0, 100),
      retryCount: this.state.retryCount
    });

    this.setState({
      error,
      errorInfo,
      retryCount: this.state.retryCount + 1
    });

    // Attempt to restore content if restoration callback is provided
    if (this.props.onContentRestore && this.props.fallbackContent) {
      try {
        const sanitizedContent = sanitizeEditorContent(this.props.fallbackContent);
        console.log('[EnhancedEditorErrorBoundary] Attempting automatic content restoration with sanitized content');
        this.props.onContentRestore(sanitizedContent);
      } catch (restoreError) {
        console.error('[EnhancedEditorErrorBoundary] Automatic content restoration failed:', restoreError);
      }
    }

    // Auto-retry for certain types of errors
    if (this.state.retryCount < this.maxRetries && this.isRetryableError(error)) {
      console.log('[EnhancedEditorErrorBoundary] Scheduling auto-retry...');
      setTimeout(() => {
        this.handleRetry();
      }, 1000);
    }
  }

  private isRetryableError(error: Error): boolean {
    const retryableMessages = [
      'Cannot read properties',
      'undefined is not an object',
      'Cannot access before initialization'
    ];
    
    return retryableMessages.some(msg => 
      error.message?.toLowerCase().includes(msg.toLowerCase())
    );
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    this.props.onReset();
  };

  handleHardReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
    this.props.onReset();
  };

  handleRestoreContent = () => {
    console.log('[EnhancedEditorErrorBoundary] Manual content restoration triggered');
    
    if (this.props.onContentRestore && this.props.fallbackContent) {
      try {
        // Validate and sanitize content before restoration
        const validation = validateEditorContent(this.props.fallbackContent);
        if (!validation.isValid) {
          console.warn('[EnhancedEditorErrorBoundary] Content validation failed:', validation.errors);
        }
        
        const sanitizedContent = sanitizeEditorContent(this.props.fallbackContent);
        console.log('[EnhancedEditorErrorBoundary] Restoring content:', { 
          originalLength: this.props.fallbackContent?.length || 0,
          sanitizedLength: sanitizedContent.length 
        });
        
        this.props.onContentRestore(sanitizedContent);
      } catch (error) {
        console.error('[EnhancedEditorErrorBoundary] Manual restoration failed:', error);
        return; // Don't reset error state if restoration failed
      }
    }
    this.handleHardReset();
  };

  render() {
    if (this.state.hasError) {
      const { componentName = 'Editor', fallbackContent } = this.props;
      const { error, retryCount } = this.state;
      const canRetry = retryCount < this.maxRetries;

      return (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>{componentName} Error</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    The editor encountered an unexpected error and needs to be reset.
                  </p>
                  <p className="text-sm opacity-90">
                    {error?.message || 'Unknown error occurred'}
                  </p>
                  {retryCount > 0 && (
                    <p className="text-sm opacity-75">
                      Retry attempts: {retryCount}/{this.maxRetries}
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {fallbackContent && (
              <div className="p-3 bg-muted/50 rounded-md border">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Content Preview ({fallbackContent.length} characters)
                  </span>
                </div>
                <div className="text-sm bg-background rounded p-2 max-h-32 overflow-y-auto">
                  {fallbackContent.length > 200 
                    ? `${fallbackContent.substring(0, 200)}...` 
                    : fallbackContent}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  size="sm"
                  className="font-normal"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              
              <Button
                onClick={this.handleHardReset}
                variant="outline"
                size="sm"
                className="font-normal"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Editor
              </Button>

              {this.props.onContentRestore && fallbackContent && (
                <Button
                  onClick={this.handleRestoreContent}
                  variant="default"
                  size="sm"
                  className="font-normal"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Restore Content
                </Button>
              )}
            </div>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-4">
                <summary className="text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                  {error.stack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default EnhancedEditorErrorBoundary;