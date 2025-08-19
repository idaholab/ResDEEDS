import React from 'react'
import type { Case, HazardType } from '../types'
import NewCaseModal from './modals/NewCaseModal'
import DeleteCaseModal from './modals/DeleteCaseModal'
import './CaseTabManager.scss'

interface CaseTabManagerProps {
  cases: Case[]
  activeCase: string
  onCaseSelect: (caseId: string) => void
  onNewCase: (hazardType: HazardType) => void
  onDeleteCase: (caseId: string) => void
}

const CaseTabManager: React.FC<CaseTabManagerProps> = ({
  cases,
  activeCase,
  onCaseSelect,
  onNewCase,
  onDeleteCase
}) => {
  const [showNewCaseModal, setShowNewCaseModal] = React.useState(false)
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [caseToDelete, setCaseToDelete] = React.useState<string | null>(null)

  const handleDeleteClick = () => {
    const activeCase_ = cases.find(c => c.id === activeCase)
    if (!activeCase_ || activeCase_.name === 'Base') {
      return // Cannot delete base case
    }
    setCaseToDelete(activeCase)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    if (caseToDelete) {
      onDeleteCase(caseToDelete)
      setCaseToDelete(null)
      setShowDeleteModal(false)
    }
  }

  const handleNewCaseSubmit = (hazardType: HazardType) => {
    onNewCase(hazardType)
    setShowNewCaseModal(false)
  }

  return (
    <>
      <div className="case-tab-manager mt-1 mb-2">
        <div className="d-flex justify-content-between align-items-center">
          <ul className="nav nav-tabs flex-grow-1">
            {cases.map((case_) => (
              <li key={case_.id} className="nav-item">
                <button
                  className={`nav-link ${activeCase === case_.id ? 'active' : ''}`}
                  onClick={() => onCaseSelect(case_.id)}
                  type="button"
                >
                  {case_.name}
                </button>
              </li>
            ))}
            <li className="nav-item">
              <button
                className="nav-link"
                onClick={() => setShowNewCaseModal(true)}
                type="button"
                title="Add new case"
                aria-label="Add new case"
              >
                +
              </button>
            </li>
          </ul>
          {(() => {
            const activeCase_ = cases.find(c => c.id === activeCase)
            return activeCase_?.name !== 'Base' && (
              <button
                className="btn btn-outline-danger btn-sm ms-3 delete-case-btn"
                onClick={handleDeleteClick}
                title={`Delete ${activeCase_?.name} case`}
                aria-label={`Delete ${activeCase_?.name} case`}
              >
                <span className="me-1">×</span>
                Delete
              </button>
            )
          })()}
        </div>
      </div>

      {/* New Case Modal */}
      {showNewCaseModal && (
        <NewCaseModal
          onSubmit={handleNewCaseSubmit}
          onCancel={() => setShowNewCaseModal(false)}
        />
      )}

      {/* Delete Case Modal */}
      {showDeleteModal && caseToDelete && (
        <DeleteCaseModal
          caseName={cases.find(c => c.id === caseToDelete)?.name || ''}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteModal(false)
            setCaseToDelete(null)
          }}
        />
      )}
    </>
  )
}


export default CaseTabManager