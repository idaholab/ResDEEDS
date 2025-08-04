import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ComponentPalette from './ComponentPalette'

describe('ComponentPalette', () => {
  it('renders component palette with title', () => {
    render(<ComponentPalette />)
    
    expect(screen.getByText('Components')).toBeInTheDocument()
  })

  it('renders all component items', () => {
    render(<ComponentPalette />)
    
    expect(screen.getByText('Bus')).toBeInTheDocument()
    expect(screen.getByText('Generator')).toBeInTheDocument()
    expect(screen.getByText('Load')).toBeInTheDocument()
    expect(screen.getByText('Battery')).toBeInTheDocument()
  })

  it('renders component icons', () => {
    render(<ComponentPalette />)
    
    expect(screen.getAllByText('⚡')).toHaveLength(2) // Bus and Generator both use this icon
    expect(screen.getByText('🏘️')).toBeInTheDocument()
    expect(screen.getByText('🔋')).toBeInTheDocument()
  })

  it('renders instruction text', () => {
    render(<ComponentPalette />)
    
    expect(screen.getByText('Drag components to the canvas')).toBeInTheDocument()
    expect(screen.getByText('Double-click to edit properties')).toBeInTheDocument()
  })

  it('sets correct drag data on drag start', () => {
    render(<ComponentPalette />)
    
    const mockDataTransfer = {
      setData: vi.fn(),
      effectAllowed: ''
    }
    
    const busComponent = screen.getByText('Bus').closest('.component-item')
    expect(busComponent).toBeInTheDocument()
    
    const dragEvent = new Event('dragstart', { bubbles: true })
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: mockDataTransfer
    })
    
    fireEvent(busComponent!, dragEvent)
    
    expect(mockDataTransfer.setData).toHaveBeenCalledWith('application/reactflow', 'busNode')
    expect(mockDataTransfer.effectAllowed).toBe('move')
  })

  it('makes component items draggable', () => {
    const { container } = render(<ComponentPalette />)
    
    const componentItems = container.querySelectorAll('.component-item')
    
    componentItems.forEach(item => {
      expect(item).toHaveAttribute('draggable', 'true')
    })
  })

  it('applies correct styles to component items', () => {
    render(<ComponentPalette />)
    
    const busItem = screen.getByText('Bus').closest('.component-item')
    expect(busItem).toHaveStyle('border-color: #e74c3c')
    
    const generatorItem = screen.getByText('Generator').closest('.component-item')
    expect(generatorItem).toHaveStyle('border-color: #27ae60')
    
    const loadItem = screen.getByText('Load').closest('.component-item')
    expect(loadItem).toHaveStyle('border-color: #f39c12')
    
    const batteryItem = screen.getByText('Battery').closest('.component-item')
    expect(batteryItem).toHaveStyle('border-color: #3498db')
  })
})