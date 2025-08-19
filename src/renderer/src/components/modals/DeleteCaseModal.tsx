import React from 'react'

interface DeleteCaseModalProps {
  caseName: string
  onConfirm: () => void
  onCancel: () => void
}

const DeleteCaseModal: React.FC<DeleteCaseModalProps> = ({ caseName, onConfirm, onCancel }) => {
  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm()
  }

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleConfirm}>
            <div className="modal-header">
              <h5 className="modal-title">Delete Case</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning" role="alert">
                <strong>Warning:</strong> This action cannot be undone.
              </div>
              <p>
                Are you sure you want to delete the case <strong>{caseName}</strong>?
              </p>
              <p className="text-muted">
                All diagram data for this case will be permanently lost.
              </p>
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
                className="btn btn-danger"
              >
                Delete Case
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DeleteCaseModal