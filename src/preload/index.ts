import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannels } from '../shared/ipc-channels'
import type {
  DbStatusResult,
  PingResult,
  WindowState,
  Workspace,
  WorkspaceCreateInput
} from '../shared/ipc-channels'

const api = {
  ping: (): Promise<PingResult> => ipcRenderer.invoke(IpcChannels.PING),
  dbStatus: (): Promise<DbStatusResult> => ipcRenderer.invoke(IpcChannels.DB_STATUS),

  workspace: {
    list: (): Promise<Workspace[]> => ipcRenderer.invoke(IpcChannels.WORKSPACE_LIST),
    create: (input: WorkspaceCreateInput): Promise<Workspace> =>
      ipcRenderer.invoke(IpcChannels.WORKSPACE_CREATE, input),
    open: (id: string): Promise<Workspace> =>
      ipcRenderer.invoke(IpcChannels.WORKSPACE_OPEN, id),
    close: (): Promise<null> => ipcRenderer.invoke(IpcChannels.WORKSPACE_CLOSE),
    current: (): Promise<Workspace | null> =>
      ipcRenderer.invoke(IpcChannels.WORKSPACE_CURRENT)
  },

  windowState: {
    get: (): Promise<WindowState | null> =>
      ipcRenderer.invoke(IpcChannels.WINDOW_STATE_GET),
    save: (state: WindowState): Promise<null> =>
      ipcRenderer.invoke(IpcChannels.WINDOW_STATE_SAVE, state)
  }
}

contextBridge.exposeInMainWorld('quarterline', api)

export type QuarterlineApi = typeof api
