import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { registerIpcHandlers } from './ipc-handlers'
import { readAppConfig, updateAppConfig } from './app-config'
import { closeActiveWorkspace, openWorkspace } from './workspace-manager'
import { installCrashHandlers, logCrash } from './crash-log'
import { buildAppMenu } from './app-menu'

installCrashHandlers()

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const config = readAppConfig()
  const saved = config.windowState

  mainWindow = new BrowserWindow({
    width: saved?.width ?? 1440,
    height: saved?.height ?? 900,
    x: saved?.x,
    y: saved?.y,
    minWidth: 1280,
    minHeight: 720,
    backgroundColor: '#0F172A',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  if (saved?.isMaximized) mainWindow.maximize()

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', () => {
    if (!mainWindow) return
    const bounds = mainWindow.getBounds()
    updateAppConfig({
      windowState: {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        isMaximized: mainWindow.isMaximized()
      }
    })
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function restoreLastWorkspace(): void {
  const { lastWorkspaceId } = readAppConfig()
  if (!lastWorkspaceId) return
  try {
    openWorkspace(lastWorkspaceId)
  } catch (err) {
    logCrash('restoreLastWorkspace', err)
    console.warn(
      `Could not restore workspace "${lastWorkspaceId}":`,
      err instanceof Error ? err.message : err
    )
    updateAppConfig({ lastWorkspaceId: null })
  }
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

app.whenReady().then(() => {
  registerIpcHandlers()
  restoreLastWorkspace()
  createWindow()
  buildAppMenu(() => mainWindow)
})

app.on('window-all-closed', () => {
  closeActiveWorkspace()
  app.quit()
})
