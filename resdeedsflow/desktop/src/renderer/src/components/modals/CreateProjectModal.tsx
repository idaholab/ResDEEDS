import { useState, useEffect, useRef } from 'react'
import './CreateProjectModal.css'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (projectName: string) => void
  defaultName?: string
}

function CreateProjectModal({ isOpen, onClose, onConfirm, defaultName = '' }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState(defaultName)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setProjectName(defaultName)
      setError(null)
      // Focus the input when modal opens
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 100)
    }
  }, [isOpen, defaultName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedName = projectName.trim()
    if (!trimmedName) {
      setError('Project name cannot be empty')
      return
    }
    
    if (trimmedName.length > 50) {
      setError('Project name must be 50 characters or less')
      return
    }

    onConfirm(trimmedName)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
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
      <div className="create-project-modal" onKeyDown={handleKeyDown}>
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button 
            className="modal-close-button"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="project-name">Project Name</label>
            <input
              ref={inputRef}
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value)
                setError(null)
              }}
              placeholder="Enter project name..."
              maxLength={50}
              className={error ? 'error' : ''}
            />
            {error && <div className="error-text">{error}</div>}
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
              type="submit" 
              className="confirm-button"
              disabled={!projectName.trim()}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProjectModal