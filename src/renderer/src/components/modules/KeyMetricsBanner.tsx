import { useEffect, useState } from 'react'
import type { HeadlineMetrics } from '../../../../shared/ipc-channels'
import { useWorkspace } from '../../state/workspace'

function formatPct(value: number | null): string {
  if (value === null) return '—'
  return `${value.toFixed(1)}%`
}

function formatRate(value: number | null): string {
  if (value === null) return '—'
  return `$${value.toFixed(2)}`
}

function formatSf(value: number | null, abbrev = false): string {
  if (value === null) return '—'
  if (abbrev) {
    if (Math.abs(value) >= 1_000_000)
      return `${(value / 1_000_000).toFixed(1)}M`
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  }
  if (value < 0) return `(${Math.abs(value).toLocaleString('en-US')})`
  return value.toLocaleString('en-US')
}

function arrowFor(value: number | null): string {
  if (value === null) return '·'
  if (value > 0) return '▲'
  if (value < 0) return '▼'
  return '·'
}

function arrowClass(value: number | null): string {
  if (value === null) return 'metric-arrow'
  if (value > 0) return 'metric-arrow up'
  if (value < 0) return 'metric-arrow down'
  return 'metric-arrow'
}

export function KeyMetricsBanner() {
  const { current } = useWorkspace()
  const [metrics, setMetrics] = useState<HeadlineMetrics | null>(null)

  useEffect(() => {
    if (!current) {
      setMetrics(null)
      return
    }
    let cancelled = false
    window.quarterline.analysis
      .headlineMetrics()
      .then((m) => {
        if (!cancelled) setMetrics(m)
      })
      .catch(() => {
        if (!cancelled) setMetrics(null)
      })
    return () => {
      cancelled = true
    }
  }, [current?.id, current?.currentQuarter])

  if (!current) return null

  const items: { label: string; value: string; arrow: string; arrowClass: string }[] = [
    {
      label: 'Availability Rate',
      value: formatPct(metrics?.availabilityRate_pct ?? null),
      arrow: arrowFor(metrics?.availabilityRate_pct ?? null),
      arrowClass: 'metric-arrow'
    },
    {
      label: 'Net Absorption',
      value: `${formatSf(metrics?.netAbsorption_SF ?? null, true)} SF`,
      arrow: arrowFor(metrics?.netAbsorption_SF ?? null),
      arrowClass: arrowClass(metrics?.netAbsorption_SF ?? null)
    },
    {
      label: 'Deliveries',
      value: `${formatSf(metrics?.deliveries_SF ?? null, true)} SF`,
      arrow: '·',
      arrowClass: 'metric-arrow'
    },
    {
      label: 'Under Construction',
      value: `${formatSf(metrics?.underConstruction_SF ?? null, true)} SF`,
      arrow: '·',
      arrowClass: 'metric-arrow'
    },
    {
      label: 'Avg Asking Rate',
      value: `${formatRate(metrics?.avgAskingRate_dollarsSF ?? null)}/SF`,
      arrow: arrowFor(metrics?.avgAskingRate_dollarsSF ?? null),
      arrowClass: 'metric-arrow'
    }
  ]

  return (
    <div className="key-metrics-banner">
      {items.map((item) => (
        <div key={item.label} className="metric-tile">
          <div className="metric-label">{item.label}</div>
          <div className="metric-value">
            <span>{item.value}</span>
            <span className={item.arrowClass}>{item.arrow}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
