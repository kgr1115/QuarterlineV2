import { useEffect, useMemo, useState } from 'react'
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet'
import type { GeoJsonObject, Feature } from 'geojson'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { SubmarketStatRow } from '../../../../shared/ipc-channels'
import { useWorkspace } from '../../state/workspace'
import atlantaSubmarkets from '../../data/atlanta-submarkets.geojson?raw'

type MetricKey =
  | 'totalVacancy_pct'
  | 'totalAvailability_pct'
  | 'avgDirectAskingRate_dollarsSF'
  | 'currentQuarterNetAbsorption_SF'

const METRICS: { id: MetricKey; label: string; format: (v: number) => string }[] = [
  {
    id: 'totalVacancy_pct',
    label: 'Vacancy',
    format: (v) => `${v.toFixed(1)}%`
  },
  {
    id: 'totalAvailability_pct',
    label: 'Availability',
    format: (v) => `${v.toFixed(1)}%`
  },
  {
    id: 'avgDirectAskingRate_dollarsSF',
    label: 'Asking Rate',
    format: (v) => `$${v.toFixed(2)}/SF`
  },
  {
    id: 'currentQuarterNetAbsorption_SF',
    label: 'Net Absorption',
    format: (v) =>
      v < 0
        ? `(${Math.abs(v).toLocaleString()}) SF`
        : `${v.toLocaleString()} SF`
  }
]

const RAMP = ['#1e293b', '#3b4d6b', '#4f6090', '#6366f1', '#a78bfa', '#d946ef']

function colorScale(values: number[]): (v: number | null) => string {
  if (values.length === 0) return () => '#475569'
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (min === max)
    return (v) => (v === null ? '#475569' : RAMP[Math.floor(RAMP.length / 2)])
  return (v) => {
    if (v === null) return '#475569'
    const t = (v - min) / (max - min)
    const idx = Math.min(RAMP.length - 1, Math.floor(t * RAMP.length))
    return RAMP[idx]
  }
}

export function MarketMap() {
  const { current } = useWorkspace()
  const [submarketRows, setSubmarketRows] = useState<SubmarketStatRow[]>([])
  const [metric, setMetric] = useState<MetricKey>('totalVacancy_pct')
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (!current) return
    let cancelled = false
    window.quarterline.data
      .listSubmarketStats()
      .then((rows) => {
        if (!cancelled) setSubmarketRows(rows)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [current?.id, current?.currentQuarter])

  const geojson = useMemo<GeoJsonObject>(
    () => JSON.parse(atlantaSubmarkets),
    []
  )

  const valuesBySubmarket = useMemo(() => {
    const map = new Map<string, number | null>()
    for (const row of submarketRows) {
      const v = row[metric] as number | null
      map.set(row.submarket, v)
    }
    return map
  }, [submarketRows, metric])

  const numericValues = useMemo(
    () =>
      Array.from(valuesBySubmarket.values()).filter(
        (v): v is number => v !== null && Number.isFinite(v)
      ),
    [valuesBySubmarket]
  )

  const scale = useMemo(() => colorScale(numericValues), [numericValues])

  const styleFn = (feature: Feature | undefined) => {
    const name = (feature?.properties as { submarket?: string } | undefined)
      ?.submarket
    const value = name ? (valuesBySubmarket.get(name) ?? null) : null
    return {
      fillColor: scale(value),
      fillOpacity: 0.75,
      color:
        selected && selected === name ? '#f8fafc' : '#1e293b',
      weight: selected && selected === name ? 2 : 1
    }
  }

  const onEachFeature = (feature: Feature, layer: L.Layer) => {
    const name = (feature.properties as { submarket?: string } | undefined)
      ?.submarket
    if (!name) return
    const value = valuesBySubmarket.get(name) ?? null
    const metricLabel = METRICS.find((m) => m.id === metric)?.label ?? ''
    const formatted =
      value === null
        ? '—'
        : (METRICS.find((m) => m.id === metric)?.format(value) ?? `${value}`)
    ;(layer as L.Path).bindTooltip(
      `<strong>${name}</strong><br/>${metricLabel}: ${formatted}`,
      { sticky: true, className: 'market-map-tooltip' }
    )
    ;(layer as L.Path).on({
      click: () => setSelected(name)
    })
  }

  if (!current) return null

  const isAtlanta = current.market.toLowerCase().includes('atlanta')
  const selectedRow = submarketRows.find((r) => r.submarket === selected)

  return (
    <div className="module-card market-map-card">
      <div className="module-header">
        <span className="module-title">Market Overview</span>
        <select
          className="filter-select"
          value={metric}
          onChange={(e) => setMetric(e.target.value as MetricKey)}
        >
          {METRICS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div className="module-body market-map-body">
        {!isAtlanta ? (
          <div className="module-placeholder">
            No submarket boundaries shipped for "{current.market}" yet — sample
            polygons cover Atlanta only.
          </div>
        ) : (
          <>
            <div className="market-map-container">
              <MapContainer
                center={[33.880, -84.380]}
                zoom={10}
                scrollWheelZoom={true}
                zoomControl={true}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <GeoJSON
                  key={`${metric}-${selected ?? 'none'}`}
                  data={geojson}
                  style={styleFn as never}
                  onEachFeature={onEachFeature}
                />
              </MapContainer>
            </div>
            {selectedRow && (
              <div className="market-map-detail">
                <div className="market-map-detail-name">
                  {selectedRow.submarket}
                </div>
                <div className="market-map-detail-grid">
                  <span>Vacancy</span>
                  <span>
                    {selectedRow.totalVacancy_pct !== null
                      ? `${selectedRow.totalVacancy_pct.toFixed(1)}%`
                      : '—'}
                  </span>
                  <span>Availability</span>
                  <span>
                    {selectedRow.totalAvailability_pct !== null
                      ? `${selectedRow.totalAvailability_pct.toFixed(1)}%`
                      : '—'}
                  </span>
                  <span>Asking Rate</span>
                  <span>
                    {selectedRow.avgDirectAskingRate_dollarsSF !== null
                      ? `$${selectedRow.avgDirectAskingRate_dollarsSF.toFixed(2)}/SF`
                      : '—'}
                  </span>
                  <span>Net Absorption</span>
                  <span>
                    {selectedRow.currentQuarterNetAbsorption_SF !== null
                      ? selectedRow.currentQuarterNetAbsorption_SF < 0
                        ? `(${Math.abs(selectedRow.currentQuarterNetAbsorption_SF).toLocaleString()}) SF`
                        : `${selectedRow.currentQuarterNetAbsorption_SF.toLocaleString()} SF`
                      : '—'}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
