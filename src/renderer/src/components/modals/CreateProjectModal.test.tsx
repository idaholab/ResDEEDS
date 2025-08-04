import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CreateProjectModal from './CreateProjectModal'

const mockProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  defaultName: ''
}

describe('CreateProjectModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when not open', () => {
    const { container } = render(
      <CreateProjectModal {...mockProps} isOpen={false} />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('renders modal when open', () => {
    render(<CreateProjectModal {...mockProps} />)
    
    expect(screen.getByText('Create Project')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('shows default name in input', () => {
    render(<CreateProjectModal {...mockProps} defaultName="Test Project" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('Test Project')
  })

  it('updates project name on input change', () => {
    render(<CreateProjectModal {...mockProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'New Project Name' } })
    
    expect(input).toHaveValue('New Project Name')
  })

  it('prevents submission for empty project name', () => {
    render(<CreateProjectModal {...mockProps} />)
    
    const submitButton = screen.getByRole('button', { name: /create/i })
    fireEvent.click(submitButton)
    
    expect(mockProps.onConfirm).not.toHaveBeenCalled()
  })

  it('handles long project names', () => {
    render(<CreateProjectModal {...mockProps} />)
    
    const input = screen.getByRole('textbox')
    const longName = 'a'.repeat(51) // 51 characters
    fireEvent.change(input, { target: { value: longName } })
    
    const submitButton = screen.getByRole('button', { name: /create/i })
    fireEvent.click(submitButton)
    
    expect(mockProps.onConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm with valid project name', () => {
    render(<CreateProjectModal {...mockProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Valid Project Name' } })
    
    const submitButton = screen.getByRole('button', { name: /create/i })
    fireEvent.click(submitButton)
    
    expect(mockProps.onConfirm).toHaveBeenCalledWith('Valid Project Name')
    expect(mockProps.onClose).toHaveBeenCalledOnce()
  })

  it('trims whitespace from project name', () => {
    render(<CreateProjectModal {...mockProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '  Trimmed Name  ' } })
    
    const submitButton = screen.getByRole('button', { name: /create/i })
    fireEvent.click(submitButton)
    
    expect(mockProps.onConfirm).toHaveBeenCalledWith('Trimmed Name')
  })

  it('calls onClose when cancel button is clicked', () => {
    render(<CreateProjectModal {...mockProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)
    
    expect(mockProps.onClose).toHaveBeenCalledOnce()
  })

  it('focuses input when modal opens', async () => {
    render(<CreateProjectModal {...mockProps} />)
    
    await waitFor(() => {
      const input = screen.getByRole('textbox')
      expect(input).toHaveFocus()
    }, { timeout: 200 })
  })

  it('resets state when modal reopens', () => {
    const { rerender } = render(<CreateProjectModal {...mockProps} />)
    
    // Change input value
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Test Input' } })
    expect(input).toHaveValue('Test Input')
    
    // Close and reopen modal
    rerender(<CreateProjectModal {...mockProps} isOpen={false} />)
    rerender(<CreateProjectModal {...mockProps} isOpen={true} />)
    
    // Should reset to default
    const newInput = screen.getByRole('textbox')
    expect(newInput).toHaveValue('')
  })
})