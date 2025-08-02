import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportToPyPSA, generatePythonCode, exportDiagramAsJSON, exportDiagramAsPython } from './pypsa-exporter.js'

describe('PyPSA Exporter', () => {
  const sampleNodes = [
    {
      id: 'bus-1',
      type: 'busNode',
      position: { x: 100, y: 200 },
      data: {
        label: 'Bus 1',
        v_nom: 13.8,
        carrier: 'AC'
      }
    },
    {
      id: 'bus-2',
      type: 'busNode',
      position: { x: 300, y: 200 },
      data: {
        label: 'Bus 2',
        v_nom: 69,
        carrier: 'AC'
      }
    },
    {
      id: 'gen-1',
      type: 'generatorNode',
      position: { x: 50, y: 100 },
      data: {
        label: 'Solar Gen',
        p_nom: 100,
        carrier: 'solar',
        marginal_cost: 0
      }
    },
    {
      id: 'load-1',
      type: 'loadNode',
      position: { x: 350, y: 100 },
      data: {
        label: 'Load 1',
        p_set: 50,
        q_set: 10
      }
    },
    {
      id: 'battery-1',
      type: 'batteryNode',
      position: { x: 200, y: 300 },
      data: {
        label: 'Battery',
        p_nom: 25,
        max_hours: 4,
        efficiency_store: 0.95,
        efficiency_dispatch: 0.95
      }
    }
  ]

  const sampleEdges = [
    {
      id: 'edge-1',
      source: 'gen-1',
      target: 'bus-1',
      sourceHandle: 'right',
      targetHandle: 'left'
    },
    {
      id: 'edge-2',
      source: 'bus-1',
      target: 'bus-2',
      sourceHandle: 'right',
      targetHandle: 'left',
      data: {
        length: 10,
        r: 0.1,
        x: 0.1,
        s_nom: 100
      }
    },
    {
      id: 'edge-3',
      source: 'bus-2',
      target: 'load-1',
      sourceHandle: 'right',
      targetHandle: 'left'
    },
    {
      id: 'edge-4',
      source: 'battery-1',
      target: 'bus-1',
      sourceHandle: 'top',
      targetHandle: 'bottom'
    }
  ]

  describe('exportToPyPSA', () => {
    it('should export buses correctly', () => {
      const result = exportToPyPSA(sampleNodes, sampleEdges)
      
      expect(result.buses).toHaveLength(2)
      expect(result.buses[0]).toEqual({
        name: 'bus-1',
        v_nom: 13.8,
        carrier: 'AC',
        x: 100,
        y: 200
      })
      expect(result.buses[1]).toEqual({
        name: 'bus-2',
        v_nom: 69,
        carrier: 'AC',
        x: 300,
        y: 200
      })
    })

    it('should export generators with connected bus', () => {
      const result = exportToPyPSA(sampleNodes, sampleEdges)
      
      expect(result.generators).toHaveLength(1)
      expect(result.generators[0]).toEqual({
        name: 'gen-1',
        bus: 'bus-1',
        p_nom: 100,
        carrier: 'solar',
        marginal_cost: 0,
        capital_cost: 0,
        p_nom_extendable: false,
        control: 'PQ'
      })
    })

    it('should export loads with connected bus', () => {
      const result = exportToPyPSA(sampleNodes, sampleEdges)
      
      expect(result.loads).toHaveLength(1)
      expect(result.loads[0]).toEqual({
        name: 'load-1',
        bus: 'bus-2',
        p_set: 50,
        q_set: 10
      })
    })

    it('should export storage units with connected bus', () => {
      const result = exportToPyPSA(sampleNodes, sampleEdges)
      
      expect(result.storage_units).toHaveLength(1)
      expect(result.storage_units[0]).toEqual({
        name: 'battery-1',
        bus: 'bus-1',
        p_nom: 25,
        max_hours: 4,
        efficiency_store: 0.95,
        efficiency_dispatch: 0.95,
        capital_cost: 0,
        cyclic_state_of_charge: true
      })
    })

    it('should export lines for bus-to-bus connections', () => {
      const result = exportToPyPSA(sampleNodes, sampleEdges)
      
      expect(result.lines).toHaveLength(1)
      expect(result.lines[0]).toEqual({
        name: 'edge-2',
        bus0: 'bus-1',
        bus1: 'bus-2',
        x: 0.1,
        r: 0.1,
        s_nom: 100,
        length: 10
      })
    })

    it('should include snapshots', () => {
      const result = exportToPyPSA(sampleNodes, sampleEdges)
      
      expect(result.snapshots).toEqual(['2024-01-01 00:00'])
    })

    it('should handle empty inputs', () => {
      const result = exportToPyPSA([], [])
      
      expect(result.buses).toHaveLength(0)
      expect(result.generators).toHaveLength(0)
      expect(result.loads).toHaveLength(0)
      expect(result.lines).toHaveLength(0)
      expect(result.storage_units).toHaveLength(0)
      expect(result.snapshots).toEqual(['2024-01-01 00:00'])
    })

    it('should use default values when node data is missing', () => {
      const nodesWithDefaults = [
        {
          id: 'bus-default',
          type: 'busNode',
          position: { x: 0, y: 0 },
          data: {} // Empty data
        },
        {
          id: 'gen-default',
          type: 'generatorNode',
          position: { x: 0, y: 0 },
          data: {} // Empty data
        }
      ]

      const result = exportToPyPSA(nodesWithDefaults, [])
      
      expect(result.buses[0].v_nom).toBe(110)
      expect(result.buses[0].carrier).toBe('AC')
      expect(result.generators[0].p_nom).toBe(100)
      expect(result.generators[0].carrier).toBe('solar')
    })
  })

  describe('generatePythonCode', () => {
    it('should generate valid Python code', () => {
      const pypsaNetwork = exportToPyPSA(sampleNodes, sampleEdges)
      const pythonCode = generatePythonCode(pypsaNetwork)
      
      expect(pythonCode).toContain('import pypsa')
      expect(pythonCode).toContain('import pandas as pd')
      expect(pythonCode).toContain('network = pypsa.Network()')
      expect(pythonCode).toContain('network.set_snapshots')
    })

    it('should include all buses in Python code', () => {
      const pypsaNetwork = exportToPyPSA(sampleNodes, sampleEdges)
      const pythonCode = generatePythonCode(pypsaNetwork)
      
      expect(pythonCode).toContain('network.add("Bus", "bus-1"')
      expect(pythonCode).toContain('network.add("Bus", "bus-2"')
      expect(pythonCode).toContain('v_nom=13.8')
      expect(pythonCode).toContain('v_nom=69')
    })

    it('should include all generators in Python code', () => {
      const pypsaNetwork = exportToPyPSA(sampleNodes, sampleEdges)
      const pythonCode = generatePythonCode(pypsaNetwork)
      
      expect(pythonCode).toContain('network.add("Generator", "gen-1"')
      expect(pythonCode).toContain('bus="bus-1"')
      expect(pythonCode).toContain('p_nom=100')
      expect(pythonCode).toContain('carrier="solar"')
    })

    it('should include all loads in Python code', () => {
      const pypsaNetwork = exportToPyPSA(sampleNodes, sampleEdges)
      const pythonCode = generatePythonCode(pypsaNetwork)
      
      expect(pythonCode).toContain('network.add("Load", "load-1"')
      expect(pythonCode).toContain('p_set=50')
      expect(pythonCode).toContain('q_set=10')
    })

    it('should include all storage units in Python code', () => {
      const pypsaNetwork = exportToPyPSA(sampleNodes, sampleEdges)
      const pythonCode = generatePythonCode(pypsaNetwork)
      
      expect(pythonCode).toContain('network.add("StorageUnit", "battery-1"')
      expect(pythonCode).toContain('p_nom=25')
      expect(pythonCode).toContain('max_hours=4')
      expect(pythonCode).toContain('efficiency_store=0.95')
    })

    it('should include all lines in Python code', () => {
      const pypsaNetwork = exportToPyPSA(sampleNodes, sampleEdges)
      const pythonCode = generatePythonCode(pypsaNetwork)
      
      expect(pythonCode).toContain('network.add("Line", "edge-2"')
      expect(pythonCode).toContain('bus0="bus-1"')
      expect(pythonCode).toContain('bus1="bus-2"')
      expect(pythonCode).toContain('length=10')
    })

    it('should handle boolean values correctly', () => {
      const pypsaNetwork = exportToPyPSA(sampleNodes, sampleEdges)
      const pythonCode = generatePythonCode(pypsaNetwork)
      
      expect(pythonCode).toContain('p_nom_extendable=False')
      expect(pythonCode).toContain('cyclic_state_of_charge=True')
    })
  })

  describe('exportDiagramAsJSON', () => {
    beforeEach(() => {
      // Mock window.api
      global.window = {
        api: {
          exportFile: vi.fn().mockResolvedValue({ success: true })
        }
      }
      
      // Mock DOM APIs for fallback
      global.document = {
        createElement: vi.fn().mockReturnValue({
          click: vi.fn(),
          remove: vi.fn()
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

    it('should call Electron API when available', async () => {
      const result = await exportDiagramAsJSON(sampleNodes, sampleEdges)
      
      expect(window.api.exportFile).toHaveBeenCalledWith(
        expect.stringContaining('"buses"'),
        'pypsa-network.json',
        expect.arrayContaining([
          { name: 'PyPSA JSON Files', extensions: ['json'] }
        ])
      )
      expect(result).toBe(true)
    })

    it('should use browser fallback when Electron API not available', async () => {
      delete global.window.api
      
      const result = await exportDiagramAsJSON(sampleNodes, sampleEdges)
      
      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('"buses"')],
        { type: 'application/json' }
      )
      expect(result).toBe(true)
    })

    it('should handle export errors gracefully', async () => {
      window.api.exportFile.mockRejectedValue(new Error('Export failed'))
      
      const result = await exportDiagramAsJSON(sampleNodes, sampleEdges)
      
      expect(result).toBe(false)
    })
  })

  describe('exportDiagramAsPython', () => {
    beforeEach(() => {
      // Mock window.api
      global.window = {
        api: {
          exportFile: vi.fn().mockResolvedValue({ success: true })
        }
      }
      
      // Mock DOM APIs for fallback
      global.document = {
        createElement: vi.fn().mockReturnValue({
          click: vi.fn(),
          remove: vi.fn()
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

    it('should call Electron API when available', async () => {
      const result = await exportDiagramAsPython(sampleNodes, sampleEdges)
      
      expect(window.api.exportFile).toHaveBeenCalledWith(
        expect.stringContaining('import pypsa'),
        'pypsa-network.py',
        expect.arrayContaining([
          { name: 'Python Files', extensions: ['py'] }
        ])
      )
      expect(result).toBe(true)
    })

    it('should use browser fallback when Electron API not available', async () => {
      delete global.window.api
      
      const result = await exportDiagramAsPython(sampleNodes, sampleEdges)
      
      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('import pypsa')],
        { type: 'text/plain' }
      )
      expect(result).toBe(true)
    })

    it('should handle export errors gracefully', async () => {
      window.api.exportFile.mockRejectedValue(new Error('Export failed'))
      
      const result = await exportDiagramAsPython(sampleNodes, sampleEdges)
      
      expect(result).toBe(false)
    })
  })
})