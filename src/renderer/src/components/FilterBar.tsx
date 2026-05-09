import { useState } from 'react'

export function FilterBar() {
  const [level, setLevel] = useState<'market' | 'property'>('market')

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
        <select className="filter-select" defaultValue="">
          <option value="" disabled>
            Select market
          </option>
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-label">Quarter</span>
        <select className="filter-select" defaultValue="">
          <option value="" disabled>
            Select quarter
          </option>
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-label">Type</span>
        <select className="filter-select" defaultValue="">
          <option value="" disabled>
            Property type
          </option>
        </select>
      </div>

      <div className="filter-spacer" />
    </div>
  )
}
