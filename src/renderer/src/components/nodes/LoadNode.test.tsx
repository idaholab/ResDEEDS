import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadNode from './LoadNode'
import type { LoadNodeData } from '../../types'

const mockLoadData: LoadNodeData = {
  label: 'Test Load',
  p_set: 75,
  q_set: 25
}

describe('LoadNode', () => {
  it('renders load node with correct icon and label', () => {
    render(<LoadNode data={mockLoadData} selected={false} />)
    
    expect(screen.getByText('🏭')).toBeInTheDocument()
    expect(screen.getByText('Load')).toBeInTheDocument()
  })

  it('displays power information when p_set is provided', () => {
    render(<LoadNode data={mockLoadData} selected={false} />)
    
    expect(screen.getByText('75 MW')).toBeInTheDocument()
  })

  it('does not display power when p_set is not provided', () => {
    const dataWithoutPSet = { ...mockLoadData, p_set: undefined }
    render(<LoadNode data={dataWithoutPSet} selected={false} />)
    
    expect(screen.queryByText('MW')).not.toBeInTheDocument()
  })

  it('applies selected class when selected', () => {
    const { container } = render(<LoadNode data={mockLoadData} selected={true} />)
    
    expect(container.firstChild).toHaveClass('selected')
  })

  it('applies correct color class for zero power', () => {
    const zeroData = { ...mockLoadData, p_set: 0 }
    const { container } = render(<LoadNode data={zeroData} selected={false} />)
    
    expect(container.firstChild).toHaveClass('load-node-zero')
  })

  it('applies correct color class for positive power', () => {
    const { container } = render(<LoadNode data={mockLoadData} selected={false} />)
    
    expect(container.firstChild).toHaveClass('load-node-active')
  })

  it('applies default color class for negative power', () => {
    const negativeData = { ...mockLoadData, p_set: -10 }
    const { container } = render(<LoadNode data={negativeData} selected={false} />)
    
    expect(container.firstChild).toHaveClass('load-node')
  })

  it('renders with zero power set', () => {
    const zeroData = { ...mockLoadData, p_set: 0 }
    render(<LoadNode data={zeroData} selected={false} />)
    
    expect(screen.getByText('Load')).toBeInTheDocument()
  })
})