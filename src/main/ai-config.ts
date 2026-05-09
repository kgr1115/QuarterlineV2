import { safeStorage } from 'electron'
import { readAppConfig, updateAppConfig } from './app-config'

export type AiProvider = 'anthropic'

export type AiConfigPublic = {
  provider: AiProvider | null
  hasKey: boolean
  model: string
  encryptionAvailable: boolean
}

export type AiConfigInput = {
  provider: AiProvider
  apiKey: string | null
  model?: string
}

const DEFAULT_MODEL = 'claude-opus-4-7'

export function isEncryptionAvailable(): boolean {
  return safeStorage.isEncryptionAvailable()
}

export function readAiConfig(): AiConfigPublic {
  const cfg = readAppConfig().ai
  return {
    provider: cfg?.provider ?? null,
    hasKey: !!cfg?.encryptedApiKey,
    model: cfg?.model ?? DEFAULT_MODEL,
    encryptionAvailable: isEncryptionAvailable()
  }
}

export function writeAiConfig(input: AiConfigInput): AiConfigPublic {
  if (!isEncryptionAvailable()) {
    throw new Error(
      'Secure storage is unavailable on this system; AI provider cannot be configured.'
    )
  }
  const next = {
    provider: input.provider,
    encryptedApiKey: input.apiKey
      ? safeStorage.encryptString(input.apiKey).toString('base64')
      : null,
    model: input.model ?? DEFAULT_MODEL
  }
  updateAppConfig({ ai: next })
  return readAiConfig()
}

export function clearAiConfig(): AiConfigPublic {
  updateAppConfig({ ai: null })
  return readAiConfig()
}

export function getDecryptedApiKey(): string | null {
  const cfg = readAppConfig().ai
  if (!cfg?.encryptedApiKey) return null
  if (!isEncryptionAvailable()) return null
  try {
    const buf = Buffer.from(cfg.encryptedApiKey, 'base64')
    return safeStorage.decryptString(buf)
  } catch {
    return null
  }
}

export function getActiveProvider(): { provider: AiProvider; model: string } | null {
  const cfg = readAppConfig().ai
  if (!cfg?.provider || !cfg.encryptedApiKey) return null
  return {
    provider: cfg.provider,
    model: cfg.model ?? DEFAULT_MODEL
  }
}
