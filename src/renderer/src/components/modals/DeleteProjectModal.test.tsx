import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DeleteProjectModal from './DeleteProjectModal'

const mockProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  projectName: 'Test Project'
}

describe('DeleteProjectModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when not open', () => {
    const { container } = render(
      <DeleteProjectModal {...mockProps} isOpen={false} />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('renders modal when open', () => {
    render(<DeleteProjectModal {...mockProps} />)
    
    expect(screen.getAllByText('Delete Project')).toHaveLength(2) // Title and button
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()
    expect(screen.getByText(/Test Project/)).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    render(<DeleteProjectModal {...mockProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)
    
    expect(mockProps.onClose).toHaveBeenCalledOnce()
  })

  it('calls onConfirm and onClose when delete button is clicked', () => {
    render(<DeleteProjectModal {...mockProps} />)
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)
    
    expect(mockProps.onConfirm).toHaveBeenCalledOnce()
    expect(mockProps.onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape key is pressed', () => {
    const { container } = render(<DeleteProjectModal {...mockProps} />)
    
    const modalContent = container.querySelector('.modal-content')
    fireEvent.keyDown(modalContent!, { key: 'Escape' })
    
    expect(mockProps.onClose).toHaveBeenCalledOnce()
  })

  it('calls onConfirm and onClose when Enter key is pressed', () => {
    const { container } = render(<DeleteProjectModal {...mockProps} />)
    
    const modalContent = container.querySelector('.modal-content')
    fireEvent.keyDown(modalContent!, { key: 'Enter' })
    
    expect(mockProps.onConfirm).toHaveBeenCalledOnce()
    expect(mockProps.onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop is clicked', () => {
    const { container } = render(<DeleteProjectModal {...mockProps} />)
    
    const backdrop = container.querySelector('.modal')
    fireEvent.click(backdrop!)
    
    expect(mockProps.onClose).toHaveBeenCalledOnce()
  })

  it('does not close when modal content is clicked', () => {
    const { container } = render(<DeleteProjectModal {...mockProps} />)
    
    const modalContent = container.querySelector('.modal-content')
    fireEvent.click(modalContent!)
    
    expect(mockProps.onClose).not.toHaveBeenCalled()
  })
})