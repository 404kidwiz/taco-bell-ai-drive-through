"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-[#151022] flex items-center justify-center p-6">
          <div className="bg-surface-container-low rounded-2xl p-8 max-w-md w-full border border-outline/10 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-error-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-error">error</span>
            </div>
            <div className="space-y-2">
              <h2 className="font-headline text-2xl font-black text-white uppercase tracking-tight">
                Something Went Wrong
              </h2>
              <p className="text-[#CBC3DA] text-sm font-label">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left bg-surface-container-highest rounded-lg p-4 text-xs text-[#CBC3DA] font-mono overflow-auto max-h-40">
                <summary className="cursor-pointer font-bold text-white mb-2">Error Details (Dev Only)</summary>
                <p className="text-error">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 rounded-full bg-surface-bright text-white font-label font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 rounded-full bg-primary-container text-white font-label font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
