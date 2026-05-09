import { ipcMain } from 'electron'
import { IpcChannels } from '../shared/ipc-channels'
import { getDatabase, getDatabasePath } from './database'

export function registerIpcHandlers(): void {
  ipcMain.handle(IpcChannels.PING, () => {
    return {
      pong: true,
      timestamp: Date.now(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node
    }
  })

  ipcMain.handle(IpcChannels.DB_STATUS, () => {
    try {
      const db = getDatabase()
      const version = db.prepare('SELECT sqlite_version() AS v').get() as {
        v: string
      }
      return {
        connected: true,
        path: getDatabasePath(),
        version: version.v
      }
    } catch {
      return {
        connected: false,
        path: getDatabasePath(),
        version: 'unknown'
      }
    }
  })
}
