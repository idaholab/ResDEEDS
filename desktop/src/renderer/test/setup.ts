import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Mock Electron APIs
Object.defineProperty(window, 'electron', {
  value: {
    ipcRenderer: {
      invoke: vi.fn(),
      send: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn(),
    },
    store: {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
    },
    api: {
      openFile: vi.fn(),
      saveFile: vi.fn(),
      saveFileAs: vi.fn(),
      newFile: vi.fn(),
      exportPyPSAJson: vi.fn(),
      exportPyPSACode: vi.fn(),
      exportAsPNG: vi.fn(),
      onMenuAction: vi.fn(),
    },
  },
})

// Mock React Flow
vi.mock('@xyflow/react', async () => {
  const actual = await vi.importActual('@xyflow/react')
  return {
    ...actual,
    ReactFlow: vi.fn(),
    useReactFlow: vi.fn(() => ({
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      setNodes: vi.fn(),
      setEdges: vi.fn(),
      addNodes: vi.fn(),
      addEdges: vi.fn(),
      deleteElements: vi.fn(),
      fitView: vi.fn(),
      getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
      setViewport: vi.fn(),
      project: vi.fn((point) => point),
      screenToFlowPosition: vi.fn((point) => point),
      flowToScreenPosition: vi.fn((point) => point),
    })),
    useNodesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
    useEdgesState: vi.fn(() => [[], vi.fn(), vi.fn()]),
    Handle: vi.fn(),
    Position: {
      Top: 'top',
      Right: 'right',
      Bottom: 'bottom',
      Left: 'left',
    },
    ReactFlowProvider: vi.fn(({ children }) => children),
  }
})

// Silence console warnings in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})