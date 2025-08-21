import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import {
  createProject,
  getProject,
  getAllProjects,
  updateProject,
  deleteProject,
  duplicateProject,
  generateProjectId,
} from './project-storage'


declare global {
  interface Window {
    api: {
      readDatabase: () => Promise<{ success: boolean; data?: any }>
      writeDatabase: (data: any) => Promise<{ success: boolean }>
    }
  }
}

let readDatabase: Mock
let writeDatabase: Mock

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()

  readDatabase = vi.fn()
  writeDatabase = vi.fn()

  globalThis.window = Object.create(window)
  window.api = {
    readDatabase,
    writeDatabase
  }
})

describe('project-storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateProjectId', () => {
    it('generates a project ID with correct format', () => {
      const id = generateProjectId()
      
      expect(id).toMatch(/^project_\d+_[a-z0-9]{5}$/)
    })

    it('generates unique IDs on multiple calls', () => {
      const id1 = generateProjectId()
      const id2 = generateProjectId()
      
      expect(id1).not.toBe(id2)
    })

    it('includes timestamp in ID', () => {
      const beforeTime = Date.now()
      const id = generateProjectId()
      const afterTime = Date.now()
      
      const timestampMatch = id.match(/^project_(\d+)_/)
      expect(timestampMatch).toBeTruthy()
      
      const timestamp = parseInt(timestampMatch![1])
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(timestamp).toBeLessThanOrEqual(afterTime)
    })

    it('includes random component in ID', () => {
      const id = generateProjectId()
      const randomMatch = id.match(/_([a-z0-9]{5})$/)
      
      expect(randomMatch).toBeTruthy()
      expect(randomMatch![1]).toHaveLength(5)
    })
  })
})



describe('project-storage async operations', () => {
  it('creates a new project and writes to the database', async () => {
    vi.mocked(readDatabase).mockResolvedValue({
      success: true,
      data: { projects: {}, settings: {} }
    })

    vi.mocked(writeDatabase).mockResolvedValue({ success: true })

    const projectId = await createProject('Test Project')

    expect(projectId).toMatch(/^project_/)
    expect(writeDatabase).toHaveBeenCalled()
  })

  it('retrieves a project by ID', async () => {
    const mockProject = { id: 'project-1', name: 'Test', cases: [], activeCase: '', metadata: {} }

    vi.mocked(readDatabase).mockResolvedValue({
      success: true,
      data: { projects: { 'project-1': mockProject }, settings: {} }
    })

    const result = await getProject('project-1')
    expect(result).toEqual(mockProject)
  })

  it('returns all projects sorted by lastModified', async () => {
    const projects = {
      '1': { id: '1', name: 'A', metadata: { lastModified: '2023-01-01' }, cases: [], activeCase: '' },
      '2': { id: '2', name: 'B', metadata: { lastModified: '2023-02-01' }, cases: [], activeCase: '' }
    }

    vi.mocked(readDatabase).mockResolvedValue({
      success: true,
      data: { projects, settings: {} }
    })

    const result = await getAllProjects()
    expect(result[0].id).toBe('2') // Most recent first
  })

  it('updates a project and writes to the database', async () => {
    const existing = {
      id: 'project-1',
      name: 'Old Name',
      metadata: { lastModified: '2023-01-01' },
      cases: [],
      activeCase: ''
    }

    vi.mocked(readDatabase).mockResolvedValue({
      success: true,
      data: { projects: { 'project-1': existing }, settings: {} }
    })

    vi.mocked(writeDatabase).mockResolvedValue({ success: true })

    const result = await updateProject('project-1', { name: 'New Name' })
    expect(result).toBe(true)
    expect(writeDatabase).toHaveBeenCalled()
  })

  it('deletes a project and updates the database', async () => {
    const db = {
      projects: { 'project-1': { id: 'project-1', name: 'Test', cases: [], activeCase: '', metadata: {} } },
      settings: { lastOpenedProject: 'project-1' }
    }

    vi.mocked(readDatabase).mockResolvedValue({ success: true, data: db })
    vi.mocked(writeDatabase).mockResolvedValue({ success: true })

    const result = await deleteProject('project-1')
    expect(result).toBe(true)
    expect(writeDatabase).toHaveBeenCalled()
  })

  it('duplicates a project and writes it to the database', async () => {
    const original = {
      id: 'project-1',
      name: 'Original Project',
      metadata: { created: '2023-01-01', lastModified: '2023-01-01' },
      cases: [
        {
          id: 'case-1',
          name: 'Base',
          nodes: [],
          edges: [],
          metadata: { created: '2023-01-01', lastModified: '2023-01-01' }
        }
      ],
      activeCase: 'case-1'
    }

    vi.mocked(readDatabase).mockResolvedValue({
      success: true,
      data: { projects: { 'project-1': original }, settings: {} }
    })

    vi.mocked(writeDatabase).mockResolvedValue({ success: true })

    const newId = await duplicateProject('project-1')
    expect(newId).toMatch(/^project_/)
    expect(writeDatabase).toHaveBeenCalled()
  })
})

