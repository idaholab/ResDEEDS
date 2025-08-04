import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditableProjectName from '../EditableProjectName'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

describe('EditableProjectName', () => {
  const mockOnSave = vi.fn()

  beforeEach(() => {
    mockOnSave.mockClear()
  })

  it('renders the project name correctly', () => {
    render(
      <EditableProjectName 
        value="Test Project" 
        onSave={mockOnSave} 
      />
    )
    
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByTitle('Double-click to rename')).toBeInTheDocument()
  })

  it('enters edit mode on double click', async () => {
    const user = userEvent.setup()
    
    render(
      <EditableProjectName 
        value="Test Project" 
        onSave={mockOnSave} 
      />
    )
    
    const projectName = screen.getByText('Test Project')
    await user.dblClick(projectName)
    
    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument()
    expect(screen.getByTitle('Press Enter to save, Escape to cancel')).toBeInTheDocument()
  })

  it('saves on Enter key press', async () => {
    const user = userEvent.setup()
    mockOnSave.mockResolvedValue(true)
    
    render(
      <EditableProjectName 
        value="Test Project" 
        onSave={mockOnSave} 
      />
    )
    
    const projectName = screen.getByText('Test Project')
    await user.dblClick(projectName)
    
    const input = screen.getByDisplayValue('Test Project')
    await user.clear(input)
    await user.type(input, 'New Project Name')
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('New Project Name')
    })
  })

  it('cancels on Escape key press', async () => {
    const user = userEvent.setup()
    
    render(
      <EditableProjectName 
        value="Test Project" 
        onSave={mockOnSave} 
      />
    )
    
    const projectName = screen.getByText('Test Project')
    await user.dblClick(projectName)
    
    const input = screen.getByDisplayValue('Test Project')
    await user.clear(input)
    await user.type(input, 'New Project Name')
    await user.keyboard('{Escape}')
    
    expect(mockOnSave).not.toHaveBeenCalled()
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('trims whitespace and validates empty names', async () => {
    const user = userEvent.setup()
    mockOnSave.mockResolvedValue(true)
    
    render(
      <EditableProjectName 
        value="Test Project" 
        onSave={mockOnSave} 
      />
    )
    
    const projectName = screen.getByText('Test Project')
    await user.dblClick(projectName)
    
    const input = screen.getByDisplayValue('Test Project')
    await user.clear(input)
    await user.type(input, '   ')
    await user.keyboard('{Enter}')
    
    expect(mockOnSave).not.toHaveBeenCalled()
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('respects maxLength property', async () => {
    const user = userEvent.setup()
    
    render(
      <EditableProjectName 
        value="Test" 
        onSave={mockOnSave}
        maxLength={10}
      />
    )
    
    const projectName = screen.getByText('Test')
    await user.dblClick(projectName)
    
    const input = screen.getByDisplayValue('Test')
    await user.clear(input)
    await user.type(input, 'This is a very long project name that exceeds limit')
    
    expect(input).toHaveValue('This is a ')
  })
})