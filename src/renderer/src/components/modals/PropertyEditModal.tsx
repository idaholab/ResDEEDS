import { useState, useEffect } from 'react'
import type { PyPSANode, PyPSAEdge, NodeType, PyPSAComponentData, PyPSAEdgeData } from '../../types'

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
  onSave: (nodeId: string, formData: Partial<PyPSAComponentData | PyPSAEdgeData>) => void
  onClose: () => void
}

type FormData = Record<string, string | number | boolean>

function PropertyEditModal({ node, onSave, onClose }: PropertyEditModalProps) {
  const [formData, setFormData] = useState<FormData>({})
  const properties = nodeProperties[node.type as keyof NodePropertiesConfig] || []

  useEffect(() => {
    const initialData: FormData = {}
    properties.forEach(prop => {
      const nodeData = node.data as PyPSAComponentData | PyPSAEdgeData
      initialData[prop.name] = (nodeData as Record<string, unknown>)[prop.name] !== undefined
        ? (nodeData as Record<string, unknown>)[prop.name] as string | number | boolean
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
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h1 className="modal-title fs-5">Edit {getNodeTypeName()} Properties</h1>
            <button 
              type="button" 
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                {properties.map(prop => (
                  <div key={prop.name} className="col-md-6">
                    <label htmlFor={prop.name} className="form-label">{prop.label}</label>

                    {prop.type === 'select' ? (
                      <select
                        id={prop.name}
                        className="form-select"
                        value={String(formData[prop.name] || prop.default)}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(prop.name, e.target.value, prop.type)}
                      >
                        {prop.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : prop.type === 'checkbox' ? (
                      <div className="form-check">
                        <input
                          type="checkbox"
                          id={prop.name}
                          className="form-check-input"
                          checked={Boolean(formData[prop.name]) || false}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(prop.name, e.target.checked, prop.type)}
                        />
                        <label className="form-check-label" htmlFor={prop.name}>
                          Enable
                        </label>
                      </div>
                    ) : (
                      <input
                        type={prop.type}
                        id={prop.name}
                        className="form-control"
                        value={formData[prop.name] !== undefined ? String(formData[prop.name]) : ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(prop.name, e.target.value, prop.type)}
                        min={prop.min}
                        max={prop.max}
                        step={prop.step}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PropertyEditModal