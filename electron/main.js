const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const { fork } = require('child_process')

let win, backendProc

function startBackend() {
  backendProc = fork(path.join(__dirname, '../backend/index.js'), [], {
    env: { ...process.env, PORT: '4000' }
  })
  backendProc.on('error', err => console.error('Backend error:', err))
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f0f0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  const isDev = !app.isPackaged
  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../frontend/dist/index.html'))
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  startBackend()
  setTimeout(createWindow, 1000)
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => {
  if (backendProc) backendProc.kill()
  if (process.platform !== 'darwin') app.quit()
})
