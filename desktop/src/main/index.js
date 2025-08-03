import { app, shell, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { readFileSync, writeFileSync, existsSync } from 'fs'

let mainWindow

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
    app.quit()
  }
})