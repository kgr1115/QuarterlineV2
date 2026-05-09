import { useEffect, useState } from 'react'
import { useWorkspace } from '../state/workspace'

export function StatusBar() {
  const { current } = useWorkspace()
  const [dbConnected, setDbConnected] = useState(false)
  const [dbVersion, setDbVersion] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    window.quarterline
      .dbStatus()
      .then((status) => {
        if (cancelled) return
        setDbConnected(status.connected)
        setDbVersion(status.version)
      })
      .catch(() => {
        if (cancelled) return
        setDbConnected(false)
        setDbVersion(null)
      })
    return () => {
      cancelled = true
    }
  }, [current?.id])

  const workspaceLabel = current ? current.name : 'No workspace open'
  const dbLabel =
    dbConnected && dbVersion
      ? `SQLite ${dbVersion}`
      : current
        ? 'Database loading…'
        : 'Database idle'

  return (
    <div className="status-bar">
      <span className="status-segment">{workspaceLabel}</span>
      {current && (
        <span className="status-segment status-segment-muted">
          {current.market} · {current.currentQuarter} · {current.propertyType}
        </span>
      )}
      <span className="status-spacer" />
      <span className="status-segment">
        <span className={`status-dot ${dbConnected ? '' : 'disconnected'}`} />
        {dbLabel}
      </span>
    </div>
  )
}
