// Database operations for diagram storage
export const saveDiagramToDatabase = async (diagram) => {
  try {
    if (!window.api || !window.api.writeDatabase) {
      console.error('Database API not available')
      return false
    }

    const dbResult = await window.api.readDatabase()
    if (dbResult.success) {
      const db = dbResult.data
      db.diagrams = db.diagrams || {}
      db.diagrams.current = {
        id: 'current',
        name: 'Current Diagram',
        nodes: diagram.nodes,
        edges: diagram.edges,
        metadata: {
          created: db.diagrams.current?.metadata?.created || new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      }
      const writeResult = await window.api.writeDatabase(db)
      return writeResult.success
    }
    return false
  } catch (error) {
    console.error('Failed to save diagram to database:', error)
    return false
  }
}

export const loadDiagramFromDatabase = async () => {
  try {
    if (!window.api || !window.api.readDatabase) {
      console.error('Database API not available')
      return null
    }

    const dbResult = await window.api.readDatabase()
    if (dbResult.success && dbResult.data.diagrams?.current) {
      const current = dbResult.data.diagrams.current
      
      // Validate structure
      if (!current || !Array.isArray(current.nodes) || !Array.isArray(current.edges)) {
        console.warn('Invalid diagram structure in database')
        return null
      }
      
      return {
        nodes: current.nodes,
        edges: current.edges
      }
    }
    return null
  } catch (error) {
    console.error('Failed to load diagram from database:', error)
    return null
  }
}

export const createNewDiagram = async () => {
  try {
    if (!window.api || !window.api.writeDatabase) {
      console.error('Database API not available')
      return false
    }

    const dbResult = await window.api.readDatabase()
    if (dbResult.success) {
      const db = dbResult.data
      if (db.diagrams?.current) {
        delete db.diagrams.current
        const writeResult = await window.api.writeDatabase(db)
        return writeResult.success
      }
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to create new diagram:', error)
    return false
  }
}

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