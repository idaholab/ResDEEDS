interface DeleteProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  projectName: string
}

function DeleteProjectModal({ isOpen, onClose, onConfirm, projectName }: DeleteProjectModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter') {
      handleConfirm()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleBackdropClick}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" onKeyDown={handleKeyDown}>
          <div className="modal-header border-0 pb-0">
            <div className="text-center w-100">
              <div className="text-warning mb-2" style={{ fontSize: '3rem' }}>⚠️</div>
              <h1 className="modal-title fs-5 text-danger">Delete Project</h1>
            </div>
          </div>
          
          <div className="modal-body text-center">
            <p className="mb-3">Are you sure you want to delete the project:</p>
            <div className="alert alert-warning d-inline-block">
              <strong>"{projectName}"</strong>
            </div>
            <div className="alert alert-danger mt-3 mb-0">
              <small>
                <strong>Warning:</strong> This action cannot be undone. All diagrams and data in this project will be permanently lost.
              </small>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-danger"
              onClick={handleConfirm}
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteProjectModal