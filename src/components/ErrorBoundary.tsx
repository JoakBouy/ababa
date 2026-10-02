import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  declare props: Readonly<{ children: React.ReactNode }>;

  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-paper p-8">
          <div className="max-w-md text-center space-y-4">
            <div className="w-16 h-16 bg-verify-bg rounded-md flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-verify-ink" />
            </div>
            <h1 className="text-2xl font-display text-ink">Something went wrong</h1>
            <p className="text-sm text-ink-2 ">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-accent text-accent-ink rounded-md font-medium transition-colors"
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
