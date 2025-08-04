import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProjects, createProject, deleteProject } from '../utils/project-storage'
import CreateProjectModal from './modals/CreateProjectModal'
import DeleteProjectModal from './modals/DeleteProjectModal'
import ThemeToggle from './ThemeToggle'
import type { Project } from '../types'
import './HomePage.scss'

function HomePage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<{ id: string, name: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'modified'>('modified')

  useEffect(() => {
    loadProjects()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + N: Create new project
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault()
        setShowCreateModal(true)
      }
      
      // Escape: Close modals
      if (event.key === 'Escape') {
        if (showCreateModal) {
          setShowCreateModal(false)
        }
        if (showDeleteModal) {
          setShowDeleteModal(false)
          setProjectToDelete(null)
        }
      }
      
      // Ctrl/Cmd + F: Focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault()
        const searchInput = document.querySelector('.form-control[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showCreateModal, showDeleteModal])

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const allProjects = await getAllProjects()
      setProjects(allProjects)
    } catch (err) {
      setError('Failed to load projects')
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = () => {
    setShowCreateModal(true)
  }

  const handleConfirmCreateProject = async (projectName: string) => {
    try {
      const projectId = await createProject(projectName)
      
      if (projectId) {
        navigate(`/project/${projectId}`)
      } else {
        setError('Failed to create project')
      }
    } catch (err) {
      setError('Failed to create project')
      console.error('Error creating project:', err)
    }
  }

  const handleOpenProject = (projectId: string) => {
    navigate(`/project/${projectId}`)
  }

  const handleDeleteProject = (projectId: string, projectName: string) => {
    setProjectToDelete({ id: projectId, name: projectName })
    setShowDeleteModal(true)
  }

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return
    
    try {
      const success = await deleteProject(projectToDelete.id)
      if (success) {
        await loadProjects() // Refresh the project list
      } else {
        setError('Failed to delete project')
      }
    } catch (err) {
      setError('Failed to delete project')
      console.error('Error deleting project:', err)
    } finally {
      setProjectToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDefaultProjectName = () => {
    return `Project ${projects.length + 1}`
  }

  // Filter and sort projects
  const filteredAndSortedProjects = projects
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return new Date(b.metadata.created).getTime() - new Date(a.metadata.created).getTime()
        case 'modified':
        default:
          return new Date(b.metadata.lastModified).getTime() - new Date(a.metadata.lastModified).getTime()
      }
    })

  return (
    <div className="home-page d-flex flex-column vh-100">
      <header className="home-header d-flex justify-content-between align-items-center p-3 border-bottom shadow-sm">
        <h1 className="mb-0 text-primary fs-4">ResDEEDS</h1>
        <div className="d-flex gap-2 align-items-center">
          <ThemeToggle />
          <button 
            className="btn btn-primary"
            onClick={handleCreateProject}
            disabled={loading}
            title="Create New Project (Ctrl+N)"
          >
            Create New Project
          </button>
        </div>
      </header>
      
      <div className="flex-grow-1 p-4 overflow-auto">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
            <h2 className="mb-0 fs-3">Projects</h2>
            
            {projects.length > 0 && (
              <div className="d-flex gap-3 align-items-center flex-wrap">
                <div className="input-group" style={{ width: '250px' }}>
                  <input
                    type="text"
                    placeholder="Search projects... (Ctrl+F)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control"
                    title="Search projects (Ctrl+F)"
                  />
                </div>
                <div className="d-flex align-items-center gap-2">
                  <label htmlFor="sort-select" className="form-label mb-0 text-nowrap">Sort by:</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'created' | 'modified')}
                    className="form-select"
                    style={{ width: 'auto' }}
                  >
                    <option value="modified">Last Modified</option>
                    <option value="created">Date Created</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4">
              <span>{error}</span>
              <button onClick={loadProjects} className="btn btn-outline-danger btn-sm">Retry</button>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-3 text-muted">Loading projects...</div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <svg width="64" height="64" className="text-muted" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M9.5 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                  <path d="M14 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                </svg>
              </div>
              <h5 className="text-muted">No projects yet</h5>
              <p className="text-muted">Create your first project to get started!</p>
            </div>
          ) : filteredAndSortedProjects.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted">No projects match your search</h5>
              <button onClick={() => setSearchTerm('')} className="btn btn-primary mt-2">Clear Search</button>
            </div>
          ) : (
            <div className="projects-list">
              {filteredAndSortedProjects.map((project) => (
                <div key={project.id}>
                  <div className="project-card h-100 position-relative">
                    <div 
                      className="project-content"
                      onClick={() => handleOpenProject(project.id)}
                    >
                      <h3>{project.name}</h3>
                      <div className="project-meta">
                        <div>Created: {formatDate(project.metadata.created)}</div>
                        <div>Modified: {formatDate(project.metadata.lastModified)}</div>
                      </div>
                      <div className="project-stats">
                        {project.nodes.length} components, {project.edges.length} connections
                      </div>
                    </div>
                    <button 
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProject(project.id, project.name)
                      }}
                      title="Delete project"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleConfirmCreateProject}
        defaultName={getDefaultProjectName()}
      />

      <DeleteProjectModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setProjectToDelete(null)
        }}
        onConfirm={handleConfirmDeleteProject}
        projectName={projectToDelete?.name || ''}
      />
    </div>
  )
}

export default HomePage