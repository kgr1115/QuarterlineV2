import type Database from 'better-sqlite3'
import { marked } from 'marked'
import type { Workspace } from './workspace-manager'
import type { ReportSection } from './report-assembly'
import { computeDataSummary } from './workspace-manifest'

type MarketStatRow = {
  property_class: string
  subclass: string | null
  net_rentable_area_msf: number | null
  total_vacancy_pct: number | null
  total_availability_pct: number | null
  direct_availability_pct: number | null
  sublease_availability_pct: number | null
  avg_direct_asking_rate_dollars_sf: number | null
  current_quarter_net_absorption_sf: number | null
  ytd_net_absorption_sf: number | null
  deliveries_sf: number | null
  under_construction_sf: number | null
}

type SubmarketStatRow = {
  submarket: string
  net_rentable_area_msf: number | null
  total_vacancy_pct: number | null
  total_availability_pct: number | null
  direct_availability_pct: number | null
  sublease_availability_pct: number | null
  avg_direct_asking_rate_dollars_sf: number | null
  current_quarter_net_absorption_sf: number | null
  ytd_net_absorption_sf: number | null
  deliveries_sf: number | null
  under_construction_sf: number | null
}

type SynthesisCardRow = {
  id: number
  card_type: string
  title: string
  body: string
  metric_value: number | null
  metric_unit: string | null
  direction: string | null
}

