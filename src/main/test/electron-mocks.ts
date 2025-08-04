import { vi } from 'vitest'

// Mock BrowserWindow
export const mockBrowserWindow = {
  new: vi.fn(() => ({
    loadFile: vi.fn(),
    loadURL: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    close: vi.fn(),
    destroy: vi.fn(),
    isDestroyed: vi.fn(() => false),
    webContents: {
      send: vi.fn(),
      on: vi.fn(),
      once: vi.fn(),
      openDevTools: vi.fn(),
      closeDevTools: vi.fn(),
    },
    setMenu: vi.fn(),
    setMenuBarVisibility: vi.fn(),
  })),
  getAllWindows: vi.fn(() => []),
  getFocusedWindow: vi.fn(() => null),
}

// Mock Menu
export const mockMenu = {
  buildFromTemplate: vi.fn(() => ({
    popup: vi.fn(),
    closePopup: vi.fn(),
  })),
  setApplicationMenu: vi.fn(),
  getApplicationMenu: vi.fn(() => null),
}

// Mock dialog
export const mockDialog = {
  showOpenDialog: vi.fn(() => Promise.resolve({ canceled: false, filePaths: ['test.rsd'] })),
  showSaveDialog: vi.fn(() => Promise.resolve({ canceled: false, filePath: 'test.rsd' })),
  showMessageBox: vi.fn(() => Promise.resolve({ response: 0 })),
  showErrorBox: vi.fn(),
}

// Mock app
export const mockApp = {
  quit: vi.fn(),
  exit: vi.fn(),
  getVersion: vi.fn(() => '1.0.0'),
  getName: vi.fn(() => 'ResDEEDS'),
  getPath: vi.fn(() => '/tmp'),
  whenReady: vi.fn(() => Promise.resolve()),
  on: vi.fn(),
  once: vi.fn(),
  setUserTasks: vi.fn(),
  setAboutPanelOptions: vi.fn(),
  dock: {
    hide: vi.fn(),
    show: vi.fn(),
    setMenu: vi.fn(),
  },
}

// Mock ipcMain
export const mockIpcMain = {
  handle: vi.fn(),
  on: vi.fn(),
  once: vi.fn(),
  removeHandler: vi.fn(),
  removeAllListeners: vi.fn(),
}

// Mock shell
export const mockShell = {
  openExternal: vi.fn(() => Promise.resolve()),
  openPath: vi.fn(() => Promise.resolve('')),
  showItemInFolder: vi.fn(),
  moveItemToTrash: vi.fn(() => Promise.resolve(true)),
}

// Mock nativeTheme
export const mockNativeTheme = {
  shouldUseDarkColors: false,
  themeSource: 'system' as const,
  on: vi.fn(),
  once: vi.fn(),
  removeListener: vi.fn(),
}

// Mock fs operations
export const mockFs = {
  readFile: vi.fn(() => Promise.resolve(Buffer.from('{}'))),
  writeFile: vi.fn(() => Promise.resolve()),
  exists: vi.fn(() => Promise.resolve(true)),
  mkdir: vi.fn(() => Promise.resolve()),
  readdir: vi.fn(() => Promise.resolve([])),
  stat: vi.fn(() => Promise.resolve({ isFile: () => true, isDirectory: () => false })),
}

// Helper to set up all mocks
export const setupElectronMocks = () => {
  vi.mock('electron', () => ({
    BrowserWindow: mockBrowserWindow,
    Menu: mockMenu,
    dialog: mockDialog,
    app: mockApp,
    ipcMain: mockIpcMain,
    shell: mockShell,
    nativeTheme: mockNativeTheme,
  }))

  vi.mock('fs/promises', () => mockFs)
}