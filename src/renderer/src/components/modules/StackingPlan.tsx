import { useEffect, useMemo, useState } from 'react'
import type {
  LeaseRow,
  PropertyRow
} from '../../../../shared/ipc-channels'
import { useWorkspace } from '../../state/workspace'

type FloorCell = {
  tenant: string
  rsf: number | null
  status: 'occupied' | 'vacant' | 'expiring'
  expirationDate: string | null
  walt: number | null
  suite: string | null
}

function statusColorClass(status: FloorCell['status']): string {
  if (status === 'occupied') return 'stacking-cell-occupied'
  if (status === 'expiring') return 'stacking-cell-expiring'
  return 'stacking-cell-vacant'
}

function leaseStatus(lease: LeaseRow, today: Date): FloorCell['status'] {
  const explicit = lease.status?.toLowerCase()
  if (explicit === 'vacant' || explicit === 'available') return 'vacant'
  if (lease.expirationDate) {
    const exp = new Date(lease.expirationDate)
    const monthsOut =
      (exp.getFullYear() - today.getFullYear()) * 12 +
      (exp.getMonth() - today.getMonth())
    if (monthsOut <= 12) return 'expiring'
  }
  return explicit === 'occupied' ? 'occupied' : 'occupied'
}

function monthsBetween(start: Date, end: Date): number {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  )
}

export function StackingPlan() {
  const { current } = useWorkspace()
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [leases, setLeases] = useState<LeaseRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    if (!current) return
    let cancelled = false
    Promise.all([
      window.quarterline.data.listProperties(),
      window.quarterline.data.listLeases(),
      window.quarterline.report.listPins()
    ])
      .then(([p, l, pins]) => {
        if (cancelled) return
        setProperties(p)
        setLeases(l)
        if (p.length > 0 && !p.find((row) => row.id === selectedId)) {
          setSelectedId(p[0].id)
        }
        const propRef = selectedId ?? p[0]?.id
        setPinned(
          !!propRef &&
            pins.some(
              (pin) =>
                pin.moduleType === 'stacking_plan' && pin.moduleRef === propRef
            )
        )
      })
      .catch(() => {
        if (cancelled) return
      })
    return () => {
      cancelled = true
    }
  }, [current?.id, current?.currentQuarter, selectedId])

  const selected = properties.find((p) => p.id === selectedId) ?? null
  const today = useMemo(() => new Date(), [])

  const floors = useMemo(() => {
    if (!selected) return []
    const propLeases = leases.filter((l) => l.propertyId === selected.id)
    const totalFloors = selected.floors ?? Math.max(1, propLeases.length)
    const map = new Map<number, FloorCell[]>()
    for (let i = totalFloors; i >= 1; i--) map.set(i, [])
    for (const l of propLeases) {
      const floor = l.floor ?? 1
      const cell: FloorCell = {
        tenant: l.tenant,
        rsf: l.rsf,
        status: leaseStatus(l, today),
        expirationDate: l.expirationDate,
        walt: l.expirationDate ? monthsBetween(today, new Date(l.expirationDate)) / 12 : null,
        suite: l.suite
      }
      const list = map.get(floor) ?? []
      list.push(cell)
      map.set(floor, list)
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0])
  }, [selected, leases, today])

  if (!current) return null

  const togglePin = async () => {
    if (!selected) return
    const newState = await window.quarterline.report.togglePin(
      'stacking_plan',
      selected.id,
      'leasing-activity'
    )
    setPinned(newState)
  }

  return (
    <div className="module-card stacking-plan-card">
      <div className="module-header">
        <span className="module-title">Property Stacking Plan</span>
        <div className="stacking-plan-actions">
          <select
            className="filter-select"
            value={selectedId ?? ''}
            onChange={(e) => setSelectedId(e.target.value || null)}
          >
            <option value="" disabled>
              Select property
            </option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={`pin-btn ${pinned ? 'on' : ''}`}
            onClick={togglePin}
            disabled={!selected}
          >
            {pinned ? '◉ Pinned' : '○ Pin'}
          </button>
        </div>
      </div>
      <div className="module-body stacking-plan-body">
        {!selected ? (
          <div className="module-placeholder">
            Import property and lease data, then choose a property to render
            its stacking plan.
          </div>
        ) : (
          <>
            <div className="stacking-meta">
              <span>
                {selected.address ?? 'No address'} ·{' '}
                {selected.submarket ?? '—'} ·{' '}
                {selected.propertyClass ?? '—'} ·{' '}
                {selected.rsf?.toLocaleString() ?? '—'} RSF
              </span>
            </div>
            <div className="stacking-grid">
              {floors.map(([floorNum, cells]) => (
                <div key={floorNum} className="stacking-row">
                  <div className="stacking-floor-label">Floor {floorNum}</div>
                  <div className="stacking-cells">
                    {cells.length === 0 ? (
                      <div className="stacking-cell stacking-cell-vacant">
                        <span className="stacking-cell-tenant">Vacant</span>
                      </div>
                    ) : (
                      cells.map((cell, idx) => (
                        <div
                          key={idx}
                          className={`stacking-cell ${statusColorClass(cell.status)}`}
                          title={[
                            cell.tenant,
                            cell.suite ? `Suite ${cell.suite}` : null,
                            cell.rsf ? `${cell.rsf.toLocaleString()} RSF` : null,
                            cell.expirationDate
                              ? `Expires ${cell.expirationDate}`
                              : null,
                            cell.walt !== null
                              ? `WALT ${cell.walt.toFixed(1)} yrs`
                              : null
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        >
                          <span className="stacking-cell-tenant">
                            {cell.tenant}
                          </span>
                          {cell.rsf && (
                            <span className="stacking-cell-rsf">
                              {cell.rsf.toLocaleString()} RSF
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="stacking-legend">
              <span className="stacking-legend-item">
                <span className="legend-swatch swatch-occupied" /> Occupied
              </span>
              <span className="stacking-legend-item">
                <span className="legend-swatch swatch-expiring" /> Expiring &lt;12m
              </span>
              <span className="stacking-legend-item">
                <span className="legend-swatch swatch-vacant" /> Vacant
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
