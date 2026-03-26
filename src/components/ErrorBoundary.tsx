import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-8">
          <div className="max-w-md text-center space-y-4">
            <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-error" />
            </div>
            <h1 className="text-2xl font-headline font-bold text-on-surface">Something went wrong</h1>
            <p className="text-sm text-on-surface-variant font-body">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-label font-medium hover:bg-primary/90 transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
