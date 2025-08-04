import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ThemeToggle from './ThemeToggle'

// Mock the theme context for testing
const mockUseTheme = vi.fn()

vi.mock('../contexts/ThemeContext', () => ({
  useTheme: () => mockUseTheme()
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders light theme button correctly', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: vi.fn()
    })

    render(<ThemeToggle />)
    
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('🌙')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Switch to dark theme')
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark theme')
  })

  it('renders dark theme button correctly', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      toggleTheme: vi.fn()
    })

    render(<ThemeToggle />)
    
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('☀️')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('title', 'Switch to light theme')
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light theme')
  })

  it('calls toggleTheme when clicked', () => {
    const mockToggleTheme = vi.fn()
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme
    })

    render(<ThemeToggle />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockToggleTheme).toHaveBeenCalledOnce()
  })

  it('has correct CSS classes', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: vi.fn()
    })

    render(<ThemeToggle />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn', 'btn-outline-secondary', 'btn-sm')
  })
})