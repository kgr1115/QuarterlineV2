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
  DATA_LIST_SOURCES: 'data:list:sources',

  ANALYSIS_HEADLINE_METRICS: 'analysis:headline-metrics',
  ANALYSIS_LIST_SYNTHESIS: 'analysis:list-synthesis',
  ANALYSIS_CREATE_SYNTHESIS: 'analysis:create-synthesis',
  ANALYSIS_LIST_SCENARIOS: 'analysis:list-scenarios',
  ANALYSIS_SAVE_SCENARIO: 'analysis:save-scenario',
  ANALYSIS_DELETE_SCENARIO: 'analysis:delete-scenario',
  REPORT_TOGGLE_PIN: 'report:toggle-pin',
  REPORT_LIST_PINS: 'report:list-pins',

  AI_GET_CONFIG: 'ai:get-config',
  AI_SAVE_CONFIG: 'ai:save-config',
  AI_CLEAR_CONFIG: 'ai:clear-config',
  AI_TEST_CONNECTION: 'ai:test-connection',
  AI_GENERATE_SYNTHESIS: 'ai:generate-synthesis',

  BRIDGE_SCAN_CHANGES: 'bridge:scan-changes',
  BRIDGE_ACK_CHANGES: 'bridge:ack-changes',

  REPORT_LIST_SECTIONS: 'report:list-sections',
  REPORT_UPDATE_NARRATIVE: 'report:update-narrative',
  REPORT_REORDER_SECTIONS: 'report:reorder-sections',
  REPORT_SET_SECTION_INCLUDED: 'report:set-section-included',
  REPORT_ADD_SECTION: 'report:add-section',
  REPORT_DELETE_SECTION: 'report:delete-section',
  REPORT_RENDER_HTML: 'report:render-html',
  REPORT_GENERATE_NARRATIVE: 'report:generate-narrative',
  REPORT_EXPORT_PDF: 'report:export-pdf',
  REPORT_LIST_EXPORTS: 'report:list-exports',
  REPORT_OPEN_EXPORT: 'report:open-export',

  APP_GET_INFO: 'app:get-info',
  APP_OPEN_QUARTERLINE_FOLDER: 'app:open-quarterline-folder',
  APP_OPEN_LOG_FOLDER: 'app:open-log-folder',
  APP_REPORT_RENDERER_ERROR: 'app:report-renderer-error',
  APP_MENU_ACTION: 'app:menu-action',
  APP_GET_PREFERENCES: 'app:get-preferences',
  APP_SAVE_PREFERENCES: 'app:save-preferences'
} as const

export type MenuAction =
  | 'new-workspace'
  | 'close-workspace'
  | 'route:portfolio'
  | 'route:reports'
  | 'route:data-studio'
  | 'route:settings'

export type AppInfo = {
  appVersion: string
  electronVersion: string
  nodeVersion: string
  chromeVersion: string
  quarterlineRoot: string
  workspacesRoot: string
  logsPath: string
  isPackaged: boolean
  updateState: UpdateState
}

export type UpdateState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'available'; version: string }
  | { kind: 'not-available' }
  | { kind: 'downloaded'; version: string }
  | { kind: 'error'; message: string }
  | { kind: 'disabled'; reason: string }

export type Preferences = {
  defaultMarket: string | null
  defaultPropertyType: string | null
}

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

export type HeadlineMetrics = {
  quarter: string
  market: string
  availabilityRate_pct: number | null
  netAbsorption_SF: number | null
  deliveries_SF: number | null
  underConstruction_SF: number | null
  avgAskingRate_dollarsSF: number | null
}

export type SynthesisCard = {
  id: number
  quarter: string
  cardType: 'market_overview' | 'trend_alert' | 'anomaly' | 'opportunity'
  title: string
  body: string
  metricValue: number | null
  metricUnit: string | null
  direction: 'up' | 'down' | 'flat' | null
  source: 'manual' | 'built-in-ai' | 'external-ai'
  generatedAt: string
  pinned: boolean
}

export type SynthesisCardInput = {
  cardType: SynthesisCard['cardType']
  title: string
  body: string
  metricValue?: number | null
  metricUnit?: string | null
  direction?: SynthesisCard['direction']
}

export type Scenario = {
  id: number
  name: string
  baseQuarter: string
  interestRateShift_bps: number
  rentGrowth_pct: number
  capRateShift_bps: number
  createdAt: string
  updatedAt: string
}

export type ScenarioInput = {
  id?: number
  name: string
  interestRateShift_bps: number
  rentGrowth_pct: number
  capRateShift_bps: number
}

export type ReportPin = {
  id: number
  moduleType: string
  moduleRef: string
  pinOrder: number
  section: string | null
  createdAt: string
}

export type AiConfigPublic = {
  provider: 'anthropic' | null
  hasKey: boolean
  model: string
  encryptionAvailable: boolean
}

export type AiConfigSaveInput = {
  provider: 'anthropic'
  apiKey: string | null
  model?: string
}

export type AiConnectionResult = { ok: true } | { ok: false; message: string }

export type AiSynthesisGenerationResult = {
  ok: boolean
  inserted?: number
  message?: string
  usage?: {
    inputTokens: number
    outputTokens: number
    cacheReadTokens: number
    cacheCreationTokens: number
  }
}

export type ExternalChange = {
  relativePath: string
  status: 'created' | 'modified' | 'deleted'
  modifiedAt: string
  sizeBytes: number
  preview: string
}

export type ExternalChangeScanResult = {
  scannedAt: string
  changes: ExternalChange[]
}

export type ReportSection = {
  id: number
  sectionKey: string
  title: string
  narrativePath: string
  position: number
  includeInReport: boolean
  createdAt: string
  updatedAt: string
  narrativeContent: string
}

export type ReportExportRow = {
  id: number
  format: string
  relativePath: string
  generatedAt: string
  sizeBytes: number
}

export type ReportExportResult = {
  ok: boolean
  message?: string
  relativePath?: string
  absolutePath?: string
  sizeBytes?: number
  generatedAt?: string
}

export type NarrativeGenerationResult = {
  ok: boolean
  markdown?: string
  message?: string
  usage?: {
    inputTokens: number
    outputTokens: number
    cacheReadTokens: number
    cacheCreationTokens: number
  }
}
