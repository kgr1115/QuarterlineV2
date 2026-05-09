import { useEffect, useState } from 'react'
import type {
  AiConfigPublic,
  AiConnectionResult,
  AppInfo
} from '../../../shared/ipc-channels'

const MODELS = [
  { id: 'claude-opus-4-7', label: 'Claude Opus 4.7 (recommended)' },
  { id: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (faster)' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (fastest)' }
]

export function SettingsView() {
  const [config, setConfig] = useState<AiConfigPublic | null>(null)
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState(MODELS[0].id)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<
    | { kind: 'idle' }
    | { kind: 'saved' }
    | { kind: 'tested'; result: AiConnectionResult }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' })

  useEffect(() => {
    let cancelled = false
    window.quarterline.ai
      .getConfig()
      .then((cfg) => {
        if (cancelled) return
        setConfig(cfg)
        setModel(cfg.model || MODELS[0].id)
      })
      .catch(() => {})
    window.quarterline.app
      .getInfo()
      .then((info) => {
        if (cancelled) return
        setAppInfo(info)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const onSave = async () => {
    if (busy) return
    setBusy(true)
    setFeedback({ kind: 'idle' })
    try {
      const cfg = await window.quarterline.ai.saveConfig({
        provider: 'anthropic',
        apiKey: apiKey || null,
        model
      })
      setConfig(cfg)
      setApiKey('')
      setFeedback({ kind: 'saved' })
    } catch (err) {
      setFeedback({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Could not save config.'
      })
    } finally {
      setBusy(false)
    }
  }

  const onTest = async () => {
    if (busy) return
    setBusy(true)
    setFeedback({ kind: 'idle' })
    try {
      const result = await window.quarterline.ai.testConnection()
      setFeedback({ kind: 'tested', result })
    } finally {
      setBusy(false)
    }
  }

  const onClear = async () => {
    if (busy) return
    setBusy(true)
    try {
      const cfg = await window.quarterline.ai.clearConfig()
      setConfig(cfg)
      setApiKey('')
      setFeedback({ kind: 'idle' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="settings-view">
      <div className="settings-section">
        <h2 className="settings-title">AI Provider</h2>
        <p className="settings-help">
          QuarterlineV2 can call an AI provider to generate synthesis cards
          and narrative drafts from imported workspace data. The API key is
          encrypted using the OS keychain via Electron's <code>safeStorage</code>;
          it never lands in plaintext in <code>~/.quarterline/config.json</code>.
        </p>

        {config && !config.encryptionAvailable && (
          <div className="settings-banner settings-banner-error">
            Secure storage is unavailable on this system. AI provider cannot
            be configured here. You can still use the external AI bridge by
            pointing tools like Claude Desktop at the workspace folder.
          </div>
        )}

        <div className="settings-status">
          <div>
            <span className="settings-label">Provider</span>
            <span className="settings-value">
              {config?.provider ?? 'Anthropic (default)'}
            </span>
          </div>
          <div>
            <span className="settings-label">Key configured</span>
            <span className="settings-value">
              {config?.hasKey ? '◉ Yes (encrypted)' : '○ No'}
            </span>
          </div>
          <div>
            <span className="settings-label">Active model</span>
            <span className="settings-value">{config?.model ?? '—'}</span>
          </div>
        </div>

        <div className="settings-form">
          <label className="dialog-field">
            <span className="dialog-label">API key</span>
            <input
              type="password"
              className="dialog-input"
              placeholder={
                config?.hasKey ? '•••••••••••••• (leave blank to keep)' : 'sk-ant-…'
              }
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={!config?.encryptionAvailable}
            />
          </label>
          <label className="dialog-field">
            <span className="dialog-label">Model</span>
            <select
              className="dialog-input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!config?.encryptionAvailable}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <div className="settings-actions">
            <button
              type="button"
              className="dialog-btn dialog-btn-primary"
              onClick={onSave}
              disabled={busy || !config?.encryptionAvailable}
            >
              {busy ? 'Saving…' : 'Save settings'}
            </button>
            <button
              type="button"
              className="dialog-btn dialog-btn-secondary"
              onClick={onTest}
              disabled={busy || !config?.hasKey}
            >
              Test connection
            </button>
            {config?.hasKey && (
              <button
                type="button"
                className="dialog-btn dialog-btn-secondary"
                onClick={onClear}
                disabled={busy}
              >
                Clear key
              </button>
            )}
          </div>
        </div>

        {feedback.kind === 'saved' && (
          <div className="settings-banner settings-banner-success">
            Saved.
          </div>
        )}
        {feedback.kind === 'tested' && feedback.result.ok && (
          <div className="settings-banner settings-banner-success">
            Connection OK — provider responded successfully.
          </div>
        )}
        {feedback.kind === 'tested' && !feedback.result.ok && (
          <div className="settings-banner settings-banner-error">
            Test failed: {feedback.result.message}
          </div>
        )}
        {feedback.kind === 'error' && (
          <div className="settings-banner settings-banner-error">
            {feedback.message}
          </div>
        )}
      </div>

      <div className="settings-section">
        <h2 className="settings-title">External AI Bridge</h2>
        <p className="settings-help">
          The workspace folder is structured so external AI tools (Claude
          Desktop, Codex, or any agent that can read a folder) can read the
          imported data and write to <code>narratives/</code> and{' '}
          <code>notes/</code>. See <code>WORKSPACE.md</code> in the workspace
          folder for the contract. When external tools modify those files, the
          app detects the change and offers to import it from the Portfolio
          view.
        </p>
      </div>

      <div className="settings-section">
        <h2 className="settings-title">About</h2>
        <p className="settings-help">
          Application metadata and where workspace files live on disk.
        </p>
        {appInfo ? (
          <div className="settings-grid">
            <div className="settings-grid-key">App version</div>
            <div className="settings-grid-value">{appInfo.appVersion}</div>
            <div className="settings-grid-key">Electron</div>
            <div className="settings-grid-value">{appInfo.electronVersion}</div>
            <div className="settings-grid-key">Node</div>
            <div className="settings-grid-value">{appInfo.nodeVersion}</div>
            <div className="settings-grid-key">Chromium</div>
            <div className="settings-grid-value">{appInfo.chromeVersion}</div>
            <div className="settings-grid-key">Workspaces folder</div>
            <div className="settings-grid-value">{appInfo.workspacesRoot}</div>
            <div className="settings-grid-key">Crash log</div>
            <div className="settings-grid-value">{appInfo.logsPath}</div>
          </div>
        ) : (
          <div className="settings-help">Loading…</div>
        )}
        <div className="settings-actions">
          <button
            type="button"
            className="dialog-btn dialog-btn-secondary"
            onClick={() => void window.quarterline.app.openQuarterlineFolder()}
            disabled={!appInfo}
          >
            Open workspaces folder
          </button>
          <button
            type="button"
            className="dialog-btn dialog-btn-secondary"
            onClick={() => void window.quarterline.app.openLogFolder()}
            disabled={!appInfo}
          >
            Open log folder
          </button>
        </div>
      </div>
    </div>
  )
}
