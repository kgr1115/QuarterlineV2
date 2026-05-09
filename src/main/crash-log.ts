import { app, dialog } from 'electron'
import { appendFileSync, existsSync, mkdirSync, renameSync, statSync } from 'fs'
import { join } from 'path'
import { getQuarterlineRoot } from './paths'

const MAX_LOG_BYTES = 1_000_000

function getLogsDir(): string {
  return join(getQuarterlineRoot(), 'logs')
}

function getCrashLogPath(): string {
  return join(getLogsDir(), 'crash.log')
}

function rotateIfLarge(path: string): void {
  try {
    if (!existsSync(path)) return
    const size = statSync(path).size
    if (size < MAX_LOG_BYTES) return
    renameSync(path, path + '.1')
  } catch {
    // best-effort rotation
  }
}

export function logCrash(scope: string, error: unknown): string {
  const dir = getLogsDir()
  mkdirSync(dir, { recursive: true })
  const path = getCrashLogPath()
  rotateIfLarge(path)

  const stamp = new Date().toISOString()
  const message = error instanceof Error ? error.stack || error.message : String(error)
  const entry = `[${stamp}] ${scope}\n${message}\n\n`

  try {
    appendFileSync(path, entry, 'utf8')
  } catch {
    // disk full or perms — nothing more we can do here
  }

  return path
}

let dialogShown = false

function showFatalDialog(scope: string, error: unknown, logPath: string): void {
  if (dialogShown) return
  dialogShown = true
  const message = error instanceof Error ? error.message : String(error)
  try {
    dialog.showErrorBox(
      'QuarterlineV2 — unexpected error',
      `${scope}: ${message}\n\nDetails written to:\n${logPath}`
    )
  } catch {
    // dialog may not be ready before app is ready; the log file still exists
  }
}

export function installCrashHandlers(): void {
  process.on('uncaughtException', (err) => {
    const path = logCrash('uncaughtException', err)
    if (app.isReady()) showFatalDialog('Uncaught exception', err, path)
    else console.error('uncaughtException before app ready', err)
  })

  process.on('unhandledRejection', (reason) => {
    const path = logCrash('unhandledRejection', reason)
    if (app.isReady()) showFatalDialog('Unhandled rejection', reason, path)
    else console.error('unhandledRejection before app ready', reason)
  })
}

export function getCrashLogPathForDisplay(): string {
  return getCrashLogPath()
}
