import type {
  AiConfigPublic,
  AiConfigSaveInput,
  AiConnectionResult,
  AiSynthesisGenerationResult,
  CsvImportSummary,
  DbStatusResult,
  ExternalChangeScanResult,
  HeadlineMetrics,
  JsonImportSummary,
  LeaseRow,
  MarketStatRow,
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
      ai: {
        getConfig: () => Promise<AiConfigPublic>
        saveConfig: (input: AiConfigSaveInput) => Promise<AiConfigPublic>
        clearConfig: () => Promise<AiConfigPublic>
        testConnection: () => Promise<AiConnectionResult>
        generateSynthesis: () => Promise<AiSynthesisGenerationResult>
      }
      bridge: {
        scanChanges: () => Promise<ExternalChangeScanResult>
        ackChanges: () => Promise<null>
      }
      reportSections: {
        list: () => Promise<ReportSection[]>
        updateNarrative: (
          sectionId: number,
          content: string
        ) => Promise<ReportSection>
        reorder: (orderedIds: number[]) => Promise<ReportSection[]>
        setIncluded: (
          sectionId: number,
          included: boolean
        ) => Promise<ReportSection[]>
        addCustom: (title: string) => Promise<ReportSection[]>
        delete: (sectionId: number) => Promise<ReportSection[]>
        renderHtml: () => Promise<string>
        generateNarrative: (
          sectionId: number
        ) => Promise<NarrativeGenerationResult>
        exportPdf: () => Promise<ReportExportResult>
        listExports: () => Promise<ReportExportRow[]>
        openExport: (relativePath: string) => Promise<null>
      }
    }
  }
}
