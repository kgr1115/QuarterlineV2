import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import { getAppConfigPath, getQuarterlineRoot } from './paths'

export type WindowState = {
  width: number
  height: number
  x?: number
  y?: number
  isMaximized: boolean
}

export type AiStoredConfig = {
  provider: 'anthropic'
  encryptedApiKey: string | null
  model: string
}

export type AppConfig = {
  lastWorkspaceId: string | null
  windowState: WindowState | null
  ai: AiStoredConfig | null
}

const DEFAULT_CONFIG: AppConfig = {
  lastWorkspaceId: null,
  windowState: null,
  ai: null
}

export function readAppConfig(): AppConfig {
  const path = getAppConfigPath()
  if (!existsSync(path)) return { ...DEFAULT_CONFIG }
  try {
    const raw = readFileSync(path, 'utf8')
    const parsed = JSON.parse(raw) as Partial<AppConfig>
    return {
      lastWorkspaceId: parsed.lastWorkspaceId ?? null,
      windowState: parsed.windowState ?? null,
      ai: parsed.ai ?? null
    }
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export function writeAppConfig(config: AppConfig): void {
  mkdirSync(getQuarterlineRoot(), { recursive: true })
  const path = getAppConfigPath()
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(config, null, 2), 'utf8')
}

export function updateAppConfig(patch: Partial<AppConfig>): AppConfig {
  const current = readAppConfig()
  const next = { ...current, ...patch }
  writeAppConfig(next)
  return next
}
