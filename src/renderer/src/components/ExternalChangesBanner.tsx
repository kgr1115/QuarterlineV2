import { useCallback, useEffect, useState } from 'react'
import type { ExternalChange } from '../../../shared/ipc-channels'
import { useWorkspace } from '../state/workspace'

export function ExternalChangesBanner() {
  const { current } = useWorkspace()
  const [changes, setChanges] = useState<ExternalChange[]>([])
  const [open, setOpen] = useState(false)
  const [scanning, setScanning] = useState(false)

  const scan = useCallback(async () => {
    if (!current) return
    setScanning(true)
    try {
      const result = await window.quarterline.bridge.scanChanges()
      setChanges(result.changes)
    } catch {
      setChanges([])
    } finally {
      setScanning(false)
    }
  }, [current])

  useEffect(() => {
    void scan()
  }, [scan])

  useEffect(() => {
    if (!current) return
    const onFocus = () => {
      void scan()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [current, scan])

  if (!current || changes.length === 0) return null

  const counts = changes.reduce(
    (acc, c) => {
      acc[c.status]++
      return acc
    },
    { created: 0, modified: 0, deleted: 0 } as Record<
      ExternalChange['status'],
      number
    >
  )

  const onAck = async () => {
    await window.quarterline.bridge.ackChanges()
    setChanges([])
    setOpen(false)
  }

  return (
    <div className="external-changes-banner">
      <div className="external-changes-summary">
        <span className="external-changes-icon">⤓</span>
        <span>
          External changes detected in narratives/ or notes/:{' '}
          <strong>{counts.created}</strong> new,{' '}
          <strong>{counts.modified}</strong> modified,{' '}
          <strong>{counts.deleted}</strong> deleted.
        </span>
        <button
          type="button"
          className="external-changes-btn"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Hide' : 'Review'}
        </button>
        <button
          type="button"
          className="external-changes-btn external-changes-btn-primary"
          onClick={onAck}
          disabled={scanning}
        >
          Acknowledge all
        </button>
      </div>
      {open && (
        <div className="external-changes-list">
          {changes.map((change) => (
            <div key={change.relativePath} className="external-change-item">
              <div className="external-change-header">
                <span className={`external-change-status status-${change.status}`}>
                  {change.status}
                </span>
                <span className="external-change-path">{change.relativePath}</span>
                <span className="external-change-meta">
                  {new Date(change.modifiedAt).toLocaleString()} ·{' '}
                  {change.sizeBytes} bytes
                </span>
              </div>
              {change.preview && (
                <pre className="external-change-preview">{change.preview}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
