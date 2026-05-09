import type { DbStatusResult, PingResult } from '../shared/ipc-channels'

declare global {
  interface Window {
    quarterline: {
      ping: () => Promise<PingResult>
      dbStatus: () => Promise<DbStatusResult>
    }
  }
}
