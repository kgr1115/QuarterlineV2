import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannels } from '../shared/ipc-channels'
import type { DbStatusResult, PingResult } from '../shared/ipc-channels'

const api = {
  ping: (): Promise<PingResult> => ipcRenderer.invoke(IpcChannels.PING),
  dbStatus: (): Promise<DbStatusResult> => ipcRenderer.invoke(IpcChannels.DB_STATUS)
}

contextBridge.exposeInMainWorld('quarterline', api)

export type QuarterlineApi = typeof api
