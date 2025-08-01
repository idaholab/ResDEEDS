import './DeleteProjectModal.css'

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
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="delete-project-modal" onKeyDown={handleKeyDown}>
        <div className="modal-header">
          <div className="warning-icon">⚠️</div>
          <h2>Delete Project</h2>
        </div>
        
        <div className="modal-content">
          <p>Are you sure you want to delete the project:</p>
          <div className="project-name-highlight">"{projectName}"</div>
          <p className="warning-text">
            This action cannot be undone. All diagrams and data in this project will be permanently lost.
          </p>
        </div>
        
        <div className="modal-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="delete-button"
            onClick={handleConfirm}
          >
            Delete Project
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteProjectModal