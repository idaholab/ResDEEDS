import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AnimatedEdge from './AnimatedEdge'
import { Position } from '@xyflow/react'

// Mock getBezierPath
vi.mock('@xyflow/react', () => ({
  getBezierPath: vi.fn(() => ['M 10,10 L 50,50']),
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right'
  }
}))

const mockProps = {
  id: 'test-edge',
  sourceX: 10,
  sourceY: 10,
  targetX: 50,
  targetY: 50,
  sourcePosition: Position.Bottom,
  targetPosition: Position.Top
}

// Wrapper component for SVG context
const SVGWrapper = ({ children }: { children: React.ReactNode }) => (
  <svg>{children}</svg>
)

describe('AnimatedEdge', () => {
  it('renders edge path with correct id', () => {
    const { container } = render(
      <SVGWrapper>
        <AnimatedEdge {...mockProps} />
      </SVGWrapper>
    )
    
    const pathElement = container.querySelector('path')
    expect(pathElement).toBeInTheDocument()
    expect(pathElement).toHaveAttribute('id', 'test-edge')
  })

  it('applies default class name', () => {
    const { container } = render(
      <SVGWrapper>
        <AnimatedEdge {...mockProps} />
      </SVGWrapper>
    )
    
    const pathElement = container.querySelector('path')
    expect(pathElement).toHaveClass('react-flow__edge-path')
  })

  it('applies custom style when provided', () => {
    const customStyle = { stroke: '#ff0000', strokeWidth: 3 }
    const { container } = render(
      <SVGWrapper>
        <AnimatedEdge {...mockProps} style={customStyle} />
      </SVGWrapper>
    )
    
    const pathElement = container.querySelector('path')
    expect(pathElement).toHaveStyle('stroke: #ff0000')
    expect(pathElement).toHaveStyle('stroke-width: 3')
  })

  it('applies marker end when provided', () => {
    const markerEnd = 'url(#arrow)'
    const { container } = render(
      <SVGWrapper>
        <AnimatedEdge {...mockProps} markerEnd={markerEnd} />
      </SVGWrapper>
    )
    
    const pathElement = container.querySelector('path')
    expect(pathElement).toHaveAttribute('marker-end', markerEnd)
  })

  it('renders with bezier path', () => {
    const { container } = render(
      <SVGWrapper>
        <AnimatedEdge {...mockProps} />
      </SVGWrapper>
    )
    
    const pathElement = container.querySelector('path')
    expect(pathElement).toHaveAttribute('d', 'M 10,10 L 50,50')
  })

  it('renders without style when not provided', () => {
    const { container } = render(
      <SVGWrapper>
        <AnimatedEdge {...mockProps} />
      </SVGWrapper>
    )
    
    const pathElement = container.querySelector('path')
    expect(pathElement).toBeInTheDocument()
  })
})