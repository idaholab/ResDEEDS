import { Handle, Position } from '@xyflow/react'
import type { BatteryNodeData } from '../../types'
import './NodeStyles.scss'

interface BatteryNodeProps {
  data: BatteryNodeData
  selected: boolean
}

function BatteryNode({ data, selected }: BatteryNodeProps) {
  const getNodeColorClass = (): string => {
    if (data.p_nom === 0) {
      return 'battery-node-zero'
    } else if (data.p_nom > 0) {
      return 'battery-node-active'
    } else {
      return 'battery-node'
    }
  }

  return (
    <div className={`custom-node ${getNodeColorClass()} ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} id="charge" />
      <Handle type="source" position={Position.Bottom} id="discharge" />

      <div className="node-icon">🔋</div>
      <div className="node-label">Battery</div>
      <div className="node-info">
        {data.p_nom ? <span>{data.p_nom} MW</span> : <span>0 MW</span>}
        {data.max_hours ? <span>{data.max_hours} hrs</span> : <span>0 hrs</span>}
      </div>
    </div>
  )
}

export default BatteryNode