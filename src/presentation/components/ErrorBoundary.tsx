import React from 'react'
import { ExclamationTriangleIcon } from '@/presentation/components/common/icons'
import styles from './ErrorBoundary.module.scss'

/**
 * Props for the ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: React.ReactNode
  /** Optional custom fallback UI */
  fallback?: React.ReactNode
  /** Optional callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * State for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * ErrorBoundary Component
 *
 * Catches React errors anywhere in the child component tree, logs those errors,
 * and displays a fallback UI instead of crashing the entire app.
 *
 * Features:
 * - Catches all React rendering errors
 * - User-friendly error messages
 * - Detailed error info in development mode
 * - Retry functionality to reset error state
 * - Error logging callback support
 * - Accessible error UI
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    })

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    // Reset error state to allow retry
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = () => {
    // Reload the entire page
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      const isDevelopment = import.meta.env.DEV

      return (
        <div className={styles.errorBoundary} role="alert">
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <ExclamationTriangleIcon />
            </div>

            <h1 className={styles.errorTitle}>Something went wrong</h1>

            <p className={styles.errorMessage}>
              We're sorry, but something unexpected happened. Please try again or reload the page.
            </p>

            {/* Show error details in development */}
            {isDevelopment && this.state.error && (
              <details className={styles.errorDetails}>
                <summary className={styles.errorDetailsSummary}>
                  Error Details (Development Only)
                </summary>
                <div className={styles.errorDetailsContent}>
                  <p className={styles.errorName}>
                    <strong>Error:</strong> {this.state.error.name}
                  </p>
                  <p className={styles.errorMessageText}>
                    <strong>Message:</strong> {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className={styles.errorStack}>{this.state.error.stack}</pre>
                  )}
                  {this.state.errorInfo && (
                    <pre className={styles.errorStack}>{this.state.errorInfo.componentStack}</pre>
                  )}
                </div>
              </details>
            )}

            {/* Action buttons */}
            <div className={styles.errorActions}>
              <button
                type="button"
                onClick={this.handleReset}
                className={styles.retryButton}
                aria-label="Try again"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className={styles.reloadButton}
                aria-label="Reload page"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

