import { useState, useEffect } from 'react'
import DiagramEditor from './components/DiagramEditor'
import ComponentPalette from './components/ComponentPalette'
import PropertyEditModal from './components/modals/PropertyEditModal'
import { exportToPyPSA, generatePythonCode, exportDiagramAsJSON, exportDiagramAsPython } from './utils/pypsa-exporter'
import { defaultNodes, defaultEdges } from './data/defaultDiagram'
import { saveDiagramToDatabase, loadDiagramFromDatabase, createNewDiagram, saveDiagramToFile, loadDiagramFromFile } from './utils/diagram-storage'
import type { PyPSANode, PyPSAEdge } from './types'
import './App.css'

declare global {
  interface Window {
    api?: {
      onMenuAction: (callback: (action: string) => void) => void
    }
  }
}

function App() {
  const [selectedNode, setSelectedNode] = useState<PyPSANode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<PyPSAEdge | null>(null)
  const [nodes, setNodes] = useState<PyPSANode[]>(defaultNodes)
  const [edges, setEdges] = useState<PyPSAEdge[]>(defaultEdges)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)

  // Load diagram from database on startup
  useEffect(() => {
    const loadDiagram = async () => {
      const savedDiagram = await loadDiagramFromDatabase()
      if (savedDiagram && savedDiagram.nodes && savedDiagram.edges) {
        setNodes(savedDiagram.nodes)
        setEdges(savedDiagram.edges)
      }
      setIsInitialized(true)
    }
    loadDiagram()
  }, [])

  // Auto-save to database with debouncing
  useEffect(() => {
    if (!isInitialized) return

    const timeoutId = setTimeout(async () => {
      await saveDiagramToDatabase({ nodes, edges })
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [nodes, edges, isInitialized])

  // Setup Electron menu event handlers
  useEffect(() => {
    if (window.api && window.api.onMenuAction) {
      window.api.onMenuAction(async (action) => {
        switch (action) {
          case 'menu-new-diagram':
            if (confirm('Create a new diagram? Any unsaved changes will be lost.')) {
              await createNewDiagram()
              setNodes(defaultNodes)
              setEdges(defaultEdges)
              setCurrentFilePath(null)
            }
            break

          case 'menu-open-diagram':
            const loadResult = await loadDiagramFromFile()
            if (loadResult) {
              setNodes(loadResult.nodes)
              setEdges(loadResult.edges)
              setCurrentFilePath(loadResult.path || null)
            }
            break

          case 'menu-save-diagram':
            await saveDiagramToFile({ nodes, edges }, currentFilePath)
            break

          case 'menu-save-diagram-as':
            const saveResult = await saveDiagramToFile({ nodes, edges })
            if (saveResult && typeof saveResult === 'string') {
              setCurrentFilePath(saveResult)
            }
            break

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

  const handleNodeUpdate = (nodeId: string, updatedData: Record<string, any>): void => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...updatedData } } : node
      )
    )
    setSelectedNode(null)
  }

  const handleEdgeUpdate = (edgeId: string, updatedData: Record<string, any>): void => {
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>ResDEEDS - PyPSA Network</h1>
        <div className="export-buttons">
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

      <div className="app-content">
        <ComponentPalette />
        <DiagramEditor
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          onNodeSelect={handleNodeSelect}
          onEdgeSelect={handleEdgeSelect}
        />
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
    </div>
  )
}

export default App