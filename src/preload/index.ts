import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannels } from '../shared/ipc-channels'
import type {
  AiConfigPublic,
  AiConfigSaveInput,
  AiConnectionResult,
  AiSynthesisGenerationResult,
  AppInfo,
  Preferences,
  CsvImportSummary,
  DbStatusResult,
  ExternalChangeScanResult,
  HeadlineMetrics,
  JsonImportSummary,
  LeaseRow,
  MarketStatRow,
  MenuAction,
  NarrativeGenerationResult,
  PingResult,
  PropertyRow,
  ReportExportResult,
  ReportExportRow,
  ReportPin,
  ReportSection,
  Scenario,
  ScenarioInput,
  SourceFileRow,
  SourceIngestSummary,
  SubmarketStatRow,
  SynthesisCard,
  SynthesisCardInput,
  WindowState,
  Workspace,
  WorkspaceCreateInput
} from '../shared/ipc-channels'

const api = {
  ping: (): Promise<PingResult> => ipcRenderer.invoke(IpcChannels.PING),
  dbStatus: (): Promise<DbStatusResult> => ipcRenderer.invoke(IpcChannels.DB_STATUS),

  workspace: {
    list: (): Promise<Workspace[]> => ipcRenderer.invoke(IpcChannels.WORKSPACE_LIST),
    create: (input: WorkspaceCreateInput): Promise<Workspace> =>
      ipcRenderer.invoke(IpcChannels.WORKSPACE_CREATE, input),
    open: (id: string): Promise<Workspace> =>
      ipcRenderer.invoke(IpcChannels.WORKSPACE_OPEN, id),
    close: (): Promise<null> => ipcRenderer.invoke(IpcChannels.WORKSPACE_CLOSE),
    current: (): Promise<Workspace | null> =>
      ipcRenderer.invoke(IpcChannels.WORKSPACE_CURRENT)
  },

  windowState: {
    get: (): Promise<WindowState | null> =>
      ipcRenderer.invoke(IpcChannels.WINDOW_STATE_GET),
    save: (state: WindowState): Promise<null> =>
      ipcRenderer.invoke(IpcChannels.WINDOW_STATE_SAVE, state)
  },

  dialog: {
    openCsv: (): Promise<string | null> =>
      ipcRenderer.invoke(IpcChannels.DIALOG_OPEN_CSV),
    openJson: (): Promise<string | null> =>
      ipcRenderer.invoke(IpcChannels.DIALOG_OPEN_JSON),
    openFiles: (): Promise<string[]> =>
      ipcRenderer.invoke(IpcChannels.DIALOG_OPEN_FILES)
  },

  data: {
    importMarketStats: (path: string): Promise<CsvImportSummary> =>
      ipcRenderer.invoke(IpcChannels.DATA_IMPORT_MARKET_STATS, { path }),
    importSubmarketStats: (path: string): Promise<CsvImportSummary> =>
      ipcRenderer.invoke(IpcChannels.DATA_IMPORT_SUBMARKET_STATS, { path }),
    importPropertyLease: (path: string): Promise<JsonImportSummary> =>
      ipcRenderer.invoke(IpcChannels.DATA_IMPORT_PROPERTY_LEASE, { path }),
    ingestSources: (paths: string[]): Promise<SourceIngestSummary> =>
      ipcRenderer.invoke(IpcChannels.DATA_INGEST_SOURCES, { paths }),
    listMarketStats: (): Promise<MarketStatRow[]> =>
      ipcRenderer.invoke(IpcChannels.DATA_LIST_MARKET_STATS),
    listSubmarketStats: (): Promise<SubmarketStatRow[]> =>
      ipcRenderer.invoke(IpcChannels.DATA_LIST_SUBMARKET_STATS),
    listProperties: (): Promise<PropertyRow[]> =>
      ipcRenderer.invoke(IpcChannels.DATA_LIST_PROPERTIES),
    listLeases: (): Promise<LeaseRow[]> =>
      ipcRenderer.invoke(IpcChannels.DATA_LIST_LEASES),
    listSources: (): Promise<SourceFileRow[]> =>
      ipcRenderer.invoke(IpcChannels.DATA_LIST_SOURCES)
  },

  analysis: {
    headlineMetrics: (): Promise<HeadlineMetrics> =>
      ipcRenderer.invoke(IpcChannels.ANALYSIS_HEADLINE_METRICS),
    listSynthesis: (): Promise<SynthesisCard[]> =>
      ipcRenderer.invoke(IpcChannels.ANALYSIS_LIST_SYNTHESIS),
    createSynthesis: (input: SynthesisCardInput): Promise<SynthesisCard> =>
      ipcRenderer.invoke(IpcChannels.ANALYSIS_CREATE_SYNTHESIS, input),
    listScenarios: (): Promise<Scenario[]> =>
      ipcRenderer.invoke(IpcChannels.ANALYSIS_LIST_SCENARIOS),
    saveScenario: (input: ScenarioInput): Promise<Scenario> =>
      ipcRenderer.invoke(IpcChannels.ANALYSIS_SAVE_SCENARIO, input),
    deleteScenario: (id: number): Promise<null> =>
      ipcRenderer.invoke(IpcChannels.ANALYSIS_DELETE_SCENARIO, id)
  },

  report: {
    listPins: (): Promise<ReportPin[]> =>
      ipcRenderer.invoke(IpcChannels.REPORT_LIST_PINS),
    togglePin: (
      moduleType: string,
      moduleRef: string,
      section?: string
    ): Promise<boolean> =>
      ipcRenderer.invoke(IpcChannels.REPORT_TOGGLE_PIN, {
        moduleType,
        moduleRef,
        section
      })
  },

  ai: {
    getConfig: (): Promise<AiConfigPublic> =>
      ipcRenderer.invoke(IpcChannels.AI_GET_CONFIG),
    saveConfig: (input: AiConfigSaveInput): Promise<AiConfigPublic> =>
      ipcRenderer.invoke(IpcChannels.AI_SAVE_CONFIG, input),
    clearConfig: (): Promise<AiConfigPublic> =>
      ipcRenderer.invoke(IpcChannels.AI_CLEAR_CONFIG),
    testConnection: (): Promise<AiConnectionResult> =>
      ipcRenderer.invoke(IpcChannels.AI_TEST_CONNECTION),
    generateSynthesis: (): Promise<AiSynthesisGenerationResult> =>
      ipcRenderer.invoke(IpcChannels.AI_GENERATE_SYNTHESIS)
  },

  bridge: {
    scanChanges: (): Promise<ExternalChangeScanResult> =>
      ipcRenderer.invoke(IpcChannels.BRIDGE_SCAN_CHANGES),
    ackChanges: (): Promise<null> =>
      ipcRenderer.invoke(IpcChannels.BRIDGE_ACK_CHANGES)
  },

  app: {
    getInfo: (): Promise<AppInfo> => ipcRenderer.invoke(IpcChannels.APP_GET_INFO),
    openQuarterlineFolder: (): Promise<null> =>
      ipcRenderer.invoke(IpcChannels.APP_OPEN_QUARTERLINE_FOLDER),
    openLogFolder: (): Promise<null> =>
      ipcRenderer.invoke(IpcChannels.APP_OPEN_LOG_FOLDER),
    reportRendererError: (payload: {
      message: string
      stack?: string
      componentStack?: string
    }): Promise<null> =>
      ipcRenderer.invoke(IpcChannels.APP_REPORT_RENDERER_ERROR, payload),
    onMenuAction: (handler: (action: MenuAction) => void): (() => void) => {
      const listener = (_e: Electron.IpcRendererEvent, action: MenuAction): void =>
        handler(action)
      ipcRenderer.on(IpcChannels.APP_MENU_ACTION, listener)
      return () => ipcRenderer.removeListener(IpcChannels.APP_MENU_ACTION, listener)
    },
    getPreferences: (): Promise<Preferences> =>
      ipcRenderer.invoke(IpcChannels.APP_GET_PREFERENCES),
    savePreferences: (patch: Partial<Preferences>): Promise<Preferences> =>
      ipcRenderer.invoke(IpcChannels.APP_SAVE_PREFERENCES, patch)
  },

  reportSections: {
    list: (): Promise<ReportSection[]> =>
      ipcRenderer.invoke(IpcChannels.REPORT_LIST_SECTIONS),
    updateNarrative: (sectionId: number, content: string): Promise<ReportSection> =>
      ipcRenderer.invoke(IpcChannels.REPORT_UPDATE_NARRATIVE, {
        sectionId,
        content
      }),
    reorder: (orderedIds: number[]): Promise<ReportSection[]> =>
      ipcRenderer.invoke(IpcChannels.REPORT_REORDER_SECTIONS, orderedIds),
    setIncluded: (sectionId: number, included: boolean): Promise<ReportSection[]> =>
      ipcRenderer.invoke(IpcChannels.REPORT_SET_SECTION_INCLUDED, {
        sectionId,
        included
      }),
    addCustom: (title: string): Promise<ReportSection[]> =>
      ipcRenderer.invoke(IpcChannels.REPORT_ADD_SECTION, { title }),
    delete: (sectionId: number): Promise<ReportSection[]> =>
      ipcRenderer.invoke(IpcChannels.REPORT_DELETE_SECTION, sectionId),
    renderHtml: (): Promise<string> =>
      ipcRenderer.invoke(IpcChannels.REPORT_RENDER_HTML),
    generateNarrative: (sectionId: number): Promise<NarrativeGenerationResult> =>
      ipcRenderer.invoke(IpcChannels.REPORT_GENERATE_NARRATIVE, { sectionId }),
    exportPdf: (): Promise<ReportExportResult> =>
      ipcRenderer.invoke(IpcChannels.REPORT_EXPORT_PDF),
    listExports: (): Promise<ReportExportRow[]> =>
      ipcRenderer.invoke(IpcChannels.REPORT_LIST_EXPORTS),
    openExport: (relativePath: string): Promise<null> =>
      ipcRenderer.invoke(IpcChannels.REPORT_OPEN_EXPORT, relativePath)
  }
}

contextBridge.exposeInMainWorld('quarterline', api)

export type QuarterlineApi = typeof api
