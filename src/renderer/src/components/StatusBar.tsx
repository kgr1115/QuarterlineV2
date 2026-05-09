import { useEffect, useState } from 'react'

export function StatusBar() {
  const [dbConnected, setDbConnected] = useState(false)
  const [dbVersion, setDbVersion] = useState('')

  useEffect(() => {
    window.quarterline.dbStatus().then((status) => {
      setDbConnected(status.connected)
      setDbVersion(status.version)
    })
  }, [])

  return (
    <div className="status-bar">
      <span className="status-segment">No workspace open</span>
      <span className="status-spacer" />
      <span className="status-segment">
        <span className={`status-dot ${dbConnected ? '' : 'disconnected'}`} />
        {dbConnected ? `SQLite ${dbVersion}` : 'Database disconnected'}
      </span>
    </div>
  )
}