function fmtPct(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(1)}%`
}

function fmtRate(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return `$${value.toFixed(2)}`
}

function fmtInt(value: number | null): string {
  if (value === null || value === undefined) return '—'
  if (value < 0) return `(${Math.abs(value).toLocaleString('en-US')})`
  return value.toLocaleString('en-US')
}

function fmtNum(value: number | null, digits = 2): string {
  if (value === null || value === undefined) return '—'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function renderMarketTable(rows: MarketStatRow[]): string {
  if (rows.length === 0) {
    return '<p class="empty">No market statistics imported.</p>'
  }
  const body = rows
    .map(
      (r) => `<tr>
      <td>${escapeHtml(r.property_class)}</td>
      <td>${r.subclass ? escapeHtml(r.subclass) : '—'}</td>
      <td class="num">${fmtNum(r.net_rentable_area_msf, 2)}</td>
      <td class="num">${fmtPct(r.total_vacancy_pct)}</td>
      <td class="num">${fmtPct(r.total_availability_pct)}</td>
      <td class="num">${fmtPct(r.direct_availability_pct)}</td>
      <td class="num">${fmtPct(r.sublease_availability_pct)}</td>
      <td class="num">${fmtRate(r.avg_direct_asking_rate_dollars_sf)}</td>
      <td class="num">${fmtInt(r.current_quarter_net_absorption_sf)}</td>
      <td class="num">${fmtInt(r.ytd_net_absorption_sf)}</td>
      <td class="num">${fmtInt(r.deliveries_sf)}</td>
      <td class="num">${fmtInt(r.under_construction_sf)}</td>
    </tr>`
    )
    .join('')
  return `<table class="report-table">
    <thead>
      <tr>
        <th>Class</th><th>Subclass</th><th>NRA (MSF)</th><th>Vacancy</th>
        <th>Total Avail.</th><th>Direct Avail.</th><th>Sublease</th>
        <th>Asking Rate</th><th>Qtr Abs. (SF)</th><th>YTD Abs. (SF)</th>
        <th>Deliv. (SF)</th><th>U/C (SF)</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`
}

function renderSubmarketTable(rows: SubmarketStatRow[]): string {
  if (rows.length === 0) {
    return '<p class="empty">No submarket statistics imported.</p>'
  }
  const body = rows
    .map(
      (r) => `<tr>
      <td>${escapeHtml(r.submarket)}</td>
      <td class="num">${fmtNum(r.net_rentable_area_msf, 2)}</td>
      <td class="num">${fmtPct(r.total_vacancy_pct)}</td>
      <td class="num">${fmtPct(r.total_availability_pct)}</td>
      <td class="num">${fmtPct(r.direct_availability_pct)}</td>
      <td class="num">${fmtPct(r.sublease_availability_pct)}</td>
      <td class="num">${fmtRate(r.avg_direct_asking_rate_dollars_sf)}</td>
      <td class="num">${fmtInt(r.current_quarter_net_absorption_sf)}</td>
      <td class="num">${fmtInt(r.ytd_net_absorption_sf)}</td>
      <td class="num">${fmtInt(r.deliveries_sf)}</td>
      <td class="num">${fmtInt(r.under_construction_sf)}</td>
    </tr>`
    )
    .join('')
  return `<table class="report-table">
    <thead>
      <tr>
        <th>Submarket</th><th>NRA (MSF)</th><th>Vacancy</th>
        <th>Total Avail.</th><th>Direct Avail.</th><th>Sublease</th>
        <th>Asking Rate</th><th>Qtr Abs. (SF)</th><th>YTD Abs. (SF)</th>
        <th>Deliv. (SF)</th><th>U/C (SF)</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`
}

function renderKeyMetrics(headline: ReturnType<typeof gatherHeadline>): string {
  const items = [
    { label: 'Availability Rate', value: fmtPct(headline.availability) },
    { label: 'Net Absorption', value: `${fmtInt(headline.netAbsorption)} SF` },
    { label: 'Deliveries', value: `${fmtInt(headline.deliveries)} SF` },
    { label: 'Under Construction', value: `${fmtInt(headline.underConstruction)} SF` },
    { label: 'Avg Asking Rate', value: `${fmtRate(headline.askingRate)}/SF` }
  ]
  return `<div class="cover-metrics">${items
    .map(
      (item) =>
        `<div class="cover-metric"><div class="cover-metric-label">${escapeHtml(
          item.label
        )}</div><div class="cover-metric-value">${escapeHtml(
          item.value
        )}</div></div>`
    )
    .join('')}</div>`
}

function gatherHeadline(db: Database.Database, quarter: string) {
  const row = db
    .prepare(
      `SELECT
         AVG(total_availability_pct) AS availability,
         AVG(avg_direct_asking_rate_dollars_sf) AS asking_rate,
         SUM(current_quarter_net_absorption_sf) AS net_abs,
         SUM(deliveries_sf) AS deliveries,
         SUM(under_construction_sf) AS under_construction
       FROM market_statistic
      WHERE quarter = ?`
    )
    .get(quarter) as {
    availability: number | null
    asking_rate: number | null
    net_abs: number | null
    deliveries: number | null
    under_construction: number | null
  }
  return {
    availability: row.availability,
    askingRate: row.asking_rate,
    netAbsorption: row.net_abs,
    deliveries: row.deliveries,
    underConstruction: row.under_construction
  }
}

function renderPinnedSynthesis(
  db: Database.Database,
  quarter: string
): string {
  const cards = db
    .prepare(
      `SELECT s.id, s.card_type, s.title, s.body, s.metric_value,
              s.metric_unit, s.direction
         FROM ai_synthesis_card s
         JOIN report_pin p
           ON p.module_type = 'synthesis_card'
          AND p.module_ref = CAST(s.id AS TEXT)
        WHERE s.quarter = ?
        ORDER BY p.pin_order ASC`
    )
    .all(quarter) as SynthesisCardRow[]

  if (cards.length === 0) return ''

  return `<div class="report-synthesis">
    ${cards
      .map(
        (c) => `<div class="synthesis-card-print">
          <div class="synthesis-card-type">${escapeHtml(c.card_type.replace('_', ' '))}</div>
          <div class="synthesis-card-title">${escapeHtml(c.title)}</div>
          <div class="synthesis-card-body">${escapeHtml(c.body)}</div>
        </div>`
      )
      .join('')}
  </div>`
}

function renderNarrative(content: string): string {
  if (!content || !content.trim()) {
    return '<p class="empty">No narrative authored yet.</p>'
  }
  return marked.parse(content, { async: false }) as string
}

function reportStyles(): string {
  return `
    @page { size: letter; margin: 0.6in 0.5in; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background: #fff;
      margin: 0;
      font-size: 11pt;
      line-height: 1.45;
    }
    .report-cover {
      page-break-after: always;
      padding: 0.6in 0.4in;
      display: flex;
      flex-direction: column;
      gap: 0.3in;
      min-height: 9.5in;
    }
    .cover-eyebrow {
      font-size: 10pt;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
    }
    .cover-title {
      font-size: 28pt;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #0f172a;
      margin: 0;
    }
    .cover-subtitle {
      font-size: 14pt;
      color: #475569;
      margin: 0;
    }
    .cover-metrics {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.15in;
      padding: 0.2in;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
    }
    .cover-metric { display: flex; flex-direction: column; gap: 4px; }
    .cover-metric-label {
      font-size: 9pt;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .cover-metric-value {
      font-family: 'JetBrains Mono', 'Consolas', monospace;
      font-size: 16pt;
      font-weight: 600;
      color: #0f172a;
      font-variant-numeric: tabular-nums;
    }
    .report-section {
      page-break-inside: avoid;
      padding: 0.4in 0.4in 0.2in;
    }
    .section-eyebrow {
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #6366f1;
      margin-bottom: 0.05in;
    }
    .section-title {
      font-size: 18pt;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: #0f172a;
      margin: 0 0 0.2in;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 0.08in;
    }
    .narrative {
      font-size: 11pt;
      line-height: 1.55;
      color: #1e293b;
    }
    .narrative p { margin: 0 0 0.12in; }
    .narrative strong { color: #0f172a; }
    .empty {
      color: #94a3b8;
      font-style: italic;
      font-size: 10pt;
    }
    .report-synthesis {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.15in;
      margin: 0.2in 0;
    }
    .synthesis-card-print {
      border: 1px solid #cbd5e1;
      border-left: 3px solid #6366f1;
      padding: 0.12in 0.15in;
      background: #f8fafc;
    }
    .synthesis-card-type {
      font-size: 8pt;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #6366f1;
      margin-bottom: 0.05in;
    }
    .synthesis-card-title {
      font-size: 11pt;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 0.05in;
    }
    .synthesis-card-body {
      font-size: 10pt;
      color: #334155;
    }
    .report-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin: 0.15in 0;
    }
    .report-table th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 8pt;
      padding: 0.06in 0.08in;
      text-align: left;
      border-bottom: 1px solid #cbd5e1;
    }
    .report-table td {
      padding: 0.05in 0.08in;
      border-bottom: 1px solid #e2e8f0;
    }
    .report-table td.num {
      font-family: 'JetBrains Mono', 'Consolas', monospace;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .stats-section {
      page-break-before: always;
    }
    .report-footer {
      padding: 0.2in 0.4in;
      border-top: 1px solid #cbd5e1;
      color: #64748b;
      font-size: 9pt;
      display: flex;
      justify-content: space-between;
    }
  `
}

export type ReportRenderInput = {
  workspace: Workspace
  sections: ReportSection[]
}

export function renderReportHtml(
  db: Database.Database,
  input: ReportRenderInput
): string {
  const { workspace, sections } = input
  const headline = gatherHeadline(db, workspace.currentQuarter)
  const summary = computeDataSummary(db, workspace.currentQuarter)
  const synthesis = renderPinnedSynthesis(db, workspace.currentQuarter)
  const generatedAt = new Date()

  const marketStats = db
    .prepare(
      `SELECT property_class, subclass, net_rentable_area_msf,
              total_vacancy_pct, total_availability_pct,
              direct_availability_pct, sublease_availability_pct,
              avg_direct_asking_rate_dollars_sf,
              current_quarter_net_absorption_sf, ytd_net_absorption_sf,
              deliveries_sf, under_construction_sf
         FROM market_statistic
        WHERE quarter = ?
        ORDER BY property_class, subclass`
    )
    .all(workspace.currentQuarter) as MarketStatRow[]

  const submarketStats = db
    .prepare(
      `SELECT submarket, net_rentable_area_msf, total_vacancy_pct,
              total_availability_pct, direct_availability_pct,
              sublease_availability_pct, avg_direct_asking_rate_dollars_sf,
              current_quarter_net_absorption_sf, ytd_net_absorption_sf,
              deliveries_sf, under_construction_sf
         FROM submarket_statistic
        WHERE quarter = ?
        ORDER BY submarket`
    )
    .all(workspace.currentQuarter) as SubmarketStatRow[]

  const includedSections = sections.filter((s) => s.includeInReport)

  const sectionHtml = includedSections
    .map((section, idx) => {
      const narrativeHtml = renderNarrative(section.narrativeContent)
      return `<section class="report-section">
        <div class="section-eyebrow">${escapeHtml(String(idx + 1).padStart(2, '0'))}</div>
        <h2 class="section-title">${escapeHtml(section.title)}</h2>
        <div class="narrative">${narrativeHtml}</div>
      </section>`
    })
    .join('')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(workspace.name)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
    <style>${reportStyles()}</style>
  </head>
  <body>
    <div class="report-cover">
      <div>
        <div class="cover-eyebrow">${escapeHtml(workspace.propertyType)} · ${escapeHtml(
          workspace.currentQuarter
        )}</div>
        <h1 class="cover-title">${escapeHtml(workspace.market)} ${escapeHtml(workspace.propertyType)}</h1>
        <div class="cover-subtitle">${escapeHtml(workspace.name)}</div>
      </div>
      ${renderKeyMetrics(headline)}
      ${synthesis}
      <div style="margin-top:auto; font-size:9pt; color:#64748b;">
        Imported data summary: ${summary.marketStatRows} class rows ·
        ${summary.submarketStatRows} submarkets ·
        ${summary.propertyCount} properties · ${summary.leaseCount} leases.
      </div>
    </div>

    ${sectionHtml}

    <section class="report-section stats-section">
      <div class="section-eyebrow">Statistics</div>
      <h2 class="section-title">Market Statistics by Class</h2>
      ${renderMarketTable(marketStats)}
      <h2 class="section-title" style="margin-top:0.3in;">Market Statistics by Submarket</h2>
      ${renderSubmarketTable(submarketStats)}
    </section>

    <div class="report-footer">
      <span>${escapeHtml(workspace.name)} · ${escapeHtml(workspace.currentQuarter)}</span>
      <span>Generated ${generatedAt.toLocaleString('en-US')}</span>
    </div>
  </body>
</html>`
}
