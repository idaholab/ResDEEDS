import { useState, useRef, useEffect } from 'react'
import './EditableProjectName.scss'

interface EditableProjectNameProps {
  value: string
  onSave: (newName: string) => Promise<boolean>
  maxLength?: number
  className?: string
}

function EditableProjectName({ 
  value, 
  onSave, 
  maxLength = 100, 
  className = '' 
}: EditableProjectNameProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    setIsEditing(true)
    setEditValue(value)
  }

  const handleSave = async () => {
    const trimmedValue = editValue.trim()
    
    if (!trimmedValue) {
      setEditValue(value)
      setIsEditing(false)
      return
    }

    if (trimmedValue === value) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      const success = await onSave(trimmedValue)
      if (success) {
        setIsEditing(false)
      } else {
        setEditValue(value)
      }
    } catch (error) {
      console.error('Error saving project name:', error)
      setEditValue(value)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue.length <= maxLength) {
      setEditValue(newValue)
    }
  }

  const handleClickOutside = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      handleSave()
    }
  }

  if (isEditing) {
    return (
      <div className={`editable-project-name editing ${className}`} onBlur={handleClickOutside}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className="project-name-input"
          title="Press Enter to save, Escape to cancel"
        />
        {isSaving && <span className="saving-indicator">Saving...</span>}
      </div>
    )
  }

  return (
    <h1 
      className={`editable-project-name ${className}`}
      onDoubleClick={handleDoubleClick}
      title="Double-click to rename"
    >
      {value}
    </h1>
  )
}

export default EditableProjectName