import { useEffect, useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { Scenario } from '../../../../shared/ipc-channels'
import { useWorkspace } from '../../state/workspace'

const QUARTERS_AHEAD = 8

const DEFAULT_INPUT = {
  name: 'Untitled Scenario',
  interestRateShift_bps: 0,
  rentGrowth_pct: 0,
  capRateShift_bps: 0
}

function projectQuarters(baseQuarter: string, n: number): string[] {
  const match = /^Q(\d)\s*(\d{4})$/.exec(baseQuarter.trim())
  if (!match) return Array.from({ length: n + 1 }, (_, i) => `T+${i}`)
  let q = parseInt(match[1], 10)
  let y = parseInt(match[2], 10)
  const out = [`Q${q} ${y}`]
  for (let i = 0; i < n; i++) {
    q += 1
    if (q > 4) {
      q = 1
      y += 1
    }
    out.push(`Q${q} ${y}`)
  }
  return out
}

function projectActual(baseRent: number) {
  const rent = Array.from({ length: QUARTERS_AHEAD + 1 }, (_, i) => {
    const t = i / 4
    return Number((baseRent * Math.pow(1.012, t)).toFixed(2))
  })
  const valueIndex = Array.from({ length: QUARTERS_AHEAD + 1 }, (_, i) => {
    const t = i / 4
    return Number((100 * Math.pow(1.015, t)).toFixed(1))
  })
  return { rent, valueIndex }
}

function projectSimulated(
  baseRent: number,
  baseCapRate: number,
  inputs: typeof DEFAULT_INPUT
) {
  const rentGrowth = inputs.rentGrowth_pct / 100
  const capRateShift = inputs.capRateShift_bps / 10000
  const rateShift = inputs.interestRateShift_bps / 10000

  const rent = Array.from({ length: QUARTERS_AHEAD + 1 }, (_, i) => {
    const t = i / 4
    const baseTrend = Math.pow(1.012, t)
    const scenarioTrend = Math.pow(1 + rentGrowth, t)
    return Number((baseRent * baseTrend * scenarioTrend).toFixed(2))
  })

  // Implied value index combines all three drivers:
  //   - rent growth lifts top-line revenue
  //   - cap rate widening compresses asset value (NOI / cap rate)
  //   - higher rates drag value via debt service / discount-rate pressure
  const valueIndex = Array.from({ length: QUARTERS_AHEAD + 1 }, (_, i) => {
    const t = i / 4
    const baseTrend = Math.pow(1.015, t)
    const rentLift = Math.pow(1 + rentGrowth, t)
    const capCompression = baseCapRate / (baseCapRate + capRateShift)
    const rateDrag = Math.max(0.5, 1 - 0.6 * rateShift * t)
    return Number((100 * baseTrend * rentLift * capCompression * rateDrag).toFixed(1))
  })

  return { rent, valueIndex }
}

export function ScenarioControls() {
  const { current } = useWorkspace()
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [name, setName] = useState(DEFAULT_INPUT.name)
  const [rateBps, setRateBps] = useState(DEFAULT_INPUT.interestRateShift_bps)
  const [rentGrowth, setRentGrowth] = useState(DEFAULT_INPUT.rentGrowth_pct)
  const [capBps, setCapBps] = useState(DEFAULT_INPUT.capRateShift_bps)
  const [baseRent, setBaseRent] = useState<number>(40)
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    if (!current) return
    let cancelled = false
    Promise.all([
      window.quarterline.analysis.listScenarios(),
      window.quarterline.data.listMarketStats(),
      window.quarterline.report.listPins()
    ])
      .then(([list, stats, pins]) => {
        if (cancelled) return
        setScenarios(list)
        const validRates = stats
          .map((s) => s.avgDirectAskingRate_dollarsSF)
          .filter((v): v is number => v !== null)
        if (validRates.length > 0) {
          const avg = validRates.reduce((a, b) => a + b, 0) / validRates.length
          setBaseRent(Number(avg.toFixed(2)))
        }
        setPinned(
          pins.some(
            (p) =>
              p.moduleType === 'scenario' &&
              activeId !== null &&
              p.moduleRef === String(activeId)
          )
        )
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [current?.id, current?.currentQuarter, activeId])

  const labels = useMemo(
    () => projectQuarters(current?.currentQuarter ?? 'Q1 2026', QUARTERS_AHEAD),
    [current?.currentQuarter]
  )

  const baseCapRate = 0.07
  const actual = useMemo(() => projectActual(baseRent), [baseRent])
  const simulated = useMemo(
    () =>
      projectSimulated(baseRent, baseCapRate, {
        name,
        interestRateShift_bps: rateBps,
        rentGrowth_pct: rentGrowth,
        capRateShift_bps: capBps
      }),
    [baseRent, name, rateBps, rentGrowth, capBps]
  )

  const option = useMemo(
    () => ({
      backgroundColor: 'transparent',
      grid: { left: 56, right: 56, top: 16, bottom: 56 },
      legend: {
        textStyle: { color: '#94a3b8', fontSize: 11 },
        bottom: 4,
        left: 'center',
        icon: 'roundRect',
        itemWidth: 12,
        itemHeight: 4,
        itemGap: 16
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f8fafc', fontSize: 12 },
        valueFormatter: (v: number) =>
          typeof v === 'number' ? v.toFixed(2) : String(v)
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: {
          color: '#64748b',
          fontSize: 10,
          interval: 0,
          rotate: labels.length > 6 ? 30 : 0
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '$/SF',
          nameTextStyle: { color: '#64748b', fontSize: 10, padding: [0, 0, 0, -32] },
          axisLine: { show: false },
          splitLine: { lineStyle: { color: '#1e293b' } },
          axisLabel: {
            color: '#64748b',
            fontSize: 10,
            formatter: (v: number) => `$${v.toFixed(0)}`
          }
        },
        {
          type: 'value',
          name: 'Index',
          nameTextStyle: { color: '#64748b', fontSize: 10, padding: [0, -24, 0, 0] },
          axisLine: { show: false },
          splitLine: { show: false },
          axisLabel: {
            color: '#64748b',
            fontSize: 10,
            formatter: (v: number) => v.toFixed(0)
          }
        }
      ],
      series: [
        {
          name: 'Rent (actual)',
          type: 'line',
          yAxisIndex: 0,
          smooth: true,
          data: actual.rent,
          lineStyle: { color: '#94a3b8', width: 1.5, type: 'dashed' },
          itemStyle: { color: '#94a3b8' },
          symbolSize: 4
        },
        {
          name: 'Rent (simulated)',
          type: 'line',
          yAxisIndex: 0,
          smooth: true,
          data: simulated.rent,
          lineStyle: { color: '#6366f1', width: 2 },
          itemStyle: { color: '#6366f1' },
          symbolSize: 5,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(99,102,241,0.25)' },
                { offset: 1, color: 'rgba(99,102,241,0)' }
              ]
            }
          }
        },
        {
          name: 'Value Index',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: simulated.valueIndex,
          lineStyle: { color: '#d946ef', width: 2 },
          itemStyle: { color: '#d946ef' },
          symbolSize: 5
        }
      ]
    }),
    [labels, actual, simulated]
  )

  if (!current) return null

  const onSave = async () => {
    const saved = await window.quarterline.analysis.saveScenario({
      id: activeId ?? undefined,
      name,
      interestRateShift_bps: rateBps,
      rentGrowth_pct: rentGrowth,
      capRateShift_bps: capBps
    })
    setActiveId(saved.id)
    const list = await window.quarterline.analysis.listScenarios()
    setScenarios(list)
  }

  const onSelect = (id: number) => {
    if (id === 0) {
      setActiveId(null)
      setName(DEFAULT_INPUT.name)
      setRateBps(0)
      setRentGrowth(0)
      setCapBps(0)
      return
    }
    const s = scenarios.find((x) => x.id === id)
    if (!s) return
    setActiveId(s.id)
    setName(s.name)
    setRateBps(s.interestRateShift_bps)
    setRentGrowth(s.rentGrowth_pct)
    setCapBps(s.capRateShift_bps)
  }

  const togglePin = async () => {
    if (activeId === null) return
    const newState = await window.quarterline.report.togglePin(
      'scenario',
      String(activeId),
      'scenarios'
    )
    setPinned(newState)
  }

  return (
    <div className="module-card scenario-card">
      <div className="module-header">
        <span className="module-title">What-If Simulation</span>
        <div className="scenario-actions">
          <select
            className="filter-select"
            value={activeId ?? 0}
            onChange={(e) => onSelect(Number(e.target.value))}
          >
            <option value={0}>+ New scenario</option>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={`pin-btn ${pinned ? 'on' : ''}`}
            onClick={togglePin}
            disabled={activeId === null}
          >
            {pinned ? '◉ Pinned' : '○ Pin'}
          </button>
        </div>
      </div>
      <div className="module-body scenario-body">
        <div className="scenario-controls">
          <input
            className="filter-select"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Scenario name"
          />
          <div className="scenario-slider-group">
            <div className="scenario-slider">
              <div className="scenario-slider-row">
                <label>Interest rate shift</label>
                <span className="scenario-slider-value">
                  {rateBps > 0 ? '+' : ''}
                  {rateBps} bps
                </span>
              </div>
              <input
                type="range"
                min={-200}
                max={200}
                step={25}
                value={rateBps}
                onChange={(e) => setRateBps(Number(e.target.value))}
              />
            </div>
            <div className="scenario-slider">
              <div className="scenario-slider-row">
                <label>Rent growth</label>
                <span className="scenario-slider-value">
                  {rentGrowth > 0 ? '+' : ''}
                  {rentGrowth.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min={-5}
                max={10}
                step={0.5}
                value={rentGrowth}
                onChange={(e) => setRentGrowth(Number(e.target.value))}
              />
            </div>
            <div className="scenario-slider">
              <div className="scenario-slider-row">
                <label>Cap rate shift</label>
                <span className="scenario-slider-value">
                  {capBps > 0 ? '+' : ''}
                  {capBps} bps
                </span>
              </div>
              <input
                type="range"
                min={-200}
                max={200}
                step={25}
                value={capBps}
                onChange={(e) => setCapBps(Number(e.target.value))}
              />
            </div>
          </div>
          <button
            type="button"
            className="scenario-save-btn"
            onClick={onSave}
            disabled={!name.trim()}
          >
            {activeId === null ? 'Save scenario' : 'Update scenario'}
          </button>
        </div>
        <div className="scenario-chart">
          <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>
    </div>
  )
}
