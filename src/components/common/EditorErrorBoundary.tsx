import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditorErrorBoundaryProps {
  children: ReactNode;
  fallbackContent?: string;
  onReset?: () => void;
}

interface EditorErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class EditorErrorBoundary extends Component<EditorErrorBoundaryProps, EditorErrorBoundaryState> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): EditorErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Rich Text Editor Error:', error, errorInfo);
    this.setState({
      hasError: true,
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 border border-destructive/20 rounded-lg bg-destructive/5">
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The text editor encountered an error and needs to be reset. 
              {this.props.fallbackContent && ' Your content has been preserved.'}
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center justify-between">
            <div className="text-caption text-muted-foreground">
              Error: {this.state.error?.message || 'Unknown error occurred'}
            </div>
            <Button 
              onClick={this.handleReset}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Editor
            </Button>
          </div>

          {this.props.fallbackContent && (
            <div className="mt-4 p-3 bg-muted/20 rounded-md">
              <div className="text-caption font-medium mb-2">Preserved Content:</div>
              <div className="text-caption text-muted-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">
                {this.props.fallbackContent.substring(0, 500)}
                {this.props.fallbackContent.length > 500 && '...'}
              </div>
            </div>
          )}

          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-4">
              <summary className="text-caption cursor-pointer">Error Details (Development)</summary>
              <pre className="text-micro mt-2 p-2 bg-muted/30 rounded text-muted-foreground overflow-auto max-h-32">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default EditorErrorBoundary;