import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import GeneratorNode from './GeneratorNode'
import type { GeneratorNodeData } from '../../types'

const mockGeneratorData: GeneratorNodeData = {
  label: 'Test Generator',
  p_nom: 100,
  carrier: 'solar',
  marginal_cost: 0.05
}

describe('GeneratorNode', () => {
  it('renders generator node with correct label', () => {
    render(<GeneratorNode data={mockGeneratorData} selected={false} />)
    
    expect(screen.getByText('Generator')).toBeInTheDocument()
  })

  it('displays power and carrier information', () => {
    render(<GeneratorNode data={mockGeneratorData} selected={false} />)
    
    expect(screen.getByText('100 MW')).toBeInTheDocument()
    expect(screen.getByText('solar')).toBeInTheDocument()
  })

  it('shows 0 MW when p_nom is not provided', () => {
    const dataWithoutPNom = { ...mockGeneratorData, p_nom: undefined }
    render(<GeneratorNode data={dataWithoutPNom} selected={false} />)
    
    expect(screen.getByText('0 MW')).toBeInTheDocument()
  })

  it('displays correct icon for solar carrier', () => {
    render(<GeneratorNode data={mockGeneratorData} selected={false} />)
    
    expect(screen.getByText('☀️')).toBeInTheDocument()
  })

  it('displays correct icon for wind carrier', () => {
    const windData = { ...mockGeneratorData, carrier: 'wind' }
    render(<GeneratorNode data={windData} selected={false} />)
    
    expect(screen.getByText('💨')).toBeInTheDocument()
  })

  it('displays correct icon for diesel carrier', () => {
    const dieselData = { ...mockGeneratorData, carrier: 'diesel' }
    render(<GeneratorNode data={dieselData} selected={false} />)
    
    expect(screen.getByText('🔥')).toBeInTheDocument()
  })

  it('displays correct icon for utility source carrier', () => {
    const utilityData = { ...mockGeneratorData, carrier: 'utility source' }
    render(<GeneratorNode data={utilityData} selected={false} />)
    
    expect(screen.getByText('🔌')).toBeInTheDocument()
  })

  it('displays default icon for unknown carrier', () => {
    const unknownData = { ...mockGeneratorData, carrier: 'unknown' }
    render(<GeneratorNode data={unknownData} selected={false} />)
    
    expect(screen.getByText('⌁')).toBeInTheDocument()
  })

  it('applies selected class when selected', () => {
    const { container } = render(<GeneratorNode data={mockGeneratorData} selected={true} />)
    
    expect(container.firstChild).toHaveClass('selected')
  })

  it('applies correct color class for zero power', () => {
    const zeroData = { ...mockGeneratorData, p_nom: 0 }
    const { container } = render(<GeneratorNode data={zeroData} selected={false} />)
    
    expect(container.firstChild).toHaveClass('generator-node-zero')
  })

  it('applies correct color class for positive power', () => {
    const { container } = render(<GeneratorNode data={mockGeneratorData} selected={false} />)
    
    expect(container.firstChild).toHaveClass('generator-node-active')
  })

  it('applies default color class for negative power', () => {
    const negativeData = { ...mockGeneratorData, p_nom: -10 }
    const { container } = render(<GeneratorNode data={negativeData} selected={false} />)
    
    expect(container.firstChild).toHaveClass('generator-node')
  })
})