import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: any;
  info?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  label?: string;
}

// Generic production-safe error boundary to surface full error details in non-dev builds
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: React.ErrorInfo) {
    // Log with structured grouping for easier inspection in browser console
    // eslint-disable-next-line no-console
    console.groupCollapsed(`🔥 ErrorBoundary: ${this.props.label || 'App Section'}`);
    // eslint-disable-next-line no-console
    console.error(error);
    // eslint-disable-next-line no-console
    console.log(info.componentStack);
    // eslint-disable-next-line no-console
    console.groupEnd();
    this.setState({ info });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, info: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 rounded-xl border border-red-500/40 bg-red-950/30 text-red-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{this.props.label || 'Application'} crashed</h2>
            <button
              onClick={this.handleReset}
              className="px-3 py-1 text-xs rounded-md bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 transition-colors"
            >Retry</button>
          </div>
          <p className="text-sm text-red-300/80">Open the browser console for full stack trace. This panel is shown to avoid an opaque minified React error.</p>
          {this.state.error && (
            <pre className="text-xs overflow-auto max-h-64 whitespace-pre-wrap bg-black/30 p-3 rounded-md border border-red-500/20">
{String(this.state.error?.message || this.state.error)}
            </pre>
          )}
          {this.state.info?.componentStack && (
            <details className="text-xs open:mt-2">
              <summary className="cursor-pointer opacity-80 hover:opacity-100">Component Stack</summary>
              <pre className="mt-2 whitespace-pre-wrap">{this.state.info.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;