import { useCallback, useEffect, useState } from 'react'
import { useWorkspace } from '../state/workspace'
import type {
  CsvImportError,
  JsonImportError,
  LeaseRow,
  MarketStatRow,
  PropertyRow,
  SourceFileRow,
  SubmarketStatRow
} from '../../../shared/ipc-channels'

type TabId = 'market-stats' | 'submarket-stats' | 'properties' | 'leases' | 'sources'

const TABS: { id: TabId; label: string }[] = [
  { id: 'market-stats', label: 'Market Stats' },
  { id: 'submarket-stats', label: 'Submarket Stats' },
  { id: 'properties', label: 'Properties' },
  { id: 'leases', label: 'Leases' },
  { id: 'sources', label: 'Source Files' }
]

type ImportFeedback =
  | { kind: 'idle' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string; details: { line: string; text: string }[] }

const idle: ImportFeedback = { kind: 'idle' }

function describeCsvError(err: CsvImportError): { line: string; text: string } {
  const line = err.row === 0 ? 'header' : `row ${err.row}`
  const col = err.column ? ` · ${err.column}` : ''
  return { line: `${line}${col}`, text: err.message }
}

function describeJsonError(err: JsonImportError): { line: string; text: string } {
  const line = err.index < 0 ? 'document' : `index ${err.index}`
  const field = err.field ? ` · ${err.field}` : ''
  return { line: `${line}${field}`, text: err.message }
}

function formatNumber(value: number | null, digits = 1): string {
  if (value === null || value === undefined) return '—'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
}

