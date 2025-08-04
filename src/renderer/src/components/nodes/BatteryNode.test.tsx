import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import BatteryNode from './BatteryNode'
import type { BatteryNodeData } from '../../types'

const mockBatteryData: BatteryNodeData = {
  label: 'Test Battery',
  p_nom: 50,
  max_hours: 4,
  efficiency: 0.9
}

describe('BatteryNode', () => {
  it('renders battery node with correct icon and label', () => {
    render(<BatteryNode data={mockBatteryData} selected={false} />)
    
    expect(screen.getByText('🔋')).toBeInTheDocument()
    expect(screen.getByText('Battery')).toBeInTheDocument()
  })

  it('displays power and hours information', () => {
    render(<BatteryNode data={mockBatteryData} selected={false} />)
    
    expect(screen.getByText('50 MW')).toBeInTheDocument()
    expect(screen.getByText('4 hrs')).toBeInTheDocument()
  })

  it('shows 0 MW when p_nom is not provided', () => {
    const dataWithoutPNom = { ...mockBatteryData, p_nom: undefined }
    render(<BatteryNode data={dataWithoutPNom} selected={false} />)
    
    expect(screen.getByText('0 MW')).toBeInTheDocument()
  })

  it('shows 0 hrs when max_hours is not provided', () => {
    const dataWithoutMaxHours = { ...mockBatteryData, max_hours: undefined }
    render(<BatteryNode data={dataWithoutMaxHours} selected={false} />)
    
    expect(screen.getByText('0 hrs')).toBeInTheDocument()
  })

  it('applies selected class when selected', () => {
    const { container } = render(<BatteryNode data={mockBatteryData} selected={true} />)
    
    expect(container.firstChild).toHaveClass('selected')
  })

  it('applies correct color class for zero power', () => {
    const zeroData = { ...mockBatteryData, p_nom: 0 }
    const { container } = render(<BatteryNode data={zeroData} selected={false} />)
    
    expect(container.firstChild).toHaveClass('battery-node-zero')
  })

  it('applies correct color class for positive power', () => {
    const { container } = render(<BatteryNode data={mockBatteryData} selected={false} />)
    
    expect(container.firstChild).toHaveClass('battery-node-active')
  })

  it('applies default color class for negative power', () => {
    const negativeData = { ...mockBatteryData, p_nom: -10 }
    const { container } = render(<BatteryNode data={negativeData} selected={false} />)
    
    expect(container.firstChild).toHaveClass('battery-node')
  })
})