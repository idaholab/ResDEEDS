// ============================================================================
// Electron IPC Types
// ============================================================================

export interface ElectronAPI {
  ipcRenderer: {
    send(channel: string, ...args: unknown[]): void
    on(channel: string, func: (...args: unknown[]) => void): void
    once(channel: string, func: (...args: unknown[]) => void): void
    removeListener(channel: string, func: (...args: unknown[]) => void): void
    removeAllListeners(channel: string): void
    invoke(channel: string, ...args: unknown[]): Promise<unknown>
  }
  platform: string
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

// ============================================================================
// IPC Channel Types
// ============================================================================

export interface IPCChannels {
  // File operations
  'save-diagram': { data: string, filename?: string }
  'load-diagram': { filename?: string }
  'export-pypsa': { data: string, format: 'json' | 'python' }
  
  // Window operations
  'minimize-window': void
  'maximize-window': void
  'close-window': void
  
  // Menu operations
  'menu-new': void
  'menu-open': void
  'menu-save': void
  'menu-save-as': void
  'menu-export': void
}

// ============================================================================
// File System Types
// ============================================================================

export interface FileDialogOptions {
  title?: string
  defaultPath?: string
  buttonLabel?: string
  filters?: Array<{
    name: string
    extensions: string[]
  }>
  properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'>
}

export interface SaveDialogOptions {
  title?: string
  defaultPath?: string
  buttonLabel?: string
  filters?: Array<{
    name: string
    extensions: string[]
  }>
}

export interface FileOperationResult {
  success: boolean
  data?: string
  filename?: string
  error?: string
}

// ============================================================================
// Application Events
// ============================================================================

export interface AppEventHandlers {
  onNewDiagram: () => void
  onOpenDiagram: (data: string) => void
  onSaveDiagram: () => void
  onExportDiagram: (format: 'json' | 'python') => void
}

export type {}; // Ensure this file is treated as a module