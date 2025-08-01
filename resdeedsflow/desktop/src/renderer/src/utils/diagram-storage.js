// Re-export project storage functions for backward compatibility
export { 
  saveDiagramToDatabase, 
  loadDiagramFromDatabase, 
  createNewDiagram 
} from './project-storage'

export const saveDiagramToFile = async (diagram, currentPath = null) => {
  try {
    const diagramData = {
      version: '1.0',
      nodes: diagram.nodes,
      edges: diagram.edges,
      metadata: {
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    }
    
    const jsonStr = JSON.stringify(diagramData, null, 2)
    
    // Use Electron API if available
    if (window.api && window.api.saveFile) {
      const result = await window.api.saveFile(jsonStr, currentPath)
      return result.success ? result.path : false
    }
    
    // Fallback for browser environment (development without Electron)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resdeeds-diagram.rsd'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return true
  } catch (error) {
    console.error('Failed to save diagram to file:', error)
    return false
  }
}

export const loadDiagramFromFile = async () => {
  try {
    // Use Electron API if available
    if (window.api && window.api.openFile) {
      const result = await window.api.openFile()
      if (result.success && result.data) {
        const data = JSON.parse(result.data)
        
        // Validate structure
        if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
          throw new Error('Invalid diagram structure')
        }
        
        // Return nodes, edges, and file path
        return {
          nodes: data.nodes,
          edges: data.edges,
          path: result.path
        }
      }
      return null
    }
    
    // Fallback for browser environment
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.rsd,.json,application/json'
      
      input.onchange = async (event) => {
        const file = event.target.files[0]
        if (!file) {
          resolve(null)
          return
        }
        
        try {
          const text = await file.text()
          const data = JSON.parse(text)
          
          // Validate structure
          if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
            throw new Error('Invalid diagram structure')
          }
          
          // Return just the nodes and edges
          resolve({
            nodes: data.nodes,
            edges: data.edges
          })
        } catch (error) {
          console.error('Failed to load diagram from file:', error)
          reject(error)
        }
      }
      
      input.click()
    })
  } catch (error) {
    console.error('Failed to load diagram from file:', error)
    return null
  }
}