import { Handle, Position } from '@xyflow/react'
import type { GeneratorNodeData } from '../../types'
import './NodeStyles.scss'

interface GeneratorNodeProps {
  data: GeneratorNodeData
  selected: boolean
  onDelete?: () => void
}

function GeneratorNode({ data, selected, onDelete }: GeneratorNodeProps) {
  const getGeneratorIcon = (): string => {
    switch (data.carrier) {
      case 'solar': return '☀️'
      case 'wind': return '💨'
      case 'diesel': return '🔥'
      case 'utility source': return '🔌'
      default: return '⌁'
    }
  }

  const getNodeColorClass = (): string => {
    if (data.p_nom === 0) {
      return 'generator-node-zero'
    } else if (data.p_nom > 0) {
      return 'generator-node-active'
    } else {
      return 'generator-node'
    }
  }

  return (
    <div className={`custom-node ${getNodeColorClass()} ${selected ? 'selected' : ''}`}>
      <Handle type="source" position={Position.Bottom} id="power" />

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

      <div className="node-icon">{getGeneratorIcon()}</div>
      <div className="node-label">Generator</div>
      <div className="node-info">
        {data.p_nom ? <span>{data.p_nom} MW</span> : <span>0 MW</span>}
        {data.carrier && <span>{data.carrier}</span>}
      </div>
    </div>
  )
}

export default GeneratorNode