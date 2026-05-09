import { app } from 'electron'
import { autoUpdater } from 'electron-updater'
import { logCrash } from './crash-log'

export type UpdateState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'available'; version: string }
  | { kind: 'not-available' }
  | { kind: 'downloaded'; version: string }
  | { kind: 'error'; message: string }
  | { kind: 'disabled'; reason: string }

let state: UpdateState = { kind: 'idle' }

export function getUpdateState(): UpdateState {
  return state
}

export function initAutoUpdater(): void {
  if (!app.isPackaged) {
    state = { kind: 'disabled', reason: 'Auto-update disabled in development' }
    return
  }
  if (process.env.QUARTERLINE_DISABLE_AUTO_UPDATE === '1') {
    state = { kind: 'disabled', reason: 'Disabled via QUARTERLINE_DISABLE_AUTO_UPDATE' }
    return
  }

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    state = { kind: 'checking' }
  })
  autoUpdater.on('update-available', (info) => {
    state = { kind: 'available', version: info?.version ?? 'unknown' }
  })
  autoUpdater.on('update-not-available', () => {
    state = { kind: 'not-available' }
  })
  autoUpdater.on('update-downloaded', (info) => {
    state = { kind: 'downloaded', version: info?.version ?? 'unknown' }
  })
  autoUpdater.on('error', (err) => {
    state = { kind: 'error', message: err?.message ?? String(err) }
    logCrash('auto-updater', err)
  })

  try {
    void autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      state = { kind: 'error', message: err?.message ?? String(err) }
      logCrash('auto-updater.check', err)
    })
  } catch (err) {
    state = { kind: 'error', message: err instanceof Error ? err.message : String(err) }
    logCrash('auto-updater.init', err)
  }
}
