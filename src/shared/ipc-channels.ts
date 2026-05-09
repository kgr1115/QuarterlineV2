export const IpcChannels = {
  PING: 'app:ping',
  DB_STATUS: 'db:status',

  WORKSPACE_LIST: 'workspace:list',
  WORKSPACE_CREATE: 'workspace:create',
  WORKSPACE_OPEN: 'workspace:open',
  WORKSPACE_CLOSE: 'workspace:close',
  WORKSPACE_CURRENT: 'workspace:current',

  WINDOW_STATE_GET: 'window:state:get',
  WINDOW_STATE_SAVE: 'window:state:save',

  DIALOG_OPEN_CSV: 'dialog:open:csv',
  DIALOG_OPEN_JSON: 'dialog:open:json',
  DIALOG_OPEN_FILES: 'dialog:open:files',

  DATA_IMPORT_MARKET_STATS: 'data:import:market-stats',
  DATA_IMPORT_SUBMARKET_STATS: 'data:import:submarket-stats',
  DATA_IMPORT_PROPERTY_LEASE: 'data:import:property-lease',
  DATA_INGEST_SOURCES: 'data:ingest:sources',
  DATA_LIST_MARKET_STATS: 'data:list:market-stats',
  DATA_LIST_SUBMARKET_STATS: 'data:list:submarket-stats',
  DATA_LIST_PROPERTIES: 'data:list:properties',
  DATA_LIST_LEASES: 'data:list:leases',
  DATA_LIST_SOURCES: 'data:list:sources'
} as const

export type DbStatusResult = {
  connected: boolean
  path: string | null
  version: string | null
}

export type PingResult = {
  pong: true
  timestamp: number
  electronVersion: string
  nodeVersion: string
}

export type Workspace = {
  id: string
  name: string
  market: string
  propertyType: string
  currentQuarter: string
  createdAt: string
  updatedAt: string
}

export type WorkspaceCreateInput = {
  name: string
  market: string
  propertyType: string
  quarter: string
}

export type WindowState = {
  width: number
  height: number
  x?: number
  y?: number
  isMaximized: boolean
}

export type CsvImportError = {
  row: number
  column?: string
  message: string
}

export type CsvImportSummary = {
  ok: boolean
  rowCount: number
  errors: CsvImportError[]
}

export type JsonImportError = {
  index: number
  field?: string
  message: string
}

export type JsonImportSummary = {
  ok: boolean
  propertiesImported: number
  leasesImported: number
  errors: JsonImportError[]
}

export type SourceIngestSummary = {
  ok: boolean
  ingestedCount: number
  errors: { path: string; message: string }[]
}

export type MarketStatRow = {
  id: number
  quarter: string
  propertyClass: string
  subclass: string | null
  netRentableArea_MSF: number | null
  totalVacancy_pct: number | null
  totalAvailability_pct: number | null
  directAvailability_pct: number | null
  subleaseAvailability_pct: number | null
  avgDirectAskingRate_dollarsSF: number | null
  currentQuarterNetAbsorption_SF: number | null
  ytdNetAbsorption_SF: number | null
  deliveries_SF: number | null
  underConstruction_SF: number | null
}

export type SubmarketStatRow = Omit<MarketStatRow, 'propertyClass' | 'subclass'> & {
  submarket: string
}

export type PropertyRow = {
  id: string
  name: string
  address: string | null
  submarket: string | null
  propertyClass: string | null
  rsf: number | null
  floors: number | null
  yearBuilt: number | null
}

export type LeaseRow = {
  id: number
  propertyId: string
  tenant: string
  suite: string | null
  floor: number | null
  rsf: number | null
  leaseType: string | null
  startDate: string | null
  expirationDate: string | null
  rent_dollarsSF: number | null
  status: string | null
}

export type SourceFileRow = {
  id: string
  filename: string
  fileType: string | null
  ingestionDate: string
  hash: string
  isConfidential: boolean
  sizeBytes: number
  relativePath: string
}
