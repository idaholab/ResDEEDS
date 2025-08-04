import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // File operations
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (data, currentPath) => ipcRenderer.invoke('dialog:saveFile', data, currentPath),
  exportFile: (data, defaultName, filters) => ipcRenderer.invoke('dialog:exportFile', data, defaultName, filters),
  
  // Database operations
  readDatabase: () => ipcRenderer.invoke('db:read'),
  writeDatabase: (data) => ipcRenderer.invoke('db:write', data),
  databaseExists: () => ipcRenderer.invoke('db:exists'),
  
  // Menu event listeners
  onMenuAction: (callback) => {
    // Remove any existing listeners first
    const events = [
      'menu-new-diagram',
      'menu-open-diagram',
      'menu-save-diagram',
      'menu-save-diagram-as',
      'menu-export-json',
      'menu-export-python'
    ]
    
    events.forEach(event => {
      ipcRenderer.removeAllListeners(event)
      ipcRenderer.on(event, (_, ...args) => callback(event, ...args))
    })
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}