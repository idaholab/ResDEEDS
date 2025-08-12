import React from 'react'
import type { Case, HazardType } from '../types'
import NewCaseModal from './modals/NewCaseModal'
import DeleteCaseModal from './modals/DeleteCaseModal'

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

  const handleDeleteClick = (caseId: string, caseName: string) => {
    if (caseName === 'Base') {
      return // Cannot delete base case
    }
    setCaseToDelete(caseId)
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
      <div className="case-tab-manager mb-3">
        <ul className="nav nav-tabs">
          {cases.map((case_) => (
            <li key={case_.id} className="nav-item">
              <button
                className={`nav-link ${activeCase === case_.id ? 'active' : ''}`}
                onClick={() => onCaseSelect(case_.id)}
                type="button"
              >
                {case_.name}
                {case_.name !== 'Base' && (
                  <button
                    className="btn btn-sm btn-outline-danger ms-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick(case_.id, case_.name)
                    }}
                    title="Delete case"
                    type="button"
                  >
                    ×
                  </button>
                )}
              </button>
            </li>
          ))}
          <li className="nav-item">
            <button
              className="nav-link"
              onClick={() => setShowNewCaseModal(true)}
              type="button"
              title="Add new case"
            >
              +
            </button>
          </li>
        </ul>
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