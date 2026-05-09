import { parse } from 'csv-parse/sync'
import Database from 'better-sqlite3'

export type CsvParseError = {
  row: number
  column?: string
  message: string
}

export type CsvImportResult<T> = {
  ok: boolean
  rowCount: number
  errors: CsvParseError[]
  rows: T[]
}

type ColumnSpec<T> = {
  key: keyof T
  aliases: string[]
  type: 'string' | 'number' | 'integer'
  required: boolean
  nullable?: boolean
}

const MARKET_STAT_COLUMNS: ColumnSpec<MarketStatRow>[] = [
  {
    key: 'property_class',
    aliases: ['property class', 'class'],
    type: 'string',
    required: true
  },
  {
    key: 'subclass',
    aliases: ['subclass', 'sub-class', 'subtype'],
    type: 'string',
    required: false,
    nullable: true
  },
  {
    key: 'net_rentable_area_msf',
    aliases: ['net rentable area (msf)', 'nra (msf)', 'nra msf'],
    type: 'number',
    required: true
  },
  {
    key: 'total_vacancy_pct',
    aliases: ['total vacancy (%)', 'total vacancy', 'vacancy (%)'],
    type: 'number',
    required: false,
    nullable: true
  },
  {
    key: 'total_availability_pct',
    aliases: ['total availability (%)', 'total availability'],
    type: 'number',
    required: false,
    nullable: true
  },
  {
    key: 'direct_availability_pct',
    aliases: ['direct availability (%)', 'direct availability'],
    type: 'number',
    required: false,
    nullable: true
  },
  {
    key: 'sublease_availability_pct',
    aliases: ['sublease availability (%)', 'sublease availability'],
    type: 'number',
    required: false,
    nullable: true
  },
  {
    key: 'avg_direct_asking_rate_dollars_sf',
    aliases: [
      'avg direct asking rate ($/sf fsg/yr)',
      'avg direct asking rate ($/sf)',
      'avg direct asking rate',
      'asking rate ($/sf)',
      'asking rate'
    ],
    type: 'number',
    required: false,
    nullable: true
  },
  {
    key: 'current_quarter_net_absorption_sf',
    aliases: [
      'current quarter net absorption (sf)',
      'current quarter net absorption',
      'qtr net absorption (sf)',
      'qtr net absorption'
    ],
    type: 'integer',
    required: false,
    nullable: true
  },
  {
    key: 'ytd_net_absorption_sf',
    aliases: ['ytd net absorption (sf)', 'ytd net absorption'],
    type: 'integer',
    required: false,
    nullable: true
  },
  {
    key: 'deliveries_sf',
    aliases: ['deliveries (sf)', 'deliveries'],
    type: 'integer',
    required: false,
    nullable: true
  },
  {
    key: 'under_construction_sf',
    aliases: ['under construction (sf)', 'under construction'],
    type: 'integer',
    required: false,
    nullable: true
  }
]

const SUBMARKET_STAT_COLUMNS: ColumnSpec<SubmarketStatRow>[] = [
  {
    key: 'submarket',
    aliases: ['submarket', 'sub-market', 'sub market'],
    type: 'string',
    required: true
  },
  ...MARKET_STAT_COLUMNS.filter(
    (col) => col.key !== 'property_class' && col.key !== 'subclass'
  ).map((col) => ({ ...col, key: col.key as keyof SubmarketStatRow }))
]

export type MarketStatRow = {
  property_class: string
  subclass: string | null
  net_rentable_area_msf: number
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

export type SubmarketStatRow = {
  submarket: string
  net_rentable_area_msf: number
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

function normalizeHeader(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[‐‑‒–—−]/g, '-')
    .replace(/[ ]/g, ' ')
}

function parseNumeric(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const parenNegative = /^\(([^)]+)\)$/.exec(trimmed)
  const candidate = parenNegative
    ? `-${parenNegative[1]}`
    : trimmed
  const cleaned = candidate.replace(/[%$,]/g, '').replace(/\s+/g, '')
  if (!cleaned || cleaned === '-' || cleaned === '—' || cleaned === 'n/a') {
    return null
  }
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : NaN
}

