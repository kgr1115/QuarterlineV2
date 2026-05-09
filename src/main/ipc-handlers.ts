import { ipcMain } from 'electron'
import { IpcChannels } from '../shared/ipc-channels'
import type { WindowState, WorkspaceCreateInput } from '../shared/ipc-channels'
import { getWorkspaceDbPath } from './paths'
import { readAppConfig, updateAppConfig } from './app-config'
import {
  closeActiveWorkspace,
  createWorkspace,
  getActiveWorkspace,
  getActiveWorkspaceDb,
  listWorkspaces,
  openWorkspace
} from './workspace-manager'

export function registerIpcHandlers(): void {
  ipcMain.handle(IpcChannels.PING, () => ({
    pong: true,
    timestamp: Date.now(),
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node
  }))

  ipcMain.handle(IpcChannels.DB_STATUS, () => {
    const db = getActiveWorkspaceDb()
    const active = getActiveWorkspace()
    if (!db || !active) {
      return { connected: false, path: null, version: null }
    }
    const version = db.prepare('SELECT sqlite_version() AS v').get() as {
      v: string
    }
    return {
      connected: true,
      path: getWorkspaceDbPath(active.id),
      version: version.v
    }
  })

  ipcMain.handle(IpcChannels.WORKSPACE_LIST, () => listWorkspaces())

  ipcMain.handle(
    IpcChannels.WORKSPACE_CREATE,
    (_event, input: WorkspaceCreateInput) => createWorkspace(input)
  )

  ipcMain.handle(IpcChannels.WORKSPACE_OPEN, (_event, id: string) =>
    openWorkspace(id)
  )

  ipcMain.handle(IpcChannels.WORKSPACE_CLOSE, () => {
    closeActiveWorkspace()
    updateAppConfig({ lastWorkspaceId: null })
    return null
  })

  ipcMain.handle(IpcChannels.WORKSPACE_CURRENT, () => getActiveWorkspace())

  ipcMain.handle(IpcChannels.WINDOW_STATE_GET, () => readAppConfig().windowState)

  ipcMain.handle(IpcChannels.WINDOW_STATE_SAVE, (_event, state: WindowState) => {
    updateAppConfig({ windowState: state })
    return null
  })
}
