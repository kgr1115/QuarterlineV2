import {
  app,
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  shell
} from 'electron'
import { IpcChannels, MenuAction } from '../shared/ipc-channels'
import { getQuarterlineRoot } from './paths'
import { join } from 'path'

type WindowGetter = () => BrowserWindow | null

function send(getWindow: WindowGetter, action: MenuAction): void {
  const win = getWindow()
  if (!win || win.isDestroyed()) return
  win.webContents.send(IpcChannels.APP_MENU_ACTION, action)
}

export function buildAppMenu(getWindow: WindowGetter): void {
  const isDev = !app.isPackaged
  const isMac = process.platform === 'darwin'

  const fileMenu: MenuItemConstructorOptions = {
    label: '&File',
    submenu: [
      {
        label: 'New Workspace…',
        accelerator: 'CmdOrCtrl+N',
        click: () => send(getWindow, 'new-workspace')
      },
      {
        label: 'Close Workspace',
        accelerator: 'CmdOrCtrl+Shift+W',
        click: () => send(getWindow, 'close-workspace')
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  }

  const editMenu: MenuItemConstructorOptions = {
    label: '&Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' }
    ]
  }

  const viewMenu: MenuItemConstructorOptions = {
    label: '&View',
    submenu: [
      {
        label: 'Portfolio',
        accelerator: 'CmdOrCtrl+1',
        click: () => send(getWindow, 'route:portfolio')
      },
      {
        label: 'Reports',
        accelerator: 'CmdOrCtrl+2',
        click: () => send(getWindow, 'route:reports')
      },
      {
        label: 'Data Studio',
        accelerator: 'CmdOrCtrl+3',
        click: () => send(getWindow, 'route:data-studio')
      },
      {
        label: 'Settings',
        accelerator: 'CmdOrCtrl+,',
        click: () => send(getWindow, 'route:settings')
      },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      ...(isDev
        ? ([
            { type: 'separator' },
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' }
          ] as MenuItemConstructorOptions[])
        : [])
    ]
  }

  const windowMenu: MenuItemConstructorOptions = {
    label: '&Window',
    role: 'windowMenu'
  }

  const helpMenu: MenuItemConstructorOptions = {
    label: '&Help',
    submenu: [
      {
        label: 'Open Workspaces Folder',
        click: () => {
          void shell.openPath(getQuarterlineRoot())
        }
      },
      {
        label: 'Open Crash Log Folder',
        click: () => {
          void shell.openPath(join(getQuarterlineRoot(), 'logs'))
        }
      },
      { type: 'separator' },
      {
        label: `About QuarterlineV2 (v${app.getVersion()})`,
        click: () => {
          const win = getWindow()
          if (!win) return
          void win.webContents
            .executeJavaScript(
              `alert('QuarterlineV2 v${app.getVersion()}\\nElectron ${process.versions.electron}\\nNode ${process.versions.node}\\nChrome ${process.versions.chrome}')`
            )
            .catch(() => {})
        }
      }
    ]
  }

  const template: MenuItemConstructorOptions[] = [
    fileMenu,
    editMenu,
    viewMenu,
    windowMenu,
    helpMenu
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
