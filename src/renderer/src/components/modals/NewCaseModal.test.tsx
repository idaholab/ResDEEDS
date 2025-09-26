import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import NewCaseModal from './NewCaseModal'

const defaultProps = {
  onSubmit: vi.fn(),
  onCancel: vi.fn()
}

describe('NewCaseModal', () => {
  it('renders modal with title and form elements', () => {
    render(<NewCaseModal {...defaultProps} />)
    
    expect(screen.getByText('Create New Case')).toBeInTheDocument()
    expect(screen.getByLabelText('Select Hazard Type:')).toBeInTheDocument()
    expect(screen.getByText('Create Case')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('renders all hazard type options', () => {
    render(<NewCaseModal {...defaultProps} />)
    
    const select = screen.getByLabelText('Select Hazard Type:')
    expect(select).toHaveValue('Heat')
    
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(7)

    const hazardTypes = ['Heat', 'Freeze', 'Hurricane', 'Wildfire', 'Tornado', 'Earthquake', 'Custom']
    hazardTypes.forEach(hazard => {
      expect(screen.getByRole('option', { name: hazard })).toBeInTheDocument()
    })
  })

  it('has Heat as default selected hazard type', () => {
    render(<NewCaseModal {...defaultProps} />)
    
    const select = screen.getByLabelText('Select Hazard Type:')
    expect(select).toHaveValue('Heat')
  })

  it('allows changing hazard type selection', () => {
    render(<NewCaseModal {...defaultProps} />)
    
    const select = screen.getByLabelText('Select Hazard Type:')
    fireEvent.change(select, { target: { value: 'Wildfire' } })
    
    expect(select).toHaveValue('Wildfire')
  })

  it('calls onSubmit with selected hazard type when form is submitted', () => {
    const onSubmit = vi.fn()
    render(<NewCaseModal {...defaultProps} onSubmit={onSubmit} />)
    
    const select = screen.getByLabelText('Select Hazard Type:')
    fireEvent.change(select, { target: { value: 'Earthquake' } })
    
    fireEvent.click(screen.getByText('Create Case'))
    
    expect(onSubmit).toHaveBeenCalledWith('Earthquake', undefined)
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<NewCaseModal {...defaultProps} onCancel={onCancel} />)
    
    fireEvent.click(screen.getByText('Cancel'))
    
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onCancel when close button is clicked', () => {
    const onCancel = vi.fn()
    render(<NewCaseModal {...defaultProps} onCancel={onCancel} />)
    
    fireEvent.click(screen.getByLabelText('Close'))
    
    expect(onCancel).toHaveBeenCalled()
  })

  it('prevents form submission without selecting hazard type', () => {
    const onSubmit = vi.fn()
    render(<NewCaseModal {...defaultProps} onSubmit={onSubmit} />)
    
    const select = screen.getByLabelText('Select Hazard Type:')
    expect(select).toBeRequired()
  })

  it('shows descriptive text about case creation', () => {
    render(<NewCaseModal {...defaultProps} />)
    
    expect(screen.getByText(/This will create a new case with the selected hazard type/)).toBeInTheDocument()
    expect(screen.getByText(/copying the current Base case as a starting point/)).toBeInTheDocument()
  })

  it('submits form with submit button', () => {
    const onSubmit = vi.fn()
    render(<NewCaseModal {...defaultProps} onSubmit={onSubmit} />)
    
    fireEvent.click(screen.getByText('Create Case'))
    
    expect(onSubmit).toHaveBeenCalledWith('Heat', undefined)
  })

  it('renders with correct accessibility attributes', () => {
    render(<NewCaseModal {...defaultProps} />)

    expect(screen.getByLabelText('Close')).toHaveAttribute('aria-label', 'Close')
    expect(screen.getByLabelText('Select Hazard Type:')).toHaveAttribute('required')
    expect(screen.getByText('Create New Case')).toBeInTheDocument()
  })

  it('shows custom name input when Custom is selected', () => {
    render(<NewCaseModal {...defaultProps} />)

    const select = screen.getByLabelText('Select Hazard Type:')
    fireEvent.change(select, { target: { value: 'Custom' } })

    expect(screen.getByLabelText('Case Name:')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter custom case name')).toBeInTheDocument()
  })

  it('calls onSubmit with custom name when Custom is selected', () => {
    const onSubmit = vi.fn()
    render(<NewCaseModal {...defaultProps} onSubmit={onSubmit} />)

    const select = screen.getByLabelText('Select Hazard Type:')
    fireEvent.change(select, { target: { value: 'Custom' } })

    const customNameInput = screen.getByLabelText('Case Name:')
    fireEvent.change(customNameInput, { target: { value: 'My Custom Case' } })

    fireEvent.click(screen.getByText('Create Case'))

    expect(onSubmit).toHaveBeenCalledWith('Custom', 'My Custom Case')
  })
})