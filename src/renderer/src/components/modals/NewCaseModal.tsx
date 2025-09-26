import React from 'react'
import type { HazardType } from '../../types'

interface NewCaseModalProps {
  onSubmit: (hazardType: HazardType, customName?: string) => void
  onCancel: () => void
}

const NewCaseModal: React.FC<NewCaseModalProps> = ({ onSubmit, onCancel }) => {
  const [selectedHazard, setSelectedHazard] = React.useState<HazardType>('Heat')
  const [customName, setCustomName] = React.useState('')

  const hazardTypes: HazardType[] = ['Heat', 'Freeze', 'Hurricane', 'Wildfire', 'Tornado', 'Earthquake', 'Custom']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedHazard === 'Custom' && !customName.trim()) {
      return // Don't submit if Custom is selected but no name provided
    }
    onSubmit(selectedHazard, selectedHazard === 'Custom' ? customName.trim() : undefined)
  }

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Create New Case</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="hazardSelect" className="form-label">
                  Select Hazard Type:
                </label>
                <select
                  id="hazardSelect"
                  className="form-select"
                  value={selectedHazard}
                  onChange={(e) => setSelectedHazard(e.target.value as HazardType)}
                  required
                >
                  {hazardTypes.map((hazard) => (
                    <option key={hazard} value={hazard}>
                      {hazard}
                    </option>
                  ))}
                </select>
                <div className="form-text">
                  This will create a new case with the selected hazard type, copying the current Base case as a starting point.
                </div>
              </div>

              {selectedHazard === 'Custom' && (
                <div className="mb-3">
                  <label htmlFor="customName" className="form-label">
                    Case Name:
                  </label>
                  <input
                    type="text"
                    id="customName"
                    className="form-control"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter custom case name"
                    required
                    maxLength={50}
                  />
                  <div className="form-text">
                    Enter a name for your custom case (up to 50 characters).
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Create Case
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewCaseModal