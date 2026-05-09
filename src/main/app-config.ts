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

export type Preferences = {
  defaultMarket: string | null
  defaultPropertyType: string | null
}

export type AppConfig = {
  lastWorkspaceId: string | null
  lastRoute: string | null
  windowState: WindowState | null
  ai: AiStoredConfig | null
  preferences: Preferences
}

const DEFAULT_PREFERENCES: Preferences = {
  defaultMarket: null,
  defaultPropertyType: null
}

const DEFAULT_CONFIG: AppConfig = {
  lastWorkspaceId: null,
  lastRoute: null,
  windowState: null,
  ai: null,
  preferences: { ...DEFAULT_PREFERENCES }
}

export function readAppConfig(): AppConfig {
  const path = getAppConfigPath()
  if (!existsSync(path)) return { ...DEFAULT_CONFIG, preferences: { ...DEFAULT_PREFERENCES } }
  try {
    const raw = readFileSync(path, 'utf8')
    const parsed = JSON.parse(raw) as Partial<AppConfig>
    return {
      lastWorkspaceId: parsed.lastWorkspaceId ?? null,
      lastRoute: parsed.lastRoute ?? null,
      windowState: parsed.windowState ?? null,
      ai: parsed.ai ?? null,
      preferences: {
        defaultMarket: parsed.preferences?.defaultMarket ?? null,
        defaultPropertyType: parsed.preferences?.defaultPropertyType ?? null
      }
    }
  } catch {
    return { ...DEFAULT_CONFIG, preferences: { ...DEFAULT_PREFERENCES } }
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
