import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProjects, createProject, deleteProject } from '../utils/project-storage'
import CreateProjectModal from './modals/CreateProjectModal'
import DeleteProjectModal from './modals/DeleteProjectModal'
import type { Project } from '../types'
import './HomePage.css'

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
        const searchInput = document.querySelector('.search-input') as HTMLInputElement
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
    <div className="home-page">
      <header className="home-header">
        <h1>ResDEEDS - PyPSA Network Designer</h1>
        <button 
          className="create-project-button"
          onClick={handleCreateProject}
          disabled={loading}
          title="Create New Project (Ctrl+N)"
        >
          Create New Project
        </button>
      </header>
      
      <div className="home-content">
        <div className="projects-section">
          <div className="projects-header">
            <h2>Projects</h2>
            
            {projects.length > 0 && (
              <div className="projects-controls">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search projects... (Ctrl+F)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    title="Search projects (Ctrl+F)"
                  />
                </div>
                <div className="sort-controls">
                  <label htmlFor="sort-select">Sort by:</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'created' | 'modified')}
                    className="sort-select"
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
            <div className="error-message">
              {error}
              <button onClick={loadProjects} className="retry-button">Retry</button>
            </div>
          )}
          
          {loading ? (
            <div className="loading-message">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="empty-projects">
              <p>No projects yet. Create your first project to get started!</p>
            </div>
          ) : filteredAndSortedProjects.length === 0 ? (
            <div className="empty-projects">
              <p>No projects match your search criteria.</p>
              <button onClick={() => setSearchTerm('')} className="clear-search-button">Clear Search</button>
            </div>
          ) : (
            <div className="projects-list">
              {filteredAndSortedProjects.map((project) => (
                <div key={project.id} className="project-card">
                  <div 
                    className="project-content"
                    onClick={() => handleOpenProject(project.id)}
                  >
                    <h3>{project.name}</h3>
                    <p className="project-meta">
                      <span>Created: {formatDate(project.metadata.created)}</span>
                      <span>Modified: {formatDate(project.metadata.lastModified)}</span>
                    </p>
                    <p className="project-stats">
                      {project.nodes.length} components, {project.edges.length} connections
                    </p>
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