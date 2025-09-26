import { useState, useEffect, useMemo } from 'react'
import { usePowerUnits } from '../../contexts/PowerUnitsContext'
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
    { name: 'v_nom', label: 'Nominal Voltage (kV)', type: 'number', default: 110, step: 0.001 },
    // { name: 'carrier', label: 'Carrier', type: 'text', default: 'AC' },
    // { name: 'x', label: 'X Coordinate', type: 'number', default: 0 },
    // { name: 'y', label: 'Y Coordinate', type: 'number', default: 0 },
  ],
  generatorNode: [
    { name: 'p_nom', label: 'Nominal Power (kW)', type: 'number', default: 100000, step: 1000 },
    { name: 'carrier', label: 'Carrier', type: 'select', options: ['Solar', 'Wind', 'Diesel', 'Utility source'], default: 'solar' },
    { name: 'marginal_cost', label: 'Marginal Cost ($/kWh) - Use to Prioritize Dispatch or Leave Default', type: 'number', default: 0.001, step: 0.001 },
    // { name: 'capital_cost', label: 'Capital Cost ($/kW)', type: 'number', default: 0 },
    { name: 'p_nom_extendable', label: 'Dispatch over normal if required', type: 'checkbox', default: false },
    { name: 'control', label: 'Control', type: 'select', options: ['PQ', 'PV', 'Slack'], default: 'PQ' },
  ],
  loadNode: [
    { name: 'p_set', label: 'Active Power (kW)', type: 'number', default: 50000, step: 1000 },
    // { name: 'q_set', label: 'Reactive Power (kVAR)', type: 'number', default: 0 },
  ],
  batteryNode: [
    { name: 'p_nom', label: 'Nominal Power (kW)', type: 'number', default: 10000, step: 1000 },
    { name: 'max_hours', label: 'Max Hours', type: 'number', default: 4 },
    { name: 'efficiency_store', label: 'Storage Efficiency', type: 'number', default: 0.9, min: 0, max: 1, step: 0.01 },
    { name: 'efficiency_dispatch', label: 'Dispatch Efficiency', type: 'number', default: 0.9, min: 0, max: 1, step: 0.01 },
    { name: 'capital_cost', label: 'Capital Cost ($/kW)', type: 'number', default: 0, step: 100 },
    { name: 'cyclic_state_of_charge', label: 'Cyclic State of Charge', type: 'checkbox', default: true },
  ],
  lineEdge: [
    { name: 'length', label: 'Length (km)', type: 'number', default: 10 },
    { name: 'r', label: 'Resistance (Ω)', type: 'number', default: 0.1, step: 0.01 },
    { name: 'x', label: 'Reactance (Ω)', type: 'number', default: 0.1, step: 0.01 },
    { name: 's_nom', label: 'Nominal Power (kVA)', type: 'number', default: 100000, step: 1000 },
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
  const { getPowerLabel, getEnergyLabel, convertToDisplayValue, convertFromDisplayValue, powerUnit } = usePowerUnits()

  // Get dynamic property definitions based on current power unit
  const properties = useMemo((): PropertyDefinition[] => {
    const baseProperties = nodeProperties[node.type as keyof NodePropertiesConfig] || []
    return baseProperties.map(prop => {
      const updatedProp = {
        ...prop,
        label: getEnergyLabel(getPowerLabel(prop.label)),
        default: typeof prop.default === 'number' &&
          (prop.name === 'p_nom' || prop.name === 'p_set' || prop.name === 's_nom' || prop.name === 'capital_cost' || prop.name === 'v_nom')
          ? convertToDisplayValue(prop.default as number)
          : prop.name === 'marginal_cost'
          ? convertToDisplayValue((prop.default as number) * 1000) // Convert $/kWh back to proper scale
          : prop.default
      }

      // Adjust step values for better flexibility across unit modes
      if (prop.type === 'number') {
        if (prop.name === 'p_nom' || prop.name === 'p_set' || prop.name === 's_nom') {
          // For power fields: Always increment by 1 kW equivalent (1 kW in kW mode, 0.001 MW in MW mode)
          updatedProp.step = powerUnit === 'kW' ? 1 : 0.001
        } else if (prop.name === 'v_nom') {
          // For voltage fields: Always increment by 1 kV equivalent (1 kV in kW mode, 0.001 MV in MW mode)
          updatedProp.step = powerUnit === 'kW' ? 1 : 0.001
        } else if (prop.name === 'capital_cost') {
          // For cost fields: Always increment by 1 $/kW equivalent (1 $/kW in kW mode, 0.001 $/MW in MW mode)
          updatedProp.step = powerUnit === 'kW' ? 1 : 0.001
        } else if (prop.name === 'marginal_cost') {
          // For marginal cost: 1 $/kWh in kW mode, 0.001 $/MWh in MW mode (equivalent values)
          updatedProp.step = powerUnit === 'kW' ? 1 : 0.001
        } else if (prop.step !== undefined) {
          // For other numeric fields, keep original step if defined
          updatedProp.step = prop.step
        }
      }

      return updatedProp
    })
  }, [node.type, getPowerLabel, getEnergyLabel, convertToDisplayValue, powerUnit])

  useEffect(() => {
    const initialData: FormData = {}
    properties.forEach(prop => {
      const nodeData = node.data as PyPSAComponentData | PyPSAEdgeData
      let value = (nodeData as Record<string, unknown>)[prop.name] !== undefined
        ? (nodeData as Record<string, unknown>)[prop.name] as string | number | boolean
        : prop.default

      // Convert stored values to display units
      if (typeof value === 'number') {
        if (prop.name === 'p_nom' || prop.name === 'p_set' || prop.name === 's_nom' || prop.name === 'capital_cost') {
          value = convertToDisplayValue(value)
        } else if (prop.name === 'v_nom') {
          // Convert voltage from kV to display units (kV or MV)
          value = convertToDisplayValue(value)
        } else if (prop.name === 'marginal_cost') {
          // Convert marginal cost from $/kWh to display units
          value = convertToDisplayValue(value * 1000)
        }
      }

      initialData[prop.name] = value
    })
    setFormData(initialData)
  }, [node, properties, convertToDisplayValue])

  // Update form data when power unit changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      const updatedData: FormData = {}
      properties.forEach(prop => {
        const currentValue = formData[prop.name]
        if (typeof currentValue === 'number') {
          if (prop.name === 'p_nom' || prop.name === 'p_set' || prop.name === 's_nom' || prop.name === 'capital_cost') {
            // Convert from previous display value back to kW, then to new display value
            const nodeData = node.data as PyPSAComponentData | PyPSAEdgeData
            const storedValue = (nodeData as Record<string, unknown>)[prop.name] as number
            updatedData[prop.name] = convertToDisplayValue(storedValue || prop.default as number)
          } else if (prop.name === 'v_nom') {
            // Convert voltage from stored kV to new display units
            const nodeData = node.data as PyPSAComponentData | PyPSAEdgeData
            const storedValue = (nodeData as Record<string, unknown>)[prop.name] as number
            updatedData[prop.name] = convertToDisplayValue(storedValue || prop.default as number)
          } else if (prop.name === 'marginal_cost') {
            const nodeData = node.data as PyPSAComponentData | PyPSAEdgeData
            const storedValue = (nodeData as Record<string, unknown>)[prop.name] as number
            updatedData[prop.name] = convertToDisplayValue((storedValue || prop.default as number) * 1000)
          } else {
            updatedData[prop.name] = currentValue
          }
        } else {
          updatedData[prop.name] = currentValue
        }
      })
      setFormData(updatedData)
    }
  }, [convertToDisplayValue])

  const handleChange = (name: string, value: string | boolean, type: string): void => {
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value as string)) : value
    }))
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    // Convert power/energy values from display units back to internal kW values
    const convertedData = { ...formData }
    properties.forEach(prop => {
      if (typeof formData[prop.name] === 'number') {
        if (prop.name === 'p_nom' || prop.name === 'p_set' || prop.name === 's_nom' || prop.name === 'capital_cost') {
          convertedData[prop.name] = convertFromDisplayValue(formData[prop.name] as number)
        } else if (prop.name === 'v_nom') {
          // Convert voltage: display value back to kV (internal format)
          convertedData[prop.name] = convertFromDisplayValue(formData[prop.name] as number)
        } else if (prop.name === 'marginal_cost') {
          // Convert marginal cost: display value to $/kWh (internal format)
          convertedData[prop.name] = convertFromDisplayValue(formData[prop.name] as number) / 1000
        }
      }
    })

    onSave(node.id, convertedData)
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