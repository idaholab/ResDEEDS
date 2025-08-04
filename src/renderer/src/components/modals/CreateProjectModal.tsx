import { useState, useEffect, useRef } from 'react'

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
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleBackdropClick}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" onKeyDown={handleKeyDown}>
          <div className="modal-header">
            <h1 className="modal-title fs-5">Create New Project</h1>
            <button 
              type="button" 
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="project-name" className="form-label">Project Name</label>
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
                  className={`form-control ${error ? 'is-invalid' : ''}`}
                />
                {error && <div className="invalid-feedback">{error}</div>}
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
                type="submit" 
                className="btn btn-primary"
                disabled={!projectName.trim()}
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectModal