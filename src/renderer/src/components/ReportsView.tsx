import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  ReportExportRow,
  ReportSection
} from '../../../shared/ipc-channels'
import { useWorkspace } from '../state/workspace'

type Mode = 'editor' | 'preview'

const AUTOSAVE_DELAY_MS = 1500

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function ReportsView() {
  const { current } = useWorkspace()
  const [sections, setSections] = useState<ReportSection[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [dirty, setDirty] = useState(false)
  const [mode, setMode] = useState<Mode>('editor')
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [exports, setExports] = useState<ReportExportRow[]>([])
  const [feedback, setFeedback] = useState<
    | { kind: 'idle' }
    | { kind: 'success'; message: string }
    | { kind: 'error'; message: string }
    | { kind: 'busy'; message: string }
  >({ kind: 'idle' })
  const [aiConfigured, setAiConfigured] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [autoSaving, setAutoSaving] = useState(false)
  const autoSaveTimer = useRef<number | null>(null)

  const refresh = useCallback(async () => {
    if (!current) {
      setSections([])
      return
    }
    const [list, exportList, aiCfg] = await Promise.all([
      window.quarterline.reportSections.list(),
      window.quarterline.reportSections.listExports(),
      window.quarterline.ai.getConfig()
    ])
    setSections(list)
    setExports(exportList)
    setAiConfigured(aiCfg.hasKey)
    if (list.length > 0) {
      const next = list.find((s) => s.id === activeId) ?? list[0]
      setActiveId(next.id)
      setDraft(next.narrativeContent)
      setDirty(false)
    } else {
      setActiveId(null)
      setDraft('')
    }
  }, [current, activeId])

  useEffect(() => {
    void refresh()
  }, [current?.id])

  if (!current) {
    return (
      <div className="reports-empty">
        <div className="workspace-empty-card">
          <div className="workspace-empty-eyebrow">Reports</div>
          <div className="workspace-empty-title">Open a workspace</div>
          <div className="workspace-empty-body">
            Reports assemble pinned modules and narrative sections into a PDF
            export. Open or create a workspace to begin.
          </div>
        </div>
      </div>
    )
  }

  const active = sections.find((s) => s.id === activeId) ?? null

  const onSelect = (id: number) => {
    if (dirty) {
      const ok = confirm('Discard unsaved narrative changes?')
      if (!ok) return
    }
    const next = sections.find((s) => s.id === id)
    if (!next) return
    setActiveId(id)
    setDraft(next.narrativeContent)
    setDirty(false)
  }

  const onSaveDraft = async () => {
    if (!active) return
    setFeedback({ kind: 'busy', message: 'Saving narrative…' })
    try {
      await window.quarterline.reportSections.updateNarrative(active.id, draft)
      setDirty(false)
      setLastSavedAt(new Date())
      setFeedback({ kind: 'success', message: 'Narrative saved.' })
      const list = await window.quarterline.reportSections.list()
      setSections(list)
    } catch (err) {
      setFeedback({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Save failed.'
      })
    }
  }

  // Debounced auto-save: 1.5s after last keystroke, persist if dirty.
  useEffect(() => {
    if (!active || !dirty) return
    if (autoSaveTimer.current !== null) {
      window.clearTimeout(autoSaveTimer.current)
    }
    const sectionId = active.id
    const snapshot = draft
    autoSaveTimer.current = window.setTimeout(() => {
      autoSaveTimer.current = null
      setAutoSaving(true)
      window.quarterline.reportSections
        .updateNarrative(sectionId, snapshot)
        .then(() => {
          setDirty(false)
          setLastSavedAt(new Date())
        })
        .catch((err) => {
          setFeedback({
            kind: 'error',
            message: err instanceof Error ? err.message : 'Auto-save failed.'
          })
        })
        .finally(() => setAutoSaving(false))
    }, AUTOSAVE_DELAY_MS)
    return () => {
      if (autoSaveTimer.current !== null) {
        window.clearTimeout(autoSaveTimer.current)
        autoSaveTimer.current = null
      }
    }
  }, [active, dirty, draft])

  // Reset save indicator when switching sections.
  useEffect(() => {
    setLastSavedAt(null)
  }, [activeId])

  const onMove = async (direction: -1 | 1) => {
    if (!active) return
    const idx = sections.findIndex((s) => s.id === active.id)
    const target = idx + direction
    if (target < 0 || target >= sections.length) return
    const next = [...sections]
    const [moved] = next.splice(idx, 1)
    next.splice(target, 0, moved)
    const list = await window.quarterline.reportSections.reorder(
      next.map((s) => s.id)
    )
    setSections(list)
  }

  const onToggleInclude = async (section: ReportSection) => {
    const list = await window.quarterline.reportSections.setIncluded(
      section.id,
      !section.includeInReport
    )
    setSections(list)
  }

  const onDelete = async (section: ReportSection) => {
    if (section.sectionKey.startsWith('custom-') === false) {
      alert('Default sections cannot be deleted; toggle "Include" instead.')
      return
    }
    const ok = confirm(`Delete section "${section.title}"?`)
    if (!ok) return
    const list = await window.quarterline.reportSections.delete(section.id)
    setSections(list)
    if (activeId === section.id) {
      setActiveId(list[0]?.id ?? null)
      setDraft(list[0]?.narrativeContent ?? '')
      setDirty(false)
    }
  }

  const onAddSection = async () => {
    const title = prompt('Section title')
    if (!title || !title.trim()) return
    const list = await window.quarterline.reportSections.addCustom(title.trim())
    setSections(list)
    const newest = list[list.length - 1]
    if (newest) {
      setActiveId(newest.id)
      setDraft(newest.narrativeContent)
      setDirty(false)
    }
  }

  const onGenerateNarrative = async () => {
    if (!active) return
    setFeedback({ kind: 'busy', message: 'Generating narrative with AI…' })
    try {
      const result = await window.quarterline.reportSections.generateNarrative(
        active.id
      )
      if (!result.ok) {
        setFeedback({
          kind: 'error',
          message: result.message ?? 'Generation failed.'
        })
        return
      }
      setDraft(result.markdown ?? '')
      setDirty(false)
      const list = await window.quarterline.reportSections.list()
      setSections(list)
      setFeedback({ kind: 'success', message: 'Narrative generated and saved.' })
    } catch (err) {
      setFeedback({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Generation failed.'
      })
    }
  }

  const onPreview = async () => {
    setMode('preview')
    setPreviewLoading(true)
    try {
      const html = await window.quarterline.reportSections.renderHtml()
      setPreviewHtml(html)
    } finally {
      setPreviewLoading(false)
    }
  }

  const onExport = async () => {
    setFeedback({ kind: 'busy', message: 'Rendering PDF…' })
    try {
      const result = await window.quarterline.reportSections.exportPdf()
      if (!result.ok) {
        setFeedback({
          kind: 'error',
          message: result.message ?? 'Export failed.'
        })
        return
      }
      setFeedback({
        kind: 'success',
        message: `Exported ${result.relativePath} (${formatBytes(result.sizeBytes ?? 0)}).`
      })
      const exportList = await window.quarterline.reportSections.listExports()
      setExports(exportList)
    } catch (err) {
      setFeedback({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Export failed.'
      })
    }
  }

  return (
    <div className="reports-view">
      <aside className="reports-sidebar">
        <div className="reports-sidebar-header">
          <span>Sections</span>
          <button
            type="button"
            className="reports-icon-btn"
            onClick={onAddSection}
            title="Add custom section"
            aria-label="Add custom section"
          >
            +
          </button>
        </div>
        <div className="reports-section-list">
          {sections.map((section, idx) => (
            <button
              key={section.id}
              type="button"
              className={`reports-section-item ${
                activeId === section.id ? 'active' : ''
              } ${section.includeInReport ? '' : 'excluded'}`}
              onClick={() => onSelect(section.id)}
            >
              <span className="reports-section-num">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="reports-section-meta">
                <span className="reports-section-title">{section.title}</span>
                <span className="reports-section-path">
                  {section.narrativePath}
                </span>
              </span>
              <span
                role="button"
                tabIndex={0}
                className={`reports-section-flag ${section.includeInReport ? 'on' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  void onToggleInclude(section)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    void onToggleInclude(section)
                  }
                }}
                title={section.includeInReport ? 'Included' : 'Excluded'}
                aria-label={
                  section.includeInReport
                    ? `Exclude "${section.title}" from report`
                    : `Include "${section.title}" in report`
                }
                aria-pressed={section.includeInReport}
              >
                {section.includeInReport ? '◉' : '○'}
              </span>
            </button>
          ))}
        </div>

        <div className="reports-export-area">
          <button
            type="button"
            className="dialog-btn dialog-btn-primary"
            onClick={onExport}
            disabled={feedback.kind === 'busy'}
          >
            Export PDF
          </button>
          {exports.length > 0 && (
            <div className="reports-export-list">
              <div className="reports-export-list-title">Recent exports</div>
              {exports.slice(0, 5).map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className="reports-export-item"
                  onClick={() =>
                    void window.quarterline.reportSections.openExport(
                      row.relativePath
                    )
                  }
                  title="Open in default viewer"
                >
                  <span className="reports-export-name">
                    {row.relativePath.split('/').pop()}
                  </span>
                  <span className="reports-export-meta">
                    {new Date(row.generatedAt).toLocaleString()} ·{' '}
                    {formatBytes(row.sizeBytes)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      <div className="reports-main">
        <div className="reports-toolbar">
          <div className="reports-toolbar-tabs">
            <button
              type="button"
              className={`reports-tab ${mode === 'editor' ? 'active' : ''}`}
              onClick={() => setMode('editor')}
            >
              Editor
            </button>
            <button
              type="button"
              className={`reports-tab ${mode === 'preview' ? 'active' : ''}`}
              onClick={onPreview}
            >
              Preview
            </button>
          </div>
          {active && mode === 'editor' && (
            <div className="reports-toolbar-actions">
              <button
                type="button"
                className="dialog-btn dialog-btn-secondary"
                onClick={() => onMove(-1)}
                disabled={sections[0]?.id === active.id}
                aria-label="Move section up"
              >
                ↑
              </button>
              <button
                type="button"
                className="dialog-btn dialog-btn-secondary"
                onClick={() => onMove(1)}
                disabled={sections[sections.length - 1]?.id === active.id}
                aria-label="Move section down"
              >
                ↓
              </button>
              {aiConfigured && (
                <button
                  type="button"
                  className="dialog-btn dialog-btn-secondary"
                  onClick={onGenerateNarrative}
                  disabled={feedback.kind === 'busy'}
                >
                  ✦ Generate with AI
                </button>
              )}
              <button
                type="button"
                className="dialog-btn dialog-btn-primary"
                onClick={onSaveDraft}
                disabled={!dirty || feedback.kind === 'busy'}
              >
                {dirty ? 'Save' : 'Saved'}
              </button>
              {active.sectionKey.startsWith('custom-') && (
                <button
                  type="button"
                  className="dialog-btn dialog-btn-secondary"
                  onClick={() => onDelete(active)}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {feedback.kind === 'busy' && (
          <div className="reports-banner reports-banner-info">
            {feedback.message}
          </div>
        )}
        {feedback.kind === 'success' && (
          <div className="reports-banner reports-banner-success">
            {feedback.message}
          </div>
        )}
        {feedback.kind === 'error' && (
          <div className="reports-banner reports-banner-error">
            {feedback.message}
          </div>
        )}

        {mode === 'editor' && active && (
          <div className="reports-editor">
            <div className="reports-editor-meta">
              <strong>{active.title}</strong>
              <span className="reports-editor-path">{active.narrativePath}</span>
              <span className="reports-editor-savestate" aria-live="polite">
                {autoSaving
                  ? 'Saving…'
                  : dirty
                    ? 'Unsaved'
                    : lastSavedAt
                      ? `Saved at ${formatClock(lastSavedAt)}`
                      : ''}
              </span>
            </div>
            <textarea
              className="reports-editor-textarea"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                setDirty(true)
              }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                  e.preventDefault()
                  if (dirty && feedback.kind !== 'busy') {
                    void onSaveDraft()
                  }
                }
              }}
              placeholder="Write the section narrative here. Plain markdown. Ctrl+S to save."
            />
          </div>
        )}

        {mode === 'editor' && !active && (
          <div className="reports-empty-text">
            No sections defined yet. Click + to add a custom section.
          </div>
        )}

        {mode === 'preview' && (
          <div className="reports-preview">
            {previewLoading ? (
              <div className="reports-empty-text">Rendering preview…</div>
            ) : (
              <iframe
                className="reports-preview-frame"
                srcDoc={previewHtml}
                title="Report preview"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
