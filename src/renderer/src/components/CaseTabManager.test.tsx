import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CaseTabManager from './CaseTabManager'
import type { Case, HazardType } from '../types'

const mockCases: Case[] = [
  {
    id: 'base-case',
    name: 'Base',
    hazardType: null,
    nodes: [],
    edges: []
  },
  {
    id: 'heat-case',
    name: 'Heat Wave',
    hazardType: 'Heat',
    nodes: [],
    edges: []
  }
]

const defaultProps = {
  cases: mockCases,
  activeCase: 'base-case',
  onCaseSelect: vi.fn(),
  onNewCase: vi.fn(),
  onDeleteCase: vi.fn()
}

describe('CaseTabManager', () => {
  it('renders case tabs correctly', () => {
    render(<CaseTabManager {...defaultProps} />)
    
    expect(screen.getByText('Base')).toBeInTheDocument()
    expect(screen.getByText('Heat Wave')).toBeInTheDocument()
    expect(screen.getByText('+')).toBeInTheDocument()
  })

  it('highlights active case tab', () => {
    render(<CaseTabManager {...defaultProps} />)
    
    const baseTab = screen.getByText('Base').closest('button')
    const heatTab = screen.getByText('Heat Wave').closest('button')
    
    expect(baseTab).toHaveClass('active')
    expect(heatTab).not.toHaveClass('active')
  })

  it('calls onCaseSelect when clicking a case tab', () => {
    const onCaseSelect = vi.fn()
    render(<CaseTabManager {...defaultProps} onCaseSelect={onCaseSelect} />)
    
    fireEvent.click(screen.getByText('Heat Wave'))
    
    expect(onCaseSelect).toHaveBeenCalledWith('heat-case')
  })

  it('shows new case modal when clicking + button', () => {
    render(<CaseTabManager {...defaultProps} />)
    
    fireEvent.click(screen.getByText('+'))
    
    expect(screen.getByText('Create New Case')).toBeInTheDocument()
    expect(screen.getByText('Select Hazard Type:')).toBeInTheDocument()
  })

  it('shows delete button only for non-base cases', () => {
    render(<CaseTabManager {...defaultProps} activeCase="heat-case" />)
    
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('does not show delete button for base case', () => {
    render(<CaseTabManager {...defaultProps} activeCase="base-case" />)
    
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })

  it('shows delete modal when clicking delete button', () => {
    render(<CaseTabManager {...defaultProps} activeCase="heat-case" />)
    
    fireEvent.click(screen.getByText('Delete'))
    
    expect(screen.getByRole('heading', { name: 'Delete Case' })).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()
  })

  it('calls onNewCase when submitting new case modal', () => {
    const onNewCase = vi.fn()
    render(<CaseTabManager {...defaultProps} onNewCase={onNewCase} />)
    
    // Open modal
    fireEvent.click(screen.getByText('+'))
    
    // Select hazard type
    fireEvent.change(screen.getByLabelText('Select Hazard Type:'), { 
      target: { value: 'Wildfire' } 
    })
    
    // Submit
    fireEvent.click(screen.getByText('Create Case'))
    
    expect(onNewCase).toHaveBeenCalledWith('Wildfire')
  })

  it('calls onDeleteCase when confirming delete', () => {
    const onDeleteCase = vi.fn()
    render(<CaseTabManager {...defaultProps} activeCase="heat-case" onDeleteCase={onDeleteCase} />)
    
    // Open delete modal
    fireEvent.click(screen.getByText('Delete'))
    
    // Confirm delete - use button role to distinguish from heading
    fireEvent.click(screen.getByRole('button', { name: 'Delete Case' }))
    
    expect(onDeleteCase).toHaveBeenCalledWith('heat-case')
  })

  it('closes new case modal when cancelled', () => {
    render(<CaseTabManager {...defaultProps} />)
    
    // Open modal
    fireEvent.click(screen.getByText('+'))
    expect(screen.getByText('Create New Case')).toBeInTheDocument()
    
    // Cancel
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Create New Case')).not.toBeInTheDocument()
  })

  it('closes delete modal when cancelled', () => {
    render(<CaseTabManager {...defaultProps} activeCase="heat-case" />)
    
    // Open modal
    fireEvent.click(screen.getByText('Delete'))
    expect(screen.getByRole('heading', { name: 'Delete Case' })).toBeInTheDocument()
    
    // Cancel
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByRole('heading', { name: 'Delete Case' })).not.toBeInTheDocument()
  })

  it('handles empty cases array', () => {
    render(<CaseTabManager {...defaultProps} cases={[]} activeCase="non-existent" />)
    
    expect(screen.getByText('+')).toBeInTheDocument()
    // Delete button shows for non-existent case but shouldn't work
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('renders correct delete button title for active case', () => {
    render(<CaseTabManager {...defaultProps} activeCase="heat-case" />)
    
    const deleteButton = screen.getByText('Delete')
    expect(deleteButton).toHaveAttribute('title', 'Delete Heat Wave case')
  })
})