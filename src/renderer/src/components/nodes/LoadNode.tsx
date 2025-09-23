import { Handle, Position } from '@xyflow/react'
import type { LoadNodeData } from '../../types'
import './NodeStyles.scss'

interface LoadNodeProps {
  data: LoadNodeData
  selected: boolean
  onDelete?: () => void
}

function LoadNode({ data, selected, onDelete }: LoadNodeProps) {
  const getNodeColorClass = (): string => {
    if (data.p_set === 0) {
      return 'load-node-zero'
    } else if (data.p_set > 0) {
      return 'load-node-active'
    } else {
      return 'load-node'
    }
  }

  return (
    <div className={`custom-node ${getNodeColorClass()} ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} id="power" />

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

      <div className="node-icon">🏭</div>
      <div className="node-label">Load</div>
      <div className="node-info">
        {data.p_set && <span>{data.p_set} MW</span>}
      </div>
    </div>
  )
}

export default LoadNode