function parseCells<T extends Record<string, unknown>>(
  records: Record<string, string>[],
  spec: ColumnSpec<T>[],
  errors: CsvParseError[]
): T[] {
  if (records.length === 0) return []

  const headerMap = new Map<string, keyof T>()
  const sampleRow = records[0]
  const seen = new Set<keyof T>()

  for (const rawHeader of Object.keys(sampleRow)) {
    const norm = normalizeHeader(rawHeader)
    const match = spec.find((col) =>
      [normalizeHeader(col.key as string), ...col.aliases.map(normalizeHeader)].includes(
        norm
      )
    )
    if (match) {
      headerMap.set(rawHeader, match.key)
      seen.add(match.key)
    }
  }

  for (const col of spec) {
    if (col.required && !seen.has(col.key)) {
      errors.push({
        row: 0,
        column: col.key as string,
        message: `Missing required column "${col.key as string}". Expected one of: ${[col.key as string, ...col.aliases].join(', ')}`
      })
    }
  }

  const rows: T[] = []
  records.forEach((record, index) => {
    const rowNum = index + 2
    const out = {} as T

    for (const col of spec) {
      const headerKey = [...headerMap.entries()].find(
        ([, k]) => k === col.key
      )?.[0]
      const raw = headerKey ? record[headerKey] : ''

      if (col.type === 'string') {
        const value = raw?.trim() ?? ''
        if (col.required && !value) {
          errors.push({
            row: rowNum,
            column: col.key as string,
            message: 'required string value is empty'
          })
        }
        ;(out as Record<string, unknown>)[col.key as string] = value || null
        continue
      }

      const numeric = raw == null ? null : parseNumeric(raw)
      if (Number.isNaN(numeric)) {
        errors.push({
          row: rowNum,
          column: col.key as string,
          message: `could not parse "${raw}" as ${col.type}`
        })
        ;(out as Record<string, unknown>)[col.key as string] = null
        continue
      }

      if (numeric === null) {
        if (col.required && !col.nullable) {
          errors.push({
            row: rowNum,
            column: col.key as string,
            message: 'required numeric value is empty'
          })
        }
        ;(out as Record<string, unknown>)[col.key as string] = null
        continue
      }

      const value =
        col.type === 'integer' ? Math.round(numeric) : numeric
      ;(out as Record<string, unknown>)[col.key as string] = value
    }

    rows.push(out)
  })

  return rows
}

function parseRecords(content: string): Record<string, string>[] {
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true
  }) as Record<string, string>[]
}

export function importMarketStatistics(
  db: Database.Database,
  csvContent: string,
  quarter: string
): CsvImportResult<MarketStatRow> {
  const errors: CsvParseError[] = []
  let records: Record<string, string>[]
  try {
    records = parseRecords(csvContent)
  } catch (err) {
    return {
      ok: false,
      rowCount: 0,
      errors: [
        {
          row: 0,
          message:
            err instanceof Error ? err.message : 'CSV could not be parsed'
        }
      ],
      rows: []
    }
  }

  const rows = parseCells(records, MARKET_STAT_COLUMNS, errors)
  if (errors.length > 0) {
    return { ok: false, rowCount: rows.length, errors, rows }
  }

  const insert = db.prepare(`
    INSERT INTO market_statistic
      (quarter, property_class, subclass, net_rentable_area_msf, total_vacancy_pct,
       total_availability_pct, direct_availability_pct, sublease_availability_pct,
       avg_direct_asking_rate_dollars_sf, current_quarter_net_absorption_sf,
       ytd_net_absorption_sf, deliveries_sf, under_construction_sf, imported_at)
    VALUES (@quarter, @property_class, @subclass, @net_rentable_area_msf, @total_vacancy_pct,
       @total_availability_pct, @direct_availability_pct, @sublease_availability_pct,
       @avg_direct_asking_rate_dollars_sf, @current_quarter_net_absorption_sf,
       @ytd_net_absorption_sf, @deliveries_sf, @under_construction_sf, @imported_at)
  `)
  const importedAt = new Date().toISOString()

  db.transaction(() => {
    db.prepare('DELETE FROM market_statistic WHERE quarter = ?').run(quarter)
    for (const row of rows) {
      insert.run({ ...row, quarter, imported_at: importedAt })
    }
  })()

  return { ok: true, rowCount: rows.length, errors: [], rows }
}

export function importSubmarketStatistics(
  db: Database.Database,
  csvContent: string,
  quarter: string
): CsvImportResult<SubmarketStatRow> {
  const errors: CsvParseError[] = []
  let records: Record<string, string>[]
  try {
    records = parseRecords(csvContent)
  } catch (err) {
    return {
      ok: false,
      rowCount: 0,
      errors: [
        {
          row: 0,
          message:
            err instanceof Error ? err.message : 'CSV could not be parsed'
        }
      ],
      rows: []
    }
  }

  const rows = parseCells(records, SUBMARKET_STAT_COLUMNS, errors)
  if (errors.length > 0) {
    return { ok: false, rowCount: rows.length, errors, rows }
  }

  const insert = db.prepare(`
    INSERT INTO submarket_statistic
      (quarter, submarket, net_rentable_area_msf, total_vacancy_pct,
       total_availability_pct, direct_availability_pct, sublease_availability_pct,
       avg_direct_asking_rate_dollars_sf, current_quarter_net_absorption_sf,
       ytd_net_absorption_sf, deliveries_sf, under_construction_sf, imported_at)
    VALUES (@quarter, @submarket, @net_rentable_area_msf, @total_vacancy_pct,
       @total_availability_pct, @direct_availability_pct, @sublease_availability_pct,
       @avg_direct_asking_rate_dollars_sf, @current_quarter_net_absorption_sf,
       @ytd_net_absorption_sf, @deliveries_sf, @under_construction_sf, @imported_at)
  `)
  const importedAt = new Date().toISOString()

  db.transaction(() => {
    db.prepare('DELETE FROM submarket_statistic WHERE quarter = ?').run(quarter)
    for (const row of rows) {
      insert.run({ ...row, quarter, imported_at: importedAt })
    }
  })()

  return { ok: true, rowCount: rows.length, errors: [], rows }
}
