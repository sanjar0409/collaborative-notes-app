import { Component } from 'react';
import { Button } from './ui/Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-auth-bg px-4" role="alert">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-danger-light rounded-card-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-page-heading font-bold text-content-primary mb-2">
              Something went wrong
            </h1>
            <p className="text-body text-content-secondary mb-6">
              An unexpected error occurred. Please try again or refresh the page.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="primary" size="md" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button variant="outline" size="md" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-6 text-left text-caption text-danger bg-danger-light/20 p-4 rounded-card overflow-auto max-h-40">
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