function formatInteger(value: number | null): string {
  if (value === null || value === undefined) return '—'
  if (value < 0) return `(${Math.abs(value).toLocaleString('en-US')})`
  return value.toLocaleString('en-US')
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DataStudio() {
  const { current } = useWorkspace()
  const [tab, setTab] = useState<TabId>('market-stats')
  const [feedback, setFeedback] = useState<ImportFeedback>(idle)
  const [marketStats, setMarketStats] = useState<MarketStatRow[]>([])
  const [submarketStats, setSubmarketStats] = useState<SubmarketStatRow[]>([])
  const [properties, setProperties] = useState<PropertyRow[]>([])
  const [leases, setLeases] = useState<LeaseRow[]>([])
  const [sources, setSources] = useState<SourceFileRow[]>([])

  const refresh = useCallback(async () => {
    if (!current) {
      setMarketStats([])
      setSubmarketStats([])
      setProperties([])
      setLeases([])
      setSources([])
      return
    }
    const [m, sm, p, l, s] = await Promise.all([
      window.quarterline.data.listMarketStats(),
      window.quarterline.data.listSubmarketStats(),
      window.quarterline.data.listProperties(),
      window.quarterline.data.listLeases(),
      window.quarterline.data.listSources()
    ])
    setMarketStats(m)
    setSubmarketStats(sm)
    setProperties(p)
    setLeases(l)
    setSources(s)
  }, [current])

  useEffect(() => {
    void refresh()
  }, [refresh])

  if (!current) {
    return (
      <div className="data-studio data-studio-empty">
        <div className="workspace-empty-card">
          <div className="workspace-empty-eyebrow">Data Studio</div>
          <div className="workspace-empty-title">Open a workspace</div>
          <div className="workspace-empty-body">
            The Data Studio shows imported market statistics, properties,
            leases, and source files for the active workspace. Open or create
            a workspace from the sidebar switcher.
          </div>
        </div>
      </div>
    )
  }

  async function handleImportMarketStats() {
    const path = await window.quarterline.dialog.openCsv()
    if (!path) return
    setFeedback(idle)
    const result = await window.quarterline.data.importMarketStats(path)
    if (result.ok) {
      setFeedback({
        kind: 'success',
        message: `Imported ${result.rowCount} market statistics rows.`
      })
      await refresh()
      setTab('market-stats')
    } else {
      setFeedback({
        kind: 'error',
        message: 'Market statistics import failed.',
        details: result.errors.map(describeCsvError)
      })
    }
  }

  async function handleImportSubmarketStats() {
    const path = await window.quarterline.dialog.openCsv()
    if (!path) return
    setFeedback(idle)
    const result = await window.quarterline.data.importSubmarketStats(path)
    if (result.ok) {
      setFeedback({
        kind: 'success',
        message: `Imported ${result.rowCount} submarket statistics rows.`
      })
      await refresh()
      setTab('submarket-stats')
    } else {
      setFeedback({
        kind: 'error',
        message: 'Submarket statistics import failed.',
        details: result.errors.map(describeCsvError)
      })
    }
  }

  async function handleImportPropertyLease() {
    const path = await window.quarterline.dialog.openJson()
    if (!path) return
    setFeedback(idle)
    const result = await window.quarterline.data.importPropertyLease(path)
    if (result.ok) {
      setFeedback({
        kind: 'success',
        message: `Imported ${result.propertiesImported} properties and ${result.leasesImported} leases.`
      })
      await refresh()
      setTab('properties')
    } else {
      setFeedback({
        kind: 'error',
        message: 'Property / lease import failed.',
        details: result.errors.map(describeJsonError)
      })
    }
  }

  async function handleIngestSources() {
    const paths = await window.quarterline.dialog.openFiles()
    if (paths.length === 0) return
    setFeedback(idle)
    const result = await window.quarterline.data.ingestSources(paths)
    if (result.ok) {
      setFeedback({
        kind: 'success',
        message: `Ingested ${result.ingestedCount} source file(s) into sources/.`
      })
      await refresh()
      setTab('sources')
    } else {
      setFeedback({
        kind: 'error',
        message:
          result.ingestedCount > 0
            ? `Ingested ${result.ingestedCount} file(s) but some failed.`
            : 'Source ingestion failed.',
        details: result.errors.map((err) => ({
          line: err.path,
          text: err.message
        }))
      })
      if (result.ingestedCount > 0) await refresh()
    }
  }

  return (
    <div className="data-studio">
      <div className="data-studio-header">
        <div className="data-studio-title">Data Studio</div>
        <div className="data-studio-actions">
          <button
            type="button"
            className="data-studio-btn"
            onClick={handleImportMarketStats}
          >
            Import market stats CSV
          </button>
          <button
            type="button"
            className="data-studio-btn"
            onClick={handleImportSubmarketStats}
          >
            Import submarket stats CSV
          </button>
          <button
            type="button"
            className="data-studio-btn"
            onClick={handleImportPropertyLease}
          >
            Import property / lease JSON
          </button>
          <button
            type="button"
            className="data-studio-btn"
            onClick={handleIngestSources}
          >
            Add source file(s)
          </button>
        </div>
      </div>

      {feedback.kind === 'success' && (
        <div className="data-studio-banner data-studio-banner-success">
          {feedback.message}
        </div>
      )}
      {feedback.kind === 'error' && (
        <div className="data-studio-banner data-studio-banner-error">
          <div className="data-studio-banner-title">{feedback.message}</div>
          <ul className="data-studio-banner-list">
            {feedback.details.slice(0, 12).map((detail, i) => (
              <li key={i}>
                <span className="data-studio-error-line">{detail.line}:</span>{' '}
                {detail.text}
              </li>
            ))}
            {feedback.details.length > 12 && (
              <li className="data-studio-error-more">
                …and {feedback.details.length - 12} more
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="data-studio-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`data-studio-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            <span className="data-studio-tab-count">
              {t.id === 'market-stats' && marketStats.length}
              {t.id === 'submarket-stats' && submarketStats.length}
              {t.id === 'properties' && properties.length}
              {t.id === 'leases' && leases.length}
              {t.id === 'sources' && sources.length}
            </span>
          </button>
        ))}
      </div>

      <div className="data-studio-table-wrap">
        {tab === 'market-stats' && (
          <MarketStatTable rows={marketStats} />
        )}
        {tab === 'submarket-stats' && (
          <SubmarketStatTable rows={submarketStats} />
        )}
        {tab === 'properties' && <PropertyTable rows={properties} />}
        {tab === 'leases' && <LeaseTable rows={leases} />}
        {tab === 'sources' && <SourceTable rows={sources} />}
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return <div className="data-studio-empty-row">{message}</div>
}

function MarketStatTable({ rows }: { rows: MarketStatRow[] }) {
  if (rows.length === 0) {
    return <EmptyState message="No market statistics imported yet for this quarter." />
  }
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Class</th>
          <th>Subclass</th>
          <th>NRA (MSF)</th>
          <th>Vacancy</th>
          <th>Total Avail.</th>
          <th>Direct Avail.</th>
          <th>Sublease Avail.</th>
          <th>Asking Rate</th>
          <th>Qtr Net Abs. (SF)</th>
          <th>YTD Net Abs. (SF)</th>
          <th>Deliveries (SF)</th>
          <th>Under Const. (SF)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.propertyClass}</td>
            <td>{row.subclass ?? '—'}</td>
            <td className="num">{formatNumber(row.netRentableArea_MSF, 2)}</td>
            <td className="num">{formatNumber(row.totalVacancy_pct)}%</td>
            <td className="num">{formatNumber(row.totalAvailability_pct)}%</td>
            <td className="num">{formatNumber(row.directAvailability_pct)}%</td>
            <td className="num">{formatNumber(row.subleaseAvailability_pct)}%</td>
            <td className="num">${formatNumber(row.avgDirectAskingRate_dollarsSF, 2)}</td>
            <td className="num">{formatInteger(row.currentQuarterNetAbsorption_SF)}</td>
            <td className="num">{formatInteger(row.ytdNetAbsorption_SF)}</td>
            <td className="num">{formatInteger(row.deliveries_SF)}</td>
            <td className="num">{formatInteger(row.underConstruction_SF)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function SubmarketStatTable({ rows }: { rows: SubmarketStatRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState message="No submarket statistics imported yet for this quarter." />
    )
  }
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Submarket</th>
          <th>NRA (MSF)</th>
          <th>Vacancy</th>
          <th>Total Avail.</th>
          <th>Direct Avail.</th>
          <th>Sublease Avail.</th>
          <th>Asking Rate</th>
          <th>Qtr Net Abs. (SF)</th>
          <th>YTD Net Abs. (SF)</th>
          <th>Deliveries (SF)</th>
          <th>Under Const. (SF)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.submarket}</td>
            <td className="num">{formatNumber(row.netRentableArea_MSF, 2)}</td>
            <td className="num">{formatNumber(row.totalVacancy_pct)}%</td>
            <td className="num">{formatNumber(row.totalAvailability_pct)}%</td>
            <td className="num">{formatNumber(row.directAvailability_pct)}%</td>
            <td className="num">{formatNumber(row.subleaseAvailability_pct)}%</td>
            <td className="num">${formatNumber(row.avgDirectAskingRate_dollarsSF, 2)}</td>
            <td className="num">{formatInteger(row.currentQuarterNetAbsorption_SF)}</td>
            <td className="num">{formatInteger(row.ytdNetAbsorption_SF)}</td>
            <td className="num">{formatInteger(row.deliveries_SF)}</td>
            <td className="num">{formatInteger(row.underConstruction_SF)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PropertyTable({ rows }: { rows: PropertyRow[] }) {
  if (rows.length === 0) {
    return <EmptyState message="No properties imported yet." />
  }
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Address</th>
          <th>Submarket</th>
          <th>Class</th>
          <th>RSF</th>
          <th>Floors</th>
          <th>Year Built</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="mono">{row.id}</td>
            <td>{row.name}</td>
            <td>{row.address ?? '—'}</td>
            <td>{row.submarket ?? '—'}</td>
            <td>{row.propertyClass ?? '—'}</td>
            <td className="num">{formatInteger(row.rsf)}</td>
            <td className="num">{formatInteger(row.floors)}</td>
            <td className="num">{formatInteger(row.yearBuilt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function LeaseTable({ rows }: { rows: LeaseRow[] }) {
  if (rows.length === 0) {
    return <EmptyState message="No leases imported yet." />
  }
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Property</th>
          <th>Tenant</th>
          <th>Suite</th>
          <th>Floor</th>
          <th>RSF</th>
          <th>Type</th>
          <th>Start</th>
          <th>Expiration</th>
          <th>Rent ($/SF)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="mono">{row.propertyId}</td>
            <td>{row.tenant}</td>
            <td>{row.suite ?? '—'}</td>
            <td className="num">{formatInteger(row.floor)}</td>
            <td className="num">{formatInteger(row.rsf)}</td>
            <td>{row.leaseType ?? '—'}</td>
            <td>{row.startDate ?? '—'}</td>
            <td>{row.expirationDate ?? '—'}</td>
            <td className="num">${formatNumber(row.rent_dollarsSF, 2)}</td>
            <td>{row.status ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function SourceTable({ rows }: { rows: SourceFileRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState message="No source files ingested yet. Source files are stored in sources/ and never exposed in data/ exports." />
    )
  }
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Filename</th>
          <th>Type</th>
          <th>Size</th>
          <th>Ingested</th>
          <th>Confidential</th>
          <th>Hash (sha256)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.filename}</td>
            <td>{row.fileType ?? '—'}</td>
            <td className="num">{formatBytes(row.sizeBytes)}</td>
            <td>{new Date(row.ingestionDate).toLocaleString()}</td>
            <td>{row.isConfidential ? 'Yes' : 'No'}</td>
            <td className="mono">{row.hash.slice(0, 16)}…</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
