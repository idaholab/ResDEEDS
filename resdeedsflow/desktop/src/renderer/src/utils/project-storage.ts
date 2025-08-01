import type { Project, ProjectDatabase, PyPSANode, PyPSAEdge, DiagramData } from '../types'
import { defaultNodes, defaultEdges } from '../data/defaultDiagram'

// ============================================================================
// Project ID Generation
// ============================================================================

export const generateProjectId = (): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 7)
  return `project_${timestamp}_${random}`
}

// ============================================================================
// Database Operations
// ============================================================================

const getDefaultDatabase = (): ProjectDatabase => ({
  projects: {},
  settings: {}
})

const readProjectDatabase = async (): Promise<ProjectDatabase> => {
  try {
    if (!window.api || !window.api.readDatabase) {
      console.error('Database API not available')
      return getDefaultDatabase()
    }

    const dbResult = await window.api.readDatabase()
    if (dbResult.success && dbResult.data) {
      // Handle migration from old format to new format
      const db = dbResult.data as Record<string, unknown>
      
      // If the old format exists, migrate it
      if (db.diagrams && !db.projects) {
        console.log('Migrating database from old format to new project format')
        return await migrateDatabaseToProjectFormat(db)
      }
      
      // Return existing project database
      if (db.projects) {
        return {
          projects: db.projects || {},
          settings: db.settings || {}
        }
      }
    }
    
    return getDefaultDatabase()
  } catch (error) {
    console.error('Failed to read project database:', error)
    return getDefaultDatabase()
  }
}

const writeProjectDatabase = async (database: ProjectDatabase): Promise<boolean> => {
  try {
    if (!window.api || !window.api.writeDatabase) {
      console.error('Database API not available')
      return false
    }

    const writeResult = await window.api.writeDatabase({
      version: '2.0',
      ...database
    })
    return writeResult.success
  } catch (error) {
    console.error('Failed to write project database:', error)
    return false
  }
}

// ============================================================================
// Migration from Old Format
// ============================================================================

