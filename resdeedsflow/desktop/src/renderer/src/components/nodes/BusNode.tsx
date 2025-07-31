import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { BusNodeData } from '../../types'
import './NodeStyles.css'

interface BusNodeProps {
  data: BusNodeData
  selected: boolean
}

function BusNode({ data, selected }: BusNodeProps) {
  const getNodeColorClass = (): string => {
    if (data.v_nom === 0) {
      return 'bus-node-zero'
    } else if (data.v_nom > 0) {
      return 'bus-node-active'
    } else {
      return 'bus-node'
    }
  }

  return (
    <div className={`custom-node ${getNodeColorClass()} ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      
      <div className="node-icon">⚡</div>
      <div className="node-label">Bus</div>
      <div className="node-info">
        {data.v_nom && <span>{data.v_nom} kV</span>}
      </div>
    </div>
  )
}

export default BusNode