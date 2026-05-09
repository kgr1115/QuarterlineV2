import { WorkspaceSwitcher } from './WorkspaceSwitcher'

const navItems = [
  { id: 'portfolio', label: 'Portfolio', section: 'research' },
  { id: 'assets', label: 'Assets', section: 'research' },
  { id: 'market-intel', label: 'Market Intelligence', section: 'research' },
  { id: 'reports', label: 'Reports', section: 'output' },
  { id: 'scenarios', label: 'Scenarios', section: 'analysis' },
  { id: 'data-studio', label: 'Data Studio', section: 'analysis' },
  { id: 'watchlist', label: 'Watchlist', section: 'monitor' },
  { id: 'alerts', label: 'Alerts', section: 'monitor' },
  { id: 'settings', label: 'Settings', section: 'system' }
] as const

export type RouteId = (typeof navItems)[number]['id']

const sections: Record<string, string> = {
  research: 'Research',
  output: 'Output',
  analysis: 'Analysis',
  monitor: 'Monitor',
  system: 'System'
}

type Props = {
  activeRoute: RouteId
  onRouteChange: (route: RouteId) => void
  onCreateWorkspace: () => void
}

export function Sidebar({ activeRoute, onRouteChange, onCreateWorkspace }: Props) {
  const grouped = Object.entries(sections).map(([key, label]) => ({
    label,
    items: navItems.filter((item) => item.section === key)
  }))

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">Q</div>
        <span className="sidebar-title">QuarterlineV2</span>
      </div>

      <div className="sidebar-workspace">
        <WorkspaceSwitcher onCreate={onCreateWorkspace} />
      </div>

      <div className="sidebar-nav">
        {grouped.map((group) => (
          <div key={group.label}>
            <div className="nav-section-label">{group.label}</div>
            {group.items.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${activeRoute === item.id ? 'active' : ''}`}
                onClick={() => onRouteChange(item.id)}
              >
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </nav>
  )
}
