import type {
  CsvImportSummary,
  DbStatusResult,
  HeadlineMetrics,
  JsonImportSummary,
  LeaseRow,
  MarketStatRow,
  PingResult,
  PropertyRow,
  ReportPin,
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

declare global {
  interface Window {
    quarterline: {
      ping: () => Promise<PingResult>
      dbStatus: () => Promise<DbStatusResult>
      workspace: {
        list: () => Promise<Workspace[]>
        create: (input: WorkspaceCreateInput) => Promise<Workspace>
        open: (id: string) => Promise<Workspace>
        close: () => Promise<null>
        current: () => Promise<Workspace | null>
      }
      windowState: {
        get: () => Promise<WindowState | null>
        save: (state: WindowState) => Promise<null>
      }
      dialog: {
        openCsv: () => Promise<string | null>
        openJson: () => Promise<string | null>
        openFiles: () => Promise<string[]>
      }
      data: {
        importMarketStats: (path: string) => Promise<CsvImportSummary>
        importSubmarketStats: (path: string) => Promise<CsvImportSummary>
        importPropertyLease: (path: string) => Promise<JsonImportSummary>
        ingestSources: (paths: string[]) => Promise<SourceIngestSummary>
        listMarketStats: () => Promise<MarketStatRow[]>
        listSubmarketStats: () => Promise<SubmarketStatRow[]>
        listProperties: () => Promise<PropertyRow[]>
        listLeases: () => Promise<LeaseRow[]>
        listSources: () => Promise<SourceFileRow[]>
      }
      analysis: {
        headlineMetrics: () => Promise<HeadlineMetrics>
        listSynthesis: () => Promise<SynthesisCard[]>
        createSynthesis: (input: SynthesisCardInput) => Promise<SynthesisCard>
        listScenarios: () => Promise<Scenario[]>
        saveScenario: (input: ScenarioInput) => Promise<Scenario>
        deleteScenario: (id: number) => Promise<null>
      }
      report: {
        listPins: () => Promise<ReportPin[]>
        togglePin: (
          moduleType: string,
          moduleRef: string,
          section?: string
        ) => Promise<boolean>
      }
    }
  }
}
