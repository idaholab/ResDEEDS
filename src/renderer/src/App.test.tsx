import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

// Mock the child components to isolate App testing
vi.mock('./components/HomePage', () => {
  return {
    default: () => <div data-testid="homepage">HomePage Component</div>
  }
})

vi.mock('./components/ProjectEditor', () => {
  return {
    default: () => <div data-testid="project-editor">ProjectEditor Component</div>
  }
})

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByTestId('homepage')).toBeInTheDocument()
  })

  it('renders ThemeProvider and router structure', () => {
    const { container } = render(<App />)
    
    // Check that the main container div is rendered
    expect(container.querySelector('.vh-100.vw-100.overflow-hidden')).toBeInTheDocument()
  })

  it('renders HomePage by default on root route', () => {
    render(<App />)
    
    expect(screen.getByTestId('homepage')).toBeInTheDocument()
    expect(screen.queryByTestId('project-editor')).not.toBeInTheDocument()
  })
})