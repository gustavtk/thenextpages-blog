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
 * Enhanced error boundary specifically for AdSense components
 * Features:
 * - Captures and displays ad-specific errors
 * - Provides debugging information in development
 * - Graceful fallback rendering
 * - Error recovery mechanisms
 * - Analytics integration for error tracking
 */
export default class AdErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error details
    console.error(`[AdSense Error Boundary] ${this.props.adType || 'Unknown'} ad error:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.retryCount,
    });

    // Send to error tracking service
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Send to analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as unknown as { gtag: (command: string, action: string, params?: Record<string, unknown>) => void }).gtag;
      gtag('event', 'ad_error_boundary', {
        ad_type: this.props.adType || 'unknown',
        error_message: error.message,
        retry_count: this.retryCount,
      });
    }

    // Send to error tracking service if available
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      const Sentry = (window as unknown as { Sentry: { captureException: (error: Error, context?: Record<string, unknown>) => void } }).Sentry;
      Sentry.captureException(error, {
        tags: {
          component: 'adsense_error_boundary',
          ad_type: this.props.adType || 'unknown',
        },
        extra: {
          componentStack: errorInfo.componentStack,
          retryCount: this.retryCount,
        },
      });
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
      });
    }
  };

  private renderErrorUI() {
    const { adType } = this.props;
    const { error, errorInfo } = this.state;
    const canRetry = this.retryCount < this.maxRetries;

    return (
      <div className="ad-error-boundary p-4 my-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto w-12 h-12 mb-3 text-red-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          {/* Error Message */}
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Advertisement Error
          </h3>
          
          <p className="text-sm text-red-600 mb-4">
            {adType ? `${adType} ad` : 'Ad'} failed to load properly
          </p>

          {/* Retry Button */}
          {canRetry && (
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry ({this.retryCount + 1}/{this.maxRetries})
            </button>
          )}

          {/* Development Info */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium text-red-700 hover:text-red-800">
                Debug Information
              </summary>
              <div className="mt-2 p-3 bg-red-100 rounded text-xs text-red-800 font-mono overflow-auto max-h-40">
                <div className="mb-2">
                  <strong>Error:</strong> {error.message}
                </div>
                {error.stack && (
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
                  </div>
                )}
                {errorInfo?.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">{errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Production Message */}
          {process.env.NODE_ENV === 'production' && !canRetry && (
            <p className="text-xs text-red-500 mt-2">
              Please refresh the page if the issue persists
            </p>
          )}
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Otherwise render error UI
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}
