import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
  componentStack: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, componentStack: null }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ componentStack: info.componentStack ?? null })
    void window.quarterline?.app
      ?.reportRendererError({
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack ?? undefined
      })
      .catch(() => {})
  }

  handleReset = (): void => {
    this.setState({ error: null, componentStack: null })
  }

  handleReload = (): void => {
    location.reload()
  }

  render(): ReactNode {
    const { error, componentStack } = this.state
    if (!error) return this.props.children

    return (
      <div className="error-boundary">
        <div className="error-boundary-card">
          <div className="error-boundary-eyebrow">Something broke</div>
          <div className="error-boundary-title">
            QuarterlineV2 hit an unexpected error
          </div>
          <div className="error-boundary-body">
            <p>
              The error has been written to <code>~/.quarterline/logs/crash.log</code>.
              You can try recovering, or reload the window if the problem persists.
            </p>
            <details className="error-boundary-details">
              <summary>Technical details</summary>
              <pre>{error.message}</pre>
              {error.stack && <pre>{error.stack}</pre>}
              {componentStack && <pre>{componentStack}</pre>}
            </details>
          </div>
          <div className="error-boundary-actions">
            <button
              type="button"
              className="dialog-btn dialog-btn-primary"
              onClick={this.handleReset}
            >
              Try again
            </button>
            <button
              type="button"
              className="dialog-btn dialog-btn-secondary"
              onClick={this.handleReload}
            >
              Reload window
            </button>
          </div>
        </div>
      </div>
    )
  }
}
