import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test/test-utils'
import BusNode from './BusNode'
import type { BusNodeData } from '../../types'

describe('BusNode', () => {
  const defaultData: BusNodeData = {
    label: 'Test Bus',
    v_nom: 13.8,
    carrier: 'AC'
  }

  it('renders correctly with default data', () => {
    render(<BusNode data={defaultData} selected={false} />)
    
    expect(screen.getByText('Bus')).toBeInTheDocument()
    expect(screen.getByText('⚡')).toBeInTheDocument()
    expect(screen.getByText('13.8 kV')).toBeInTheDocument()
  })

  it('applies selected class when selected', () => {
    const { container } = render(<BusNode data={defaultData} selected={true} />)
    
    const nodeElement = container.querySelector('.custom-node')
    expect(nodeElement).toHaveClass('selected')
  })

  it('does not apply selected class when not selected', () => {
    const { container } = render(<BusNode data={defaultData} selected={false} />)
    
    const nodeElement = container.querySelector('.custom-node')
    expect(nodeElement).not.toHaveClass('selected')
  })

  it('applies zero voltage class when v_nom is 0', () => {
    const zeroVoltageData: BusNodeData = {
      ...defaultData,
      v_nom: 0
    }
    
    const { container } = render(<BusNode data={zeroVoltageData} selected={false} />)
    
    const nodeElement = container.querySelector('.custom-node')
    expect(nodeElement).toHaveClass('bus-node-zero')
  })

  it('applies active voltage class when v_nom is positive', () => {
    const activeVoltageData: BusNodeData = {
      ...defaultData,
      v_nom: 13.8
    }
    
    const { container } = render(<BusNode data={activeVoltageData} selected={false} />)
    
    const nodeElement = container.querySelector('.custom-node')
    expect(nodeElement).toHaveClass('bus-node-active')
  })

  it('applies default bus class when v_nom is negative', () => {
    const negativeVoltageData: BusNodeData = {
      ...defaultData,
      v_nom: -1
    }
    
    const { container } = render(<BusNode data={negativeVoltageData} selected={false} />)
    
    const nodeElement = container.querySelector('.custom-node')
    expect(nodeElement).toHaveClass('bus-node')
  })

  it('does not display voltage info when v_nom is 0', () => {
    const zeroVoltageData: BusNodeData = {
      ...defaultData,
      v_nom: 0
    }
    
    render(<BusNode data={zeroVoltageData} selected={false} />)
    
    expect(screen.queryByText('0 kV')).not.toBeInTheDocument()
  })

  it('renders node structure correctly', () => {
    const { container } = render(<BusNode data={defaultData} selected={false} />)
    
    // Verify the main node structure
    const nodeElement = container.querySelector('.custom-node')
    expect(nodeElement).toBeInTheDocument()
    expect(nodeElement).toHaveClass('bus-node-active')
  })

  it('has correct node structure with icon and label', () => {
    const { container } = render(<BusNode data={defaultData} selected={false} />)
    
    const nodeIcon = container.querySelector('.node-icon')
    const nodeLabel = container.querySelector('.node-label')
    const nodeInfo = container.querySelector('.node-info')
    
    expect(nodeIcon).toBeInTheDocument()
    expect(nodeLabel).toBeInTheDocument()
    expect(nodeInfo).toBeInTheDocument()
  })
})