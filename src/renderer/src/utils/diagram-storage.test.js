import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveDiagramToFile, loadDiagramFromFile } from './diagram-storage.js'

describe('Diagram Storage', () => {
  const sampleDiagram = {
    nodes: [
      {
        id: 'bus-1',
        type: 'busNode',
        position: { x: 100, y: 200 },
        data: { label: 'Bus 1', v_nom: 13.8, carrier: 'AC' }
      },
      {
        id: 'gen-1',
        type: 'generatorNode',
        position: { x: 50, y: 100 },
        data: { label: 'Solar Gen', p_nom: 100, carrier: 'solar', marginal_cost: 0.001 }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'gen-1',
        target: 'bus-1',
        sourceHandle: 'right',
        targetHandle: 'left'
      }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock Date to return consistent timestamps
    const mockDate = new Date('2024-01-01T12:00:00Z')
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate)
  })

  describe('saveDiagramToFile', () => {
    beforeEach(() => {
      // Mock window.api
      global.window = {
        api: {
          saveFile: vi.fn().mockResolvedValue({ success: true, path: '/test/path.rsd' })
        }
      }
      
      // Mock DOM APIs for fallback
      global.document = {
        createElement: vi.fn().mockReturnValue({
          click: vi.fn(),
          href: '',
          download: ''
        }),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn()
        }
      }
      
      global.URL = {
        createObjectURL: vi.fn().mockReturnValue('mock-url'),
        revokeObjectURL: vi.fn()
      }
      
      global.Blob = vi.fn()
    })

    it('should save diagram using Electron API when available', async () => {
      const result = await saveDiagramToFile(sampleDiagram)
      
      expect(window.api.saveFile).toHaveBeenCalledWith(
        expect.stringContaining('"version": "1.0"'),
        null
      )
      expect(result).toBe('/test/path.rsd')
    })

    it('should save diagram with current path when provided', async () => {
      const currentPath = '/existing/file.rsd'
      await saveDiagramToFile(sampleDiagram, currentPath)
      
      expect(window.api.saveFile).toHaveBeenCalledWith(
        expect.stringContaining('"version": "1.0"'),
        currentPath
      )
    })

    it('should include correct diagram structure in saved data', async () => {
      await saveDiagramToFile(sampleDiagram)
      
      const savedData = JSON.parse(window.api.saveFile.mock.calls[0][0])
      expect(savedData).toEqual({
        version: '1.0',
        nodes: sampleDiagram.nodes,
        edges: sampleDiagram.edges,
        metadata: {
          created: '2024-01-01T12:00:00.000Z',
          lastModified: '2024-01-01T12:00:00.000Z'
        }
      })
    })

    it('should use browser fallback when Electron API not available', async () => {
      delete global.window.api
      
      const result = await saveDiagramToFile(sampleDiagram)
      
      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('"version": "1.0"')],
        { type: 'application/json' }
      )
      expect(result).toBe(true)
    })

    it('should handle save errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      window.api.saveFile.mockRejectedValue(new Error('Save failed'))
      
      const result = await saveDiagramToFile(sampleDiagram)
      
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save diagram to file:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('should return false when Electron API returns failure', async () => {
      window.api.saveFile.mockResolvedValue({ success: false })
      
      const result = await saveDiagramToFile(sampleDiagram)
      
      expect(result).toBe(false)
    })
  })

  describe('loadDiagramFromFile', () => {
    const validFileData = {
      version: '1.0',
      nodes: sampleDiagram.nodes,
      edges: sampleDiagram.edges,
      metadata: {
        created: '2024-01-01T12:00:00.000Z',
        lastModified: '2024-01-01T12:00:00.000Z'
      }
    }

    beforeEach(() => {
      // Mock window.api
      global.window = {
        api: {
          openFile: vi.fn().mockResolvedValue({
            success: true,
            data: JSON.stringify(validFileData),
            path: '/test/file.rsd'
          })
        }
      }
      
      // Mock DOM APIs for fallback
      global.document = {
        createElement: vi.fn().mockReturnValue({
          click: vi.fn(),
          type: '',
          accept: '',
          onchange: null
        })
      }
    })

    it('should load diagram using Electron API when available', async () => {
      const result = await loadDiagramFromFile()
      
      expect(window.api.openFile).toHaveBeenCalled()
      expect(result).toEqual({
        nodes: sampleDiagram.nodes,
        edges: sampleDiagram.edges,
        path: '/test/file.rsd'
      })
    })

    it('should return null when no file selected in Electron', async () => {
      window.api.openFile.mockResolvedValue({ success: false })
      
      const result = await loadDiagramFromFile()
      
      expect(result).toBeNull()
    })

    it('should validate diagram structure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const invalidData = { invalid: 'structure' }
      window.api.openFile.mockResolvedValue({
        success: true,
        data: JSON.stringify(invalidData),
        path: '/test/file.rsd'
      })
      
      const result = await loadDiagramFromFile()
      
      expect(result).toBeNull()
      consoleSpy.mockRestore()
    })

    it('should handle missing nodes array', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const invalidData = { edges: [] }
      window.api.openFile.mockResolvedValue({
        success: true,
        data: JSON.stringify(invalidData),
        path: '/test/file.rsd'
      })
      
      const result = await loadDiagramFromFile()
      
      expect(result).toBeNull()
      consoleSpy.mockRestore()
    })

    it('should handle missing edges array', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const invalidData = { nodes: [] }
      window.api.openFile.mockResolvedValue({
        success: true,
        data: JSON.stringify(invalidData),
        path: '/test/file.rsd'
      })
      
      const result = await loadDiagramFromFile()
      
      expect(result).toBeNull()
      consoleSpy.mockRestore()
    })

    it('should handle invalid JSON', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      window.api.openFile.mockResolvedValue({
        success: true,
        data: 'invalid json',
        path: '/test/file.rsd'
      })
      
      const result = await loadDiagramFromFile()
      
      expect(result).toBeNull()
      consoleSpy.mockRestore()
    })

    it('should use browser fallback when Electron API not available', async () => {
      delete global.window.api
      
      // Mock file input behavior
      const mockFile = {
        text: vi.fn().mockResolvedValue(JSON.stringify(validFileData))
      }
      
      const mockInput = {
        click: vi.fn(),
        onchange: null,
        type: '',
        accept: ''
      }
      
      global.document.createElement.mockReturnValue(mockInput)
      
      // Simulate file selection
      const promise = loadDiagramFromFile()
      
      // Trigger the onchange event
      mockInput.onchange({ target: { files: [mockFile] } })
      
      const result = await promise
      
      expect(result).toEqual({
        nodes: sampleDiagram.nodes,
        edges: sampleDiagram.edges
      })
    })

    it('should handle no file selected in browser fallback', async () => {
      delete global.window.api
      
      const mockInput = {
        click: vi.fn(),
        onchange: null,
        type: '',
        accept: ''
      }
      
      global.document.createElement.mockReturnValue(mockInput)
      
      // Simulate no file selection
      const promise = loadDiagramFromFile()
      
      // Trigger the onchange event with no files
      mockInput.onchange({ target: { files: [] } })
      
      const result = await promise
      
      expect(result).toBeNull()
    })

    it('should handle invalid file content in browser fallback', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      delete global.window.api
      
      const mockFile = {
        text: vi.fn().mockResolvedValue('invalid json')
      }
      
      const mockInput = {
        click: vi.fn(),
        onchange: null,
        type: '',
        accept: ''
      }
      
      global.document.createElement.mockReturnValue(mockInput)
      
      // Simulate file selection with invalid content
      const promise = loadDiagramFromFile()
      
      // Trigger the onchange event
      mockInput.onchange({ target: { files: [mockFile] } })
      
      try {
        await promise
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeDefined()
      }
      
      consoleSpy.mockRestore()
    })
  })
})