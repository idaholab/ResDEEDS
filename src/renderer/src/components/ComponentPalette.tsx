import type { NodeType } from '../types'
import './ComponentPalette.scss'

interface ComponentItem {
  type: NodeType
  label: string
  icon: string
  color: string
}

const components: ComponentItem[] = [
  { type: 'busNode', label: 'Bus', icon: '⚡', color: '#e74c3c' },
  { type: 'generatorNode', label: 'Generator', icon: '⚡', color: '#27ae60' },
  { type: 'loadNode', label: 'Load', icon: '🏘️', color: '#f39c12' },
  { type: 'batteryNode', label: 'Battery', icon: '🔋', color: '#3498db' },
]

function ComponentPalette() {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType): void => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="component-palette">
      <h3>Components</h3>
      <div className="components-list">
        {components.map((component) => (
          <div
            key={component.type}
            className="component-item"
            onDragStart={(event) => onDragStart(event, component.type)}
            draggable
            style={{ borderColor: component.color }}
          >
            <div className="component-icon">{component.icon}</div>
            <div className="component-label">{component.label}</div>
          </div>
        ))}
      </div>
      <div className="palette-info">
        <p>Drag components to the canvas</p>
        <p>Double-click to edit properties</p>
      </div>
    </div>
  )
}

export default ComponentPalette