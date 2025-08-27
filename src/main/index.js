import { app, shell, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { spawn } from 'child_process'
import net from 'net'

let mainWindow
let analysisService = {
  proc: null,
  port: null,
  starting: false,
  startupPromise: null,
}

function getBackendPath() {
  // Resolve the backend directory whether in dev or packaged
  const appPath = app.getAppPath()
  // In development, appPath is the project root, backend is now in src/backend
  // When packaged with electron-builder, backend should be included in the app
  if (is.dev) {
    return join(appPath, 'src', 'backend')
  } else {
    // For packaged app, backend should be alongside the app.asar
    return join(appPath, '..', 'backend')
  }
}

function getFreePort() {
  return new Promise((resolve) => {
    const srv = net.createServer()
    srv.listen(0, () => {
      const port = srv.address().port
      srv.close(() => resolve(port))
    })
  })
}

async function startAnalysisService() {
  // If service is already running, return it
  if (analysisService.proc && analysisService.port) {
    return analysisService
  }
  
  // If service is starting, wait for the startup promise
  if (analysisService.starting && analysisService.startupPromise) {
    return await analysisService.startupPromise
  }
  
  // Start the service
  analysisService.starting = true
  analysisService.startupPromise = performStartup()
  
  try {
    const result = await analysisService.startupPromise
    return result
  } finally {
    analysisService.starting = false
    analysisService.startupPromise = null
  }
}

async function performStartup() {
  const port = await getFreePort()
  const backendDir = getBackendPath()

  // Prefer 'uvx' for ephemeral tool runs with extra deps
  // Fallback to 'uv run' and then plain python if not available
  const argsByVariant = [
    {
      cmd: process.platform === 'win32' ? 'uvx.exe' : 'uvx',
      args: [
        '--with', 'fastapi',
        '--with', 'uvicorn',
        '--with', 'pypsa',
        'uvicorn',
        'app:app',
        '--host', '127.0.0.1',
        '--port', String(port)
      ]
    },
    {
      cmd: process.platform === 'win32' ? 'uv.exe' : 'uv',
      args: [
        'run',
        '--with', 'fastapi',
        '--with', 'uvicorn',
        '--with', 'pypsa',
        '--', 'python', '-m', 'uvicorn',
        'app:app',
        '--host', '127.0.0.1', '--port', String(port)
      ]
    },
    {
      cmd: process.platform === 'win32' ? 'python.exe' : 'python3',
      args: ['-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', String(port)]
    }
  ]

  let proc = null
  let lastError = null
  
  console.log(`Starting analysis service in: ${backendDir}`)
  
  for (const variant of argsByVariant) {
    try {
      console.log(`Attempting to start with: ${variant.cmd} ${variant.args.join(' ')}`)
      proc = spawn(variant.cmd, variant.args, {
        cwd: backendDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: process.env,
        windowsHide: true,
      })
      
      // Handle process errors
      proc.on('error', (err) => {
        lastError = err
        console.error(`Process error for ${variant.cmd}:`, err.message)
      })
      
      proc.on('exit', (code, signal) => {
        if (code !== 0) {
          console.error(`Process ${variant.cmd} exited with code ${code}, signal ${signal}`)
        }
      })
      
      // Give it a moment to throw ENOENT if command not found
      await new Promise((r) => setTimeout(r, 500))
      if (proc.pid && !proc.killed) {
        console.log(`Successfully started analysis service with ${variant.cmd} on port ${port}`)
        break
      }
    } catch (e) {
      lastError = e
      console.error(`Failed to start with ${variant.cmd}:`, e.message)
      proc = null
      continue
    }
  }

  if (!proc || proc.killed) {
    const errorMsg = lastError ? 
      `Failed to start Python analysis service: ${lastError.message}` :
      'Failed to start Python analysis service (uv/uvx/python not found or backend directory missing).'
    throw new Error(errorMsg)
  }

  // Set service properties before waiting for health check
  analysisService.proc = proc
  analysisService.port = port

  // Wait for health endpoint
  await waitForService(port, 12000)
  
  return analysisService
}

async function waitForService(port, timeoutMs = 10000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health`)
      if (res.ok) return true
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error('Analysis service did not become healthy in time')
}

function stopAnalysisService() {
  try {
    if (analysisService.proc) {
      analysisService.proc.kill()
    }
  } catch {
    // ignore
  } finally {
    analysisService.proc = null
    analysisService.port = null
    analysisService.starting = false
    analysisService.startupPromise = null
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Diagram',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-diagram')
          }
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('menu-open-diagram')
          }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-save-diagram')
          }
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('menu-save-diagram-as')
          }
        },
        { type: 'separator' },
        {
          label: 'Export to PyPSA JSON',
          click: () => {
            mainWindow.webContents.send('menu-export-json')
          }
        },
        {
          label: 'Export to Python Code',
          click: () => {
            mainWindow.webContents.send('menu-export-python')
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About ResDEEDS',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About ResDEEDS',
              message: 'ResDEEDS',
              detail: 'A visual PyPSA network designer for power system modeling.\n\nVersion: 1.0.0',
              buttons: ['OK']
            })
          }
        }
      ]
    }
  ]

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          label: 'About ResDEEDS',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About ResDEEDS',
              message: 'ResDEEDS',
              detail: 'A visual PyPSA network designer for power system modeling.\n\nVersion: 1.0.0',
              buttons: ['OK']
            })
          }
        },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })

    // Window menu
    template[4].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ]
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// IPC handlers for file operations
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Diagram',
    filters: [
      { name: 'ResDEEDS Diagrams', extensions: ['rsd'] },
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  
  if (!canceled && filePaths.length > 0) {
    try {
      const content = readFileSync(filePaths[0], 'utf8')
      return { success: true, data: content, path: filePaths[0] }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  return { success: false, canceled: true }
})

ipcMain.handle('dialog:saveFile', async (event, data, currentPath) => {
  let filePath = currentPath
  
  if (!filePath) {
    const { canceled, filePath: selectedPath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Diagram',
      defaultPath: 'diagram.rsd',
      filters: [
        { name: 'ResDEEDS Diagrams', extensions: ['rsd'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    
    if (canceled) {
      return { success: false, canceled: true }
    }
    filePath = selectedPath
  }
  
  try {
    writeFileSync(filePath, data, 'utf8')
    return { success: true, path: filePath }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('dialog:exportFile', async (event, data, defaultName, filters) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Diagram',
    defaultPath: defaultName,
    filters: filters
  })
  
  if (!canceled && filePath) {
    try {
      writeFileSync(filePath, data, 'utf8')
      return { success: true, path: filePath }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  return { success: false, canceled: true }
})

// Database file operations
const getDatabasePath = () => {
  const userDataPath = app.getPath('userData')
  return join(userDataPath, 'resdeeds-db.json')
}

const ensureDatabase = () => {
  const dbPath = getDatabasePath()
  if (!existsSync(dbPath)) {
    const initialDb = {
      version: '1.0',
      diagrams: {}
    }
    writeFileSync(dbPath, JSON.stringify(initialDb, null, 2), 'utf8')
  }
}

ipcMain.handle('db:read', async () => {
  try {
    ensureDatabase()
    const dbPath = getDatabasePath()
    const content = readFileSync(dbPath, 'utf8')
    return { success: true, data: JSON.parse(content) }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db:write', async (_, data) => {
  try {
    ensureDatabase()
    const dbPath = getDatabasePath()
    writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('db:exists', async () => {
  try {
    const dbPath = getDatabasePath()
    return { success: true, exists: existsSync(dbPath) }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Analysis IPC
ipcMain.handle('analysis:health', async () => {
  try {
    await startAnalysisService()
    
    console.log(`Checking health at http://127.0.0.1:${analysisService.port}/api/health`)
    
    const res = await fetch(`http://127.0.0.1:${analysisService.port}/api/health`)
    
    if (!res.ok) {
      throw new Error(`Health check failed with status ${res.status}: ${res.statusText}`)
    }
    
    const body = await res.json()
    return { success: true, port: analysisService.port, body }
  } catch (error) {
    console.error('Health check failed:', error.message)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('analysis:run', async (_evt, networkJson) => {
  try {
    await startAnalysisService()
    
    console.log(`Making analysis request to http://127.0.0.1:${analysisService.port}/api/analyze`)
    
    const res = await fetch(`http://127.0.0.1:${analysisService.port}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(networkJson)
    })
    
    if (!res.ok) {
      throw new Error(`Analysis service returned status ${res.status}: ${res.statusText}`)
    }
    
    const body = await res.json()
    return { success: true, body }
  } catch (error) {
    console.error('Analysis request failed:', error.message)
    return { success: false, error: error.message }
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.inl.resdeeds')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  createMenu()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopAnalysisService()
    app.quit()
  }
})

app.on('before-quit', () => {
  stopAnalysisService()
})
