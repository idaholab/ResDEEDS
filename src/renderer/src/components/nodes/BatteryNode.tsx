import { Handle, Position } from '@xyflow/react'
import { usePowerUnits } from '../../contexts/PowerUnitsContext'
import type { BatteryNodeData } from '../../types'
import './NodeStyles.scss'

interface BatteryNodeProps {
  data: BatteryNodeData
  selected: boolean
  onDelete?: () => void
}

function BatteryNode({ data, selected, onDelete }: BatteryNodeProps) {
  const { formatPowerValue } = usePowerUnits()

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

      {onDelete && (
        <button
          className="node-delete-btn"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          title="Delete node"
        >
          ×
        </button>
      )}

      <div className="node-icon">🔋</div>
      <div className="node-label">Battery</div>
      <div className="node-info">
        {data.p_nom ? <span>{formatPowerValue(data.p_nom)}</span> : <span>{formatPowerValue(0)}</span>}
        {data.max_hours ? <span>{data.max_hours} hrs</span> : <span>0 hrs</span>}
      </div>
    </div>
  )
}

export default BatteryNode