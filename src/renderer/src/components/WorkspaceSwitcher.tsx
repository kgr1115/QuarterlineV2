import { useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../state/workspace'

type Props = {
  onCreate: () => void
}

export function WorkspaceSwitcher({ onCreate }: Props) {
  const { current, list, open, close } = useWorkspace()
  const [openMenu, setOpenMenu] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openMenu) return
    function onDoc(event: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) setOpenMenu(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [openMenu])

  const label = current ? current.name : 'No workspace open'
  const subtitle = current
    ? `${current.market} · ${current.currentQuarter}`
    : 'Create or open a workspace to begin'

  return (
    <div className="workspace-switcher" ref={containerRef}>
      <button
        type="button"
        className="workspace-switcher-trigger"
        onClick={() => setOpenMenu((v) => !v)}
      >
        <span className="workspace-switcher-label">
          <span className="workspace-switcher-name">{label}</span>
          <span className="workspace-switcher-meta">{subtitle}</span>
        </span>
        <span className="workspace-switcher-chevron">{openMenu ? '▴' : '▾'}</span>
      </button>

      {openMenu && (
        <div className="workspace-switcher-menu">
          {list.length === 0 ? (
            <div className="workspace-switcher-empty">No workspaces yet</div>
          ) : (
            <div className="workspace-switcher-list">
              {list.map((ws) => (
                <button
                  key={ws.id}
                  type="button"
                  className={`workspace-switcher-item ${
                    current?.id === ws.id ? 'active' : ''
                  }`}
                  onClick={() => {
                    setOpenMenu(false)
                    void open(ws.id)
                  }}
                >
                  <span className="workspace-switcher-item-name">{ws.name}</span>
                  <span className="workspace-switcher-item-meta">
                    {ws.market} · {ws.currentQuarter}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="workspace-switcher-divider" />

          <button
            type="button"
            className="workspace-switcher-action"
            onClick={() => {
              setOpenMenu(false)
              onCreate()
            }}
          >
            + New workspace
          </button>
          {current && (
            <button
              type="button"
              className="workspace-switcher-action"
              onClick={() => {
                setOpenMenu(false)
                void close()
              }}
            >
              Close current workspace
            </button>
          )}
        </div>
      )}
    </div>
  )
}