const migrateDatabaseToProjectFormat = async (oldDb: Record<string, unknown>): Promise<ProjectDatabase> => {
  const newDb: ProjectDatabase = getDefaultDatabase()
  
  // Check if there's a current diagram to migrate
  if (oldDb.diagrams?.current) {
    const current = oldDb.diagrams.current
    const migratedProjectId = generateProjectId()
    
    const migratedProject: Project = {
      id: migratedProjectId,
      name: current.name || 'Migrated Project',
      nodes: Array.isArray(current.nodes) ? current.nodes : defaultNodes,
      edges: Array.isArray(current.edges) ? current.edges : defaultEdges,
      metadata: {
        created: current.metadata?.created || new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    }
    
    newDb.projects[migratedProjectId] = migratedProject
    newDb.settings.lastOpenedProject = migratedProjectId
    
    console.log(`Migrated diagram to project: ${migratedProjectId}`)
  }
  
  // Save the migrated database
  await writeProjectDatabase(newDb)
  return newDb
}

// ============================================================================
// Project CRUD Operations
// ============================================================================

export const createProject = async (name: string, templateNodes?: PyPSANode[], templateEdges?: PyPSAEdge[]): Promise<string | null> => {
  try {
    const database = await readProjectDatabase()
    const projectId = generateProjectId()
    const now = new Date().toISOString()
    
    const newProject: Project = {
      id: projectId,
      name: name || `Project ${Object.keys(database.projects).length + 1}`,
      nodes: templateNodes || [...defaultNodes],
      edges: templateEdges || [...defaultEdges],
      metadata: {
        created: now,
        lastModified: now
      }
    }
    
    database.projects[projectId] = newProject
    database.settings.lastOpenedProject = projectId
    
    const success = await writeProjectDatabase(database)
    return success ? projectId : null
  } catch (error) {
    console.error('Failed to create project:', error)
    return null
  }
}

export const getProject = async (projectId: string): Promise<Project | null> => {
  try {
    const database = await readProjectDatabase()
    return database.projects[projectId] || null
  } catch (error) {
    console.error('Failed to get project:', error)
    return null
  }
}

export const getAllProjects = async (): Promise<Project[]> => {
  try {
    const database = await readProjectDatabase()
    return Object.values(database.projects).sort(
      (a, b) => new Date(b.metadata.lastModified).getTime() - new Date(a.metadata.lastModified).getTime()
    )
  } catch (error) {
    console.error('Failed to get all projects:', error)
    return []
  }
}

export const updateProject = async (projectId: string, updates: Partial<Omit<Project, 'id'>>): Promise<boolean> => {
  try {
    const database = await readProjectDatabase()
    const project = database.projects[projectId]
    
    if (!project) {
      console.error(`Project not found: ${projectId}`)
      return false
    }
    
    database.projects[projectId] = {
      ...project,
      ...updates,
      id: projectId, // Ensure ID doesn't change
      metadata: {
        ...project.metadata,
        ...updates.metadata,
        lastModified: new Date().toISOString()
      }
    }
    
    database.settings.lastOpenedProject = projectId
    
    return await writeProjectDatabase(database)
  } catch (error) {
    console.error('Failed to update project:', error)
    return false
  }
}

export const deleteProject = async (projectId: string): Promise<boolean> => {
  try {
    const database = await readProjectDatabase()
    
    if (!database.projects[projectId]) {
      console.error(`Project not found: ${projectId}`)
      return false
    }
    
    delete database.projects[projectId]
    
    // If this was the last opened project, clear that setting
    if (database.settings.lastOpenedProject === projectId) {
      const remainingProjects = Object.keys(database.projects)
      database.settings.lastOpenedProject = remainingProjects.length > 0 ? remainingProjects[0] : undefined
    }
    
    return await writeProjectDatabase(database)
  } catch (error) {
    console.error('Failed to delete project:', error)
    return false
  }
}

export const renameProject = async (projectId: string, newName: string): Promise<boolean> => {
  return await updateProject(projectId, { name: newName })
}

// ============================================================================
// Project Diagram Operations
// ============================================================================

export const saveProjectDiagram = async (projectId: string, nodes: PyPSANode[], edges: PyPSAEdge[]): Promise<boolean> => {
  return await updateProject(projectId, { nodes, edges })
}

export const loadProjectDiagram = async (projectId: string): Promise<{ nodes: PyPSANode[], edges: PyPSAEdge[] } | null> => {
  try {
    const project = await getProject(projectId)
    if (!project) {
      return null
    }
    
    return {
      nodes: project.nodes,
      edges: project.edges
    }
  } catch (error) {
    console.error('Failed to load project diagram:', error)
    return null
  }
}

// ============================================================================
// Settings Operations
// ============================================================================

export const getLastOpenedProject = async (): Promise<string | null> => {
  try {
    const database = await readProjectDatabase()
    return database.settings.lastOpenedProject || null
  } catch (error) {
    console.error('Failed to get last opened project:', error)
    return null
  }
}

export const setLastOpenedProject = async (projectId: string): Promise<boolean> => {
  try {
    const database = await readProjectDatabase()
    database.settings.lastOpenedProject = projectId
    return await writeProjectDatabase(database)
  } catch (error) {
    console.error('Failed to set last opened project:', error)
    return false
  }
}

// ============================================================================
// Legacy Support (for backward compatibility)
// ============================================================================

export const createNewDiagram = async (): Promise<boolean> => {
  // For backward compatibility, create a new project instead
  const projectId = await createProject('New Project')
  return projectId !== null
}

// This function is for backward compatibility with existing diagram storage
export const saveDiagramToDatabase = async (diagram: DiagramData): Promise<boolean> => {
  try {
    // Try to determine current project from settings
    const lastProject = await getLastOpenedProject()
    if (lastProject) {
      return await saveProjectDiagram(lastProject, diagram.nodes, diagram.edges)
    }
    
    // If no last project, create a new one
    const projectId = await createProject('Auto-saved Project', diagram.nodes, diagram.edges)
    return projectId !== null
  } catch (error) {
    console.error('Failed to save diagram to database:', error)
    return false
  }
}

// This function is for backward compatibility with existing diagram storage
export const loadDiagramFromDatabase = async (): Promise<{ nodes: PyPSANode[], edges: PyPSAEdge[] } | null> => {
  try {
    const lastProject = await getLastOpenedProject()
    if (lastProject) {
      return await loadProjectDiagram(lastProject)
    }
    
    // If no last project but projects exist, get the most recent one
    const projects = await getAllProjects()
    if (projects.length > 0) {
      const mostRecent = projects[0]
      await setLastOpenedProject(mostRecent.id)
      return {
        nodes: mostRecent.nodes,
        edges: mostRecent.edges
      }
    }
    
    return null
  } catch (error) {
    console.error('Failed to load diagram from database:', error)
    return null
  }
}