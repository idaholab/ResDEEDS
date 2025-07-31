import { useState, useEffect } from 'react'
import type { PyPSANode, PyPSAEdge, NodeType } from '../../types'
import './PropertyEditModal.css'

interface PropertyDefinition {
  name: string
  label: string
  type: 'number' | 'text' | 'select' | 'checkbox'
  default: string | number | boolean
  options?: string[]
  min?: number
  max?: number
  step?: number
}

type NodePropertiesConfig = {
  [K in NodeType | 'lineEdge']: PropertyDefinition[]
}

const nodeProperties: NodePropertiesConfig = {
  busNode: [
    { name: 'v_nom', label: 'Nominal Voltage (kV)', type: 'number', default: 110 },
    { name: 'carrier', label: 'Carrier', type: 'text', default: 'AC' },
    { name: 'x', label: 'X Coordinate', type: 'number', default: 0 },
    { name: 'y', label: 'Y Coordinate', type: 'number', default: 0 },
  ],
  generatorNode: [
    { name: 'p_nom', label: 'Nominal Power (MW)', type: 'number', default: 100 },
    { name: 'carrier', label: 'Carrier', type: 'select', options: ['solar', 'wind', 'diesel', 'utility source'], default: 'solar' },
    { name: 'marginal_cost', label: 'Marginal Cost ($/MWh)', type: 'number', default: 0 },
    { name: 'capital_cost', label: 'Capital Cost ($/MW)', type: 'number', default: 0 },
    { name: 'p_nom_extendable', label: 'Extendable', type: 'checkbox', default: false },
    { name: 'control', label: 'Control', type: 'select', options: ['PQ', 'PV', 'Slack'], default: 'PQ' },
  ],
  loadNode: [
    { name: 'p_set', label: 'Active Power (MW)', type: 'number', default: 50 },
    { name: 'q_set', label: 'Reactive Power (MVAr)', type: 'number', default: 0 },
  ],
  batteryNode: [
    { name: 'p_nom', label: 'Nominal Power (MW)', type: 'number', default: 10 },
    { name: 'max_hours', label: 'Max Hours', type: 'number', default: 4 },
    { name: 'efficiency_store', label: 'Storage Efficiency', type: 'number', default: 0.9, min: 0, max: 1, step: 0.01 },
    { name: 'efficiency_dispatch', label: 'Dispatch Efficiency', type: 'number', default: 0.9, min: 0, max: 1, step: 0.01 },
    { name: 'capital_cost', label: 'Capital Cost ($/MW)', type: 'number', default: 0 },
    { name: 'cyclic_state_of_charge', label: 'Cyclic State of Charge', type: 'checkbox', default: true },
  ],
  lineEdge: [
    { name: 'length', label: 'Length (km)', type: 'number', default: 10 },
    { name: 'r', label: 'Resistance (Ω)', type: 'number', default: 0.1 },
    { name: 'x', label: 'Reactance (Ω)', type: 'number', default: 0.1 },
    { name: 's_nom', label: 'Nominal Power (MVA)', type: 'number', default: 100 },
  ],
}

interface PropertyEditModalProps {
  node: PyPSANode | PyPSAEdge
  onSave: (nodeId: string, formData: Record<string, any>) => void
  onClose: () => void
}

type FormData = Record<string, string | number | boolean>

function PropertyEditModal({ node, onSave, onClose }: PropertyEditModalProps) {
  const [formData, setFormData] = useState<FormData>({})
  const properties = nodeProperties[node.type as keyof NodePropertiesConfig] || []

  useEffect(() => {
    const initialData: FormData = {}
    properties.forEach(prop => {
      initialData[prop.name] = (node.data as any)[prop.name] !== undefined
        ? (node.data as any)[prop.name]
        : prop.default
    })
    setFormData(initialData)
  }, [node, properties])

  const handleChange = (name: string, value: string | boolean, type: string): void => {
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value as string)) : value
    }))
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onSave(node.id, formData)
  }

  const getNodeTypeName = (): string => {
    const typeNames: Record<string, string> = {
      busNode: 'Bus',
      generatorNode: 'Generator',
      loadNode: 'Load',
      batteryNode: 'Battery',
      lineEdge: 'Line',
    }
    return typeNames[node.type] || node.type
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit {getNodeTypeName()} Properties</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="property-form">
          {properties.map(prop => (
            <div key={prop.name} className="form-group">
              <label htmlFor={prop.name}>{prop.label}</label>

              {prop.type === 'select' ? (
                <select
                  id={prop.name}
                  value={String(formData[prop.name] || prop.default)}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(prop.name, e.target.value, prop.type)}
                >
                  {prop.options?.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : prop.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  id={prop.name}
                  checked={Boolean(formData[prop.name]) || false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(prop.name, e.target.checked, prop.type)}
                />
              ) : (
                <input
                  type={prop.type}
                  id={prop.name}
                  value={formData[prop.name] !== undefined ? String(formData[prop.name]) : ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(prop.name, e.target.value, prop.type)}
                  min={prop.min}
                  max={prop.max}
                  step={prop.step}
                />
              )}
            </div>
          ))}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PropertyEditModal