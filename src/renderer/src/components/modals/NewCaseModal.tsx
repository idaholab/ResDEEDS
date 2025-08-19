import React from 'react'
import type { HazardType } from '../../types'

interface NewCaseModalProps {
  onSubmit: (hazardType: HazardType) => void
  onCancel: () => void
}

const NewCaseModal: React.FC<NewCaseModalProps> = ({ onSubmit, onCancel }) => {
  const [selectedHazard, setSelectedHazard] = React.useState<HazardType>('Heat')

  const hazardTypes: HazardType[] = ['Heat', 'Freeze', 'Hurricane', 'Wildfire', 'Tornado', 'Earthquake']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(selectedHazard)
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