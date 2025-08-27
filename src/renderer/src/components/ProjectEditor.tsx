import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DiagramEditor from './DiagramEditor'
import ComponentPalette from './ComponentPalette'
import PropertyEditModal from './modals/PropertyEditModal'
import ThemeToggle from './ThemeToggle'
import EditableProjectName from './EditableProjectName'
import CaseTabManager from './CaseTabManager'
import { exportDiagramAsJSON, exportDiagramAsPython } from '../utils/pypsa-exporter'
import AnalysisModal from './modals/AnalysisModal'
import { defaultNodes, defaultEdges } from '../data/defaultDiagram'
import { 
  getProject, 
  createProject, 
  renameProject,
  addCaseToProject,
  deleteCaseFromProject,
  switchActiveCase,
  updateCaseDiagram
} from '../utils/project-storage'
import { saveDiagramToFile, loadDiagramFromFile } from '../utils/diagram-storage'
import type { PyPSANode, PyPSAEdge, RouteParams, Project, HazardType, PyPSAComponentData, PyPSAEdgeData } from '../types'
import './ProjectEditor.scss'

function ProjectEditor() {
  const { projectId } = useParams<RouteParams>()
  const navigate = useNavigate()
  
  const [selectedNode, setSelectedNode] = useState<PyPSANode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<PyPSAEdge | null>(null)
  const [nodes, setNodes] = useState<PyPSANode[]>(defaultNodes)
  const [edges, setEdges] = useState<PyPSAEdge[]>(defaultEdges)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)

  // Load project data on startup
  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) {
        setError('No project ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const projectData = await getProject(projectId)
        if (!projectData) {
          setError('Project not found')
          setLoading(false)
          return
        }

        setProject(projectData)
        
        // Load the active case data
        const activeCase = projectData.cases.find(c => c.id === projectData.activeCase)
        if (activeCase) {
          setNodes(activeCase.nodes)
          setEdges(activeCase.edges)
        } else {
          // Fallback to first case if active case not found
          const firstCase = projectData.cases[0]
          if (firstCase) {
            setNodes(firstCase.nodes)
            setEdges(firstCase.edges)
          }
        }
        setIsInitialized(true)
      } catch (err) {
        setError('Failed to load project')
        console.error('Error loading project:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadProjectData()
  }, [projectId])

  // Auto-save to database with debouncing
  useEffect(() => {
    if (!isInitialized || !projectId || !project) return

    const timeoutId = setTimeout(async () => {
      // Save to the active case
      await updateCaseDiagram(projectId, project.activeCase, nodes, edges)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [nodes, edges, isInitialized, projectId, project])

  // Setup Electron menu event handlers
  useEffect(() => {
    if (window.api && window.api.onMenuAction) {
      window.api.onMenuAction(async (action) => {
        switch (action) {
          case 'menu-new-diagram':
            if (confirm('Create a new project? Any unsaved changes will be lost.')) {
              const newProjectId = await createProject('New Project')
              if (newProjectId) {
                navigate(`/project/${newProjectId}`)
              }
            }
            break

          case 'menu-open-diagram': {
            const loadResult = await loadDiagramFromFile()
            if (loadResult) {
              setNodes(loadResult.nodes)
              setEdges(loadResult.edges)
              setCurrentFilePath(loadResult.path || null)
            }
            break
          }

          case 'menu-save-diagram':
            await saveDiagramToFile({ nodes, edges }, currentFilePath)
            break

          case 'menu-save-diagram-as': {
            const saveResult = await saveDiagramToFile({ nodes, edges })
            if (saveResult && typeof saveResult === 'string') {
              setCurrentFilePath(saveResult)
            }
            break
          }

          case 'menu-export-json':
            await exportDiagramAsJSON(nodes, edges)
            break

          case 'menu-export-python':
            await exportDiagramAsPython(nodes, edges)
            break
        }
      })
    }
  }, [nodes, edges, currentFilePath])

  const handleNodeSelect = (node: PyPSANode): void => {
    setSelectedNode(node)
  }

  const handleEdgeSelect = (edge: PyPSAEdge): void => {
    setSelectedEdge(edge)
  }

  const handleNodeUpdate = (nodeId: string, updatedData: Partial<PyPSAComponentData>): void => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...updatedData } } : node
      )
    )
    setSelectedNode(null)
  }

  const handleEdgeUpdate = (edgeId: string, updatedData: Partial<PyPSAEdgeData>): void => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId ? { ...edge, data: { ...edge.data, ...updatedData } } : edge
      )
    )
    setSelectedEdge(null)
  }

  const handleCloseModal = (): void => {
    setSelectedNode(null)
    setSelectedEdge(null)
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  const handleInlineRename = async (newName: string): Promise<boolean> => {
    if (!project || !projectId) return false
    
    const success = await renameProject(projectId, newName)
    if (success) {
      setProject({ ...project, name: newName })
      return true
    }
    return false
  }

  // Case management handlers
  const handleCaseSelect = async (caseId: string) => {
    if (!project || !projectId) return
    
    // Save current case before switching
    await updateCaseDiagram(projectId, project.activeCase, nodes, edges)
    
    // Switch to new case
    const success = await switchActiveCase(projectId, caseId)
    if (success) {
      const updatedProject = await getProject(projectId)
      if (updatedProject) {
        setProject(updatedProject)
        
        // Load the new case data
        const newActiveCase = updatedProject.cases.find(c => c.id === caseId)
        if (newActiveCase) {
          setNodes(newActiveCase.nodes)
          setEdges(newActiveCase.edges)
        }
      }
    }
  }

  const handleNewCase = async (hazardType: HazardType) => {
    if (!project || !projectId) return
    
    // Save current case first
    await updateCaseDiagram(projectId, project.activeCase, nodes, edges)
    
    // Create new case
    const newCaseId = await addCaseToProject(projectId, hazardType)
    if (newCaseId) {
      const updatedProject = await getProject(projectId)
      if (updatedProject) {
        setProject(updatedProject)
        
        // Load the new case data
        const newCase = updatedProject.cases.find(c => c.id === newCaseId)
        if (newCase) {
          setNodes(newCase.nodes)
          setEdges(newCase.edges)
        }
      }
    }
  }

  const handleDeleteCase = async (caseId: string) => {
    if (!project || !projectId) return
    
    const success = await deleteCaseFromProject(projectId, caseId)
    if (success) {
      const updatedProject = await getProject(projectId)
      if (updatedProject) {
        setProject(updatedProject)
        
        // Load the active case data (will be Base case after deletion)
        const activeCase = updatedProject.cases.find(c => c.id === updatedProject.activeCase)
        if (activeCase) {
          setNodes(activeCase.nodes)
          setEdges(activeCase.edges)
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="project-editor loading">
        <div className="loading-content">
          <p>Loading project...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="project-editor error">
        <div className="error-content">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleBackToHome} className="back-button">
            ← Back to Projects
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="project-editor">
      <header className="project-header">
        <div className="project-nav">
          <button className="back-button" onClick={handleBackToHome}>
            ← Back to Projects
          </button>
          <EditableProjectName 
            value={project?.name || 'Untitled Project'}
            onSave={handleInlineRename}
          />
        </div>
        <div className="export-buttons">
          <ThemeToggle />
          <button
            className="export-button"
            onClick={() => setShowAnalysis(true)}
            title="Run linear PyPSA optimization and view results"
          >
            Analyze
          </button>
          <button
            className="export-button"
            onClick={() => exportDiagramAsJSON(nodes, edges)}
          >
            Export PyPSA JSON
          </button>
          <button
            className="export-button python"
            onClick={() => exportDiagramAsPython(nodes, edges)}
          >
            Export PyPSA Network
          </button>
        </div>
      </header>

      <div className="project-content">
        <ComponentPalette />
        <div className="diagram-container">
          {project && (
            <CaseTabManager
              cases={project.cases}
              activeCase={project.activeCase}
              onCaseSelect={handleCaseSelect}
              onNewCase={handleNewCase}
              onDeleteCase={handleDeleteCase}
            />
          )}
          <DiagramEditor
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            onNodeSelect={handleNodeSelect}
            onEdgeSelect={handleEdgeSelect}
          />
        </div>
      </div>

      {selectedNode && (
        <PropertyEditModal
          node={selectedNode}
          onSave={handleNodeUpdate}
          onClose={handleCloseModal}
        />
      )}

      {selectedEdge && (
        <PropertyEditModal
          node={{ ...selectedEdge, type: 'lineEdge' }}
          onSave={(id, data) => handleEdgeUpdate(id, data)}
          onClose={handleCloseModal}
        />
      )}

      {showAnalysis && (
        <AnalysisModal
          isOpen={showAnalysis}
          nodes={nodes}
          edges={edges}
          onClose={() => setShowAnalysis(false)}
        />
      )}
    </div>
  )
}

export default ProjectEditor
