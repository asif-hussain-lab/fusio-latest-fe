import React from 'react'

import ErrorFallback from './ErrorFallback'

export class ErrorBoundary extends React.Component {
  state = { error: false, errorMessage: '' }

  static getDerivedStateFromError(error:any) {
    // Update state to render the fallback UI
    return { error: true, errorMessage: error.toString() }
  }

  componentDidCatch(error:any, errorInfo:any) {
    // Log error to an error reporting service like Sentry
    console.log({ error, errorInfo })
  }

  render() {
    const { error, errorMessage } = this.state
    // eslint-disable-next-line react/prop-types
    const { children }: any = this.props

    return error ? <ErrorFallback /> : children
  }
}
