import type {
  DbStatusResult,
  PingResult,
  WindowState,
  Workspace,
  WorkspaceCreateInput
} from '../shared/ipc-channels'

declare global {
  interface Window {
    quarterline: {
      ping: () => Promise<PingResult>
      dbStatus: () => Promise<DbStatusResult>
      workspace: {
        list: () => Promise<Workspace[]>
        create: (input: WorkspaceCreateInput) => Promise<Workspace>
        open: (id: string) => Promise<Workspace>
        close: () => Promise<null>
        current: () => Promise<Workspace | null>
      }
      windowState: {
        get: () => Promise<WindowState | null>
        save: (state: WindowState) => Promise<null>
      }
    }
  }
}
