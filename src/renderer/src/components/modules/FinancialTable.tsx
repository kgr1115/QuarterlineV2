import { useEffect, useState } from 'react'
import type {
  MarketStatRow,
  SubmarketStatRow
} from '../../../../shared/ipc-channels'
import { useWorkspace } from '../../state/workspace'

type Mode = 'class' | 'submarket'

function fmtNum(value: number | null, digits = 1): string {
  if (value === null || value === undefined) return '—'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
}

function fmtInt(value: number | null): string {
  if (value === null || value === undefined) return '—'
  if (value < 0) return `(${Math.abs(value).toLocaleString('en-US')})`
  return value.toLocaleString('en-US')
}

function fmtRate(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return `$${value.toFixed(2)}`
}

export function FinancialTable() {
  const { current } = useWorkspace()
  const [mode, setMode] = useState<Mode>('class')
  const [marketRows, setMarketRows] = useState<MarketStatRow[]>([])
  const [submarketRows, setSubmarketRows] = useState<SubmarketStatRow[]>([])
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    if (!current) return
    let cancelled = false
    Promise.all([
      window.quarterline.data.listMarketStats(),
      window.quarterline.data.listSubmarketStats(),
      window.quarterline.report.listPins()
    ])
      .then(([m, s, pins]) => {
        if (cancelled) return
        setMarketRows(m)
        setSubmarketRows(s)
        setPinned(
          pins.some(
            (p) => p.moduleType === 'financial_table' && p.moduleRef === mode
          )
        )
      })
      .catch(() => {
        if (cancelled) return
      })
    return () => {
      cancelled = true
    }
  }, [current?.id, current?.currentQuarter, mode])

  if (!current) return null

  const togglePin = async () => {
    const newState = await window.quarterline.report.togglePin(
      'financial_table',
      mode,
      'statistics'
    )
    setPinned(newState)
  }

  const totals = (() => {
    if (mode === 'class') {
      const r = marketRows
      const totalNRA = r.reduce(
        (s, x) => s + (x.netRentableArea_MSF ?? 0),
        0
      )
      const wAvg = (key: keyof MarketStatRow): number | null => {
        const num = r.reduce((s, x) => {
          const w = x.netRentableArea_MSF ?? 0
          const v = (x[key] as number | null) ?? null
          return v == null ? s : s + v * w
        }, 0)
        return totalNRA > 0 ? num / totalNRA : null
      }
      return {
        nra: totalNRA || null,
        vacancy: wAvg('totalVacancy_pct'),
        availability: wAvg('totalAvailability_pct'),
        directAvail: wAvg('directAvailability_pct'),
        subleaseAvail: wAvg('subleaseAvailability_pct'),
        askingRate: wAvg('avgDirectAskingRate_dollarsSF'),
        qtrAbs: r.reduce(
          (s, x) => s + (x.currentQuarterNetAbsorption_SF ?? 0),
          0
        ),
        ytdAbs: r.reduce((s, x) => s + (x.ytdNetAbsorption_SF ?? 0), 0),
        deliveries: r.reduce((s, x) => s + (x.deliveries_SF ?? 0), 0),
        underConstruction: r.reduce(
          (s, x) => s + (x.underConstruction_SF ?? 0),
          0
        )
      }
    }
    const r = submarketRows
    const totalNRA = r.reduce(
      (s, x) => s + (x.netRentableArea_MSF ?? 0),
      0
    )
    const wAvg = (key: keyof SubmarketStatRow): number | null => {
      const num = r.reduce((s, x) => {
        const w = x.netRentableArea_MSF ?? 0
        const v = (x[key] as number | null) ?? null
        return v == null ? s : s + v * w
      }, 0)
      return totalNRA > 0 ? num / totalNRA : null
    }
    return {
      nra: totalNRA || null,
      vacancy: wAvg('totalVacancy_pct'),
      availability: wAvg('totalAvailability_pct'),
      directAvail: wAvg('directAvailability_pct'),
      subleaseAvail: wAvg('subleaseAvailability_pct'),
      askingRate: wAvg('avgDirectAskingRate_dollarsSF'),
      qtrAbs: r.reduce(
        (s, x) => s + (x.currentQuarterNetAbsorption_SF ?? 0),
        0
      ),
      ytdAbs: r.reduce((s, x) => s + (x.ytdNetAbsorption_SF ?? 0), 0),
      deliveries: r.reduce((s, x) => s + (x.deliveries_SF ?? 0), 0),
      underConstruction: r.reduce(
        (s, x) => s + (x.underConstruction_SF ?? 0),
        0
      )
    }
  })()

  const rowCount = mode === 'class' ? marketRows.length : submarketRows.length

  return (
    <div className="module-card financial-table-card">
      <div className="module-header">
        <span className="module-title">
          Market Statistics by{' '}
          {mode === 'class' ? 'Class' : 'Submarket'}
        </span>
        <div className="financial-table-actions">
          <div className="filter-segment">
            <button
              className={`filter-segment-btn ${mode === 'class' ? 'active' : ''}`}
              onClick={() => setMode('class')}
            >
              By Class
            </button>
            <button
              className={`filter-segment-btn ${mode === 'submarket' ? 'active' : ''}`}
              onClick={() => setMode('submarket')}
            >
              By Submarket
            </button>
          </div>
          <button
            type="button"
            className={`pin-btn ${pinned ? 'on' : ''}`}
            onClick={togglePin}
            title={pinned ? 'Unpin from report' : 'Pin to report'}
          >
            {pinned ? '◉ Pinned' : '○ Pin'}
          </button>
        </div>
      </div>
      <div className="module-body financial-table-body">
        {rowCount === 0 ? (
          <div className="module-placeholder">
            No statistics imported yet for {current.currentQuarter}.
          </div>
        ) : (
          <div className="financial-table-wrap">
            <table className="data-table financial-table">
              <thead>
                <tr>
                  <th>{mode === 'class' ? 'Class' : 'Submarket'}</th>
                  {mode === 'class' && <th>Subclass</th>}
                  <th>NRA (MSF)</th>
                  <th>Vacancy</th>
                  <th>Total Avail.</th>
                  <th>Direct Avail.</th>
                  <th>Sublease</th>
                  <th>Asking Rate</th>
                  <th>Qtr Abs. (SF)</th>
                  <th>YTD Abs. (SF)</th>
                  <th>Deliv. (SF)</th>
                  <th>U/C (SF)</th>
                </tr>
              </thead>
              <tbody>
                {mode === 'class'
                  ? marketRows.map((r) => (
                      <tr key={r.id}>
                        <td>{r.propertyClass}</td>
                        <td>{r.subclass ?? '—'}</td>
                        <td className="num">{fmtNum(r.netRentableArea_MSF, 2)}</td>
                        <td className="num">{fmtNum(r.totalVacancy_pct)}%</td>
                        <td className="num">{fmtNum(r.totalAvailability_pct)}%</td>
                        <td className="num">{fmtNum(r.directAvailability_pct)}%</td>
                        <td className="num">{fmtNum(r.subleaseAvailability_pct)}%</td>
                        <td className="num">{fmtRate(r.avgDirectAskingRate_dollarsSF)}</td>
                        <td className="num">{fmtInt(r.currentQuarterNetAbsorption_SF)}</td>
                        <td className="num">{fmtInt(r.ytdNetAbsorption_SF)}</td>
                        <td className="num">{fmtInt(r.deliveries_SF)}</td>
                        <td className="num">{fmtInt(r.underConstruction_SF)}</td>
                      </tr>
                    ))
                  : submarketRows.map((r) => (
                      <tr key={r.id}>
                        <td>{r.submarket}</td>
                        <td className="num">{fmtNum(r.netRentableArea_MSF, 2)}</td>
                        <td className="num">{fmtNum(r.totalVacancy_pct)}%</td>
                        <td className="num">{fmtNum(r.totalAvailability_pct)}%</td>
                        <td className="num">{fmtNum(r.directAvailability_pct)}%</td>
                        <td className="num">{fmtNum(r.subleaseAvailability_pct)}%</td>
                        <td className="num">{fmtRate(r.avgDirectAskingRate_dollarsSF)}</td>
                        <td className="num">{fmtInt(r.currentQuarterNetAbsorption_SF)}</td>
                        <td className="num">{fmtInt(r.ytdNetAbsorption_SF)}</td>
                        <td className="num">{fmtInt(r.deliveries_SF)}</td>
                        <td className="num">{fmtInt(r.underConstruction_SF)}</td>
                      </tr>
                    ))}
              </tbody>
              <tfoot>
                <tr className="financial-table-totals">
                  <td>Total / Wtd. Avg.</td>
                  {mode === 'class' && <td></td>}
                  <td className="num">{fmtNum(totals.nra, 2)}</td>
                  <td className="num">{fmtNum(totals.vacancy)}%</td>
                  <td className="num">{fmtNum(totals.availability)}%</td>
                  <td className="num">{fmtNum(totals.directAvail)}%</td>
                  <td className="num">{fmtNum(totals.subleaseAvail)}%</td>
                  <td className="num">{fmtRate(totals.askingRate)}</td>
                  <td className="num">{fmtInt(totals.qtrAbs)}</td>
                  <td className="num">{fmtInt(totals.ytdAbs)}</td>
                  <td className="num">{fmtInt(totals.deliveries)}</td>
                  <td className="num">{fmtInt(totals.underConstruction)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
