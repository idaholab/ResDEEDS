import { vi } from 'vitest'

// Mock contextBridge
export const mockContextBridge = {
  exposeInMainWorld: vi.fn(),
}

// Mock ipcRenderer
export const mockIpcRenderer = {
  invoke: vi.fn(),
  send: vi.fn(),
  on: vi.fn(),
  once: vi.fn(),
  removeListener: vi.fn(),
  removeAllListeners: vi.fn(),
}

// Mock preload API
export const mockPreloadApi = {
  openFile: vi.fn(() => Promise.resolve({ success: true, data: '{}' })),
  saveFile: vi.fn(() => Promise.resolve({ success: true })),
  saveFileAs: vi.fn(() => Promise.resolve({ success: true })),
  newFile: vi.fn(() => Promise.resolve({ success: true })),
  exportPyPSAJson: vi.fn(() => Promise.resolve({ success: true })),
  exportPyPSACode: vi.fn(() => Promise.resolve({ success: true })),
  exportAsPNG: vi.fn(() => Promise.resolve({ success: true })),
  onMenuAction: vi.fn(),
  store: {
    get: vi.fn(() => Promise.resolve(null)),
    set: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
    clear: vi.fn(() => Promise.resolve()),
  },
}

// Helper to set up preload mocks
export const setupPreloadMocks = () => {
  vi.mock('electron', () => ({
    contextBridge: mockContextBridge,
    ipcRenderer: mockIpcRenderer,
  }))

  // Mock the window.electron API
  Object.defineProperty(global, 'window', {
    value: {
      electron: mockPreloadApi,
    },
    writable: true,
  })
}