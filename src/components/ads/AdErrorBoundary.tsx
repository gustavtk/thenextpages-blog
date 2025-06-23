'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  adType?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error boundary specifically for AdSense components
 * Prevents ad errors from breaking the entire page
 */
export default class AdErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[AdSense Error Boundary] ${this.props.adType || 'Ad'} error:`, error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log to error tracking service if available
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      const Sentry = (window as unknown as { Sentry: { captureException: (error: Error, context?: Record<string, unknown>) => void } }).Sentry;
      Sentry.captureException(error, {
        tags: {
          component: 'adsense',
          ad_type: this.props.adType || 'unknown',
        },
        extra: errorInfo,
      });
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI (only in development)
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="border border-red-300 bg-red-50 rounded-md p-4 m-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Ad Component Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>The {this.props.adType || 'ad'} component encountered an error.</p>
                  {this.state.error && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">Error Details</summary>
                      <pre className="mt-2 text-xs overflow-auto bg-red-100 p-2 rounded">
                        {this.state.error.message}
                      </pre>
                    </details>
                  )}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={this.handleRetry}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retry Ad
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // In production, fail silently (don't render anything)
      return null;
    }

    return this.props.children;
  }
}
