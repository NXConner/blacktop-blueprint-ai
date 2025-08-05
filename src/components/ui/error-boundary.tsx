import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onRetry={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="glass-elevated p-8 max-w-md w-full text-center border border-destructive/20">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        
        <h2 className="text-xl font-semibold mb-2">System Error Detected</h2>
        
        <p className="text-muted-foreground mb-4">
          An unexpected error occurred while processing your request. The system has logged this incident for analysis.
        </p>
        
        {error && (
          <details className="text-left mb-4 p-3 bg-muted/50 rounded-lg text-sm">
            <summary className="cursor-pointer font-medium">Error Details</summary>
            <pre className="mt-2 text-xs text-muted-foreground overflow-x-auto">
              {error.message}
            </pre>
          </details>
        )}
        
        <div className="flex gap-2 justify-center">
          {onRetry && (
            <Button 
              onClick={onRetry}
              className="glass-card hover:glow-primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Operation
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="glass-card border-glass-border hover:glow-accent"
          >
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Hook for functional error boundaries
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error:', error, errorInfo);
    // You could also send this to an error reporting service
  };
}