import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannels } from '../shared/ipc-channels'
import type {
  CsvImportSummary,
  DbStatusResult,
  JsonImportSummary,
  LeaseRow,
  MarketStatRow,
  PingResult,
  PropertyRow,
  SourceFileRow,
  SourceIngestSummary,
  SubmarketStatRow,
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
  }
}

contextBridge.exposeInMainWorld('quarterline', api)

export type QuarterlineApi = typeof api
