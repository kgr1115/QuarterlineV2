import { useState } from 'react'
import { useWorkspace } from '../state/workspace'

export function FilterBar() {
  const { current } = useWorkspace()
  const [level, setLevel] = useState<'market' | 'property'>('market')

  const marketLabel = current?.market ?? 'No workspace'
  const quarterLabel = current?.currentQuarter ?? '—'
  const typeLabel = current?.propertyType ?? '—'

  return (
    <div className="filter-bar">
      <div className="filter-segment">
        <button
          className={`filter-segment-btn ${level === 'market' ? 'active' : ''}`}
          onClick={() => setLevel('market')}
        >
          Market Level
        </button>
        <button
          className={`filter-segment-btn ${level === 'property' ? 'active' : ''}`}
          onClick={() => setLevel('property')}
        >
          Property Level
        </button>
      </div>

      <div className="filter-group">
        <span className="filter-label">Market</span>
        <span className="filter-value">{marketLabel}</span>
      </div>

      <div className="filter-group">
        <span className="filter-label">Quarter</span>
        <span className="filter-value">{quarterLabel}</span>
      </div>

      <div className="filter-group">
        <span className="filter-label">Type</span>
        <span className="filter-value">{typeLabel}</span>
      </div>

      <div className="filter-spacer" />
    </div>
  )
}
