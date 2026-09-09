import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0c0a09',
          color: '#f3f4f6',
          fontFamily: 'monospace',
          padding: '2rem',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h1 style={{ color: '#f97316', fontSize: '1.5rem', fontWeight: 900 }}>Something crashed</h1>
          <pre style={{
            background: '#1c1917',
            color: '#fca5a5',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            maxWidth: '800px',
            width: '100%',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            fontSize: '0.8rem',
            border: '1px solid #7f1d1d'
          }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/' }}
            style={{
              background: '#f97316',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Reload App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
