import { BrowserWindow, dialog, ipcMain } from 'electron'
import { readFileSync } from 'fs'
import { IpcChannels } from '../shared/ipc-channels'
import type {
  AiConfigPublic,
  AiConfigSaveInput,
  AiConnectionResult,
  AiSynthesisGenerationResult,
  ExternalChangeScanResult,
  HeadlineMetrics,
  LeaseRow,
  MarketStatRow,
  PropertyRow,
  ReportPin,
  Scenario,
  ScenarioInput,
  SourceFileRow,
  SubmarketStatRow,
  SynthesisCard,
  SynthesisCardInput,
  WindowState,
  WorkspaceCreateInput
} from '../shared/ipc-channels'
import {
  clearAiConfig,
  readAiConfig,
  writeAiConfig
} from './ai-config'
import {
  generateSynthesisForWorkspace,
  testActiveProviderConnection
} from './ai-dispatcher'
import {
  acknowledgeExternalChanges,
  scanExternalChanges
} from './external-bridge'
import { getWorkspaceDbPath } from './paths'
import { readAppConfig, updateAppConfig } from './app-config'
import {
  closeActiveWorkspace,
  createWorkspace,
  getActiveWorkspace,
  getActiveWorkspaceDb,
  listWorkspaces,
  openWorkspace,
  refreshWorkspaceArtifacts
} from './workspace-manager'
import { importMarketStatistics, importSubmarketStatistics } from './csv-import'
import { importPropertyAndLeaseData } from './json-import'
import { ingestSourceFiles } from './source-ingest'

function requireActive(): {
  db: ReturnType<typeof getActiveWorkspaceDb>
  workspace: ReturnType<typeof getActiveWorkspace>
} {
  const db = getActiveWorkspaceDb()
  const workspace = getActiveWorkspace()
  if (!db || !workspace) {
    throw new Error('No workspace is open')
  }
  return { db, workspace }
}

function pickFile(extensions: string[], name: string): string | null {
  const window = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
  const result = dialog.showOpenDialogSync(window, {
    properties: ['openFile'],
    filters: [{ name, extensions }]
  })
  return result?.[0] ?? null
}

function pickFiles(): string[] {
  const window = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
  const result = dialog.showOpenDialogSync(window, {
    properties: ['openFile', 'multiSelections']
  })
  return result ?? []
}

export function registerIpcHandlers(): void {
  ipcMain.handle(IpcChannels.PING, () => ({
    pong: true,
    timestamp: Date.now(),
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node
  }))

  ipcMain.handle(IpcChannels.DB_STATUS, () => {
    const db = getActiveWorkspaceDb()
    const active = getActiveWorkspace()
    if (!db || !active) {
      return { connected: false, path: null, version: null }
    }
    const version = db.prepare('SELECT sqlite_version() AS v').get() as {
      v: string
    }
    return {
      connected: true,
      path: getWorkspaceDbPath(active.id),
      version: version.v
    }
  })

  ipcMain.handle(IpcChannels.WORKSPACE_LIST, () => listWorkspaces())

  ipcMain.handle(
    IpcChannels.WORKSPACE_CREATE,
    (_event, input: WorkspaceCreateInput) => createWorkspace(input)
  )

  ipcMain.handle(IpcChannels.WORKSPACE_OPEN, (_event, id: string) =>
    openWorkspace(id)
  )

  ipcMain.handle(IpcChannels.WORKSPACE_CLOSE, () => {
    closeActiveWorkspace()
    updateAppConfig({ lastWorkspaceId: null })
    return null
  })

  ipcMain.handle(IpcChannels.WORKSPACE_CURRENT, () => getActiveWorkspace())

  ipcMain.handle(IpcChannels.WINDOW_STATE_GET, () => readAppConfig().windowState)

  ipcMain.handle(IpcChannels.WINDOW_STATE_SAVE, (_event, state: WindowState) => {
    updateAppConfig({ windowState: state })
    return null
  })

  ipcMain.handle(IpcChannels.DIALOG_OPEN_CSV, () =>
    pickFile(['csv'], 'CSV files')
  )

  ipcMain.handle(IpcChannels.DIALOG_OPEN_JSON, () =>
    pickFile(['json'], 'JSON files')
  )

  ipcMain.handle(IpcChannels.DIALOG_OPEN_FILES, () => pickFiles())

  ipcMain.handle(
    IpcChannels.DATA_IMPORT_MARKET_STATS,
    (_event, payload: { path: string }) => {
      const { db, workspace } = requireActive()
      const content = readFileSync(payload.path, 'utf8')
      const result = importMarketStatistics(db!, content, workspace!.currentQuarter)
      if (result.ok) refreshWorkspaceArtifacts()
      return {
        ok: result.ok,
        rowCount: result.rowCount,
        errors: result.errors
      }
    }
  )

  ipcMain.handle(
    IpcChannels.DATA_IMPORT_SUBMARKET_STATS,
    (_event, payload: { path: string }) => {
      const { db, workspace } = requireActive()
      const content = readFileSync(payload.path, 'utf8')
      const result = importSubmarketStatistics(
        db!,
        content,
        workspace!.currentQuarter
      )
      if (result.ok) refreshWorkspaceArtifacts()
      return {
        ok: result.ok,
        rowCount: result.rowCount,
        errors: result.errors
      }
    }
  )

  ipcMain.handle(
    IpcChannels.DATA_IMPORT_PROPERTY_LEASE,
    (_event, payload: { path: string }) => {
      const { db } = requireActive()
      const content = readFileSync(payload.path, 'utf8')
      const result = importPropertyAndLeaseData(db!, content)
      if (result.ok) refreshWorkspaceArtifacts()
      return result
    }
  )

  ipcMain.handle(
    IpcChannels.DATA_INGEST_SOURCES,
    (_event, payload: { paths: string[] }) => {
      const { db, workspace } = requireActive()
      const result = ingestSourceFiles(db!, workspace!.id, payload.paths)
      if (result.ingested.length > 0) refreshWorkspaceArtifacts()
      return {
        ok: result.ok,
        ingestedCount: result.ingested.length,
        errors: result.errors
      }
    }
  )

  ipcMain.handle(IpcChannels.DATA_LIST_MARKET_STATS, (): MarketStatRow[] => {
    const { db, workspace } = requireActive()
    const rows = db!
      .prepare(
        `SELECT id, quarter, property_class, subclass, net_rentable_area_msf,
                total_vacancy_pct, total_availability_pct, direct_availability_pct,
                sublease_availability_pct, avg_direct_asking_rate_dollars_sf,
                current_quarter_net_absorption_sf, ytd_net_absorption_sf,
                deliveries_sf, under_construction_sf
           FROM market_statistic
          WHERE quarter = ?
          ORDER BY property_class, subclass`
      )
      .all(workspace!.currentQuarter) as Array<{
      id: number
      quarter: string
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
    }>
    return rows.map((row) => ({
      id: row.id,
      quarter: row.quarter,
      propertyClass: row.property_class,
      subclass: row.subclass,
      netRentableArea_MSF: row.net_rentable_area_msf,
      totalVacancy_pct: row.total_vacancy_pct,
      totalAvailability_pct: row.total_availability_pct,
      directAvailability_pct: row.direct_availability_pct,
      subleaseAvailability_pct: row.sublease_availability_pct,
      avgDirectAskingRate_dollarsSF: row.avg_direct_asking_rate_dollars_sf,
      currentQuarterNetAbsorption_SF: row.current_quarter_net_absorption_sf,
      ytdNetAbsorption_SF: row.ytd_net_absorption_sf,
      deliveries_SF: row.deliveries_sf,
      underConstruction_SF: row.under_construction_sf
    }))
  })

  ipcMain.handle(
    IpcChannels.DATA_LIST_SUBMARKET_STATS,
    (): SubmarketStatRow[] => {
      const { db, workspace } = requireActive()
      const rows = db!
        .prepare(
          `SELECT id, quarter, submarket, net_rentable_area_msf,
                  total_vacancy_pct, total_availability_pct, direct_availability_pct,
                  sublease_availability_pct, avg_direct_asking_rate_dollars_sf,
                  current_quarter_net_absorption_sf, ytd_net_absorption_sf,
                  deliveries_sf, under_construction_sf
             FROM submarket_statistic
            WHERE quarter = ?
            ORDER BY submarket`
        )
        .all(workspace!.currentQuarter) as Array<{
        id: number
        quarter: string
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
      }>
      return rows.map((row) => ({
        id: row.id,
        quarter: row.quarter,
        submarket: row.submarket,
        netRentableArea_MSF: row.net_rentable_area_msf,
        totalVacancy_pct: row.total_vacancy_pct,
        totalAvailability_pct: row.total_availability_pct,
        directAvailability_pct: row.direct_availability_pct,
        subleaseAvailability_pct: row.sublease_availability_pct,
        avgDirectAskingRate_dollarsSF: row.avg_direct_asking_rate_dollars_sf,
        currentQuarterNetAbsorption_SF: row.current_quarter_net_absorption_sf,
        ytdNetAbsorption_SF: row.ytd_net_absorption_sf,
        deliveries_SF: row.deliveries_sf,
        underConstruction_SF: row.under_construction_sf
      }))
    }
  )

  ipcMain.handle(IpcChannels.DATA_LIST_PROPERTIES, (): PropertyRow[] => {
    const { db } = requireActive()
    const rows = db!
      .prepare(
        `SELECT id, name, address, submarket, property_class, rsf, floors, year_built
           FROM property
          ORDER BY name`
      )
      .all() as Array<{
      id: string
      name: string
      address: string | null
      submarket: string | null
      property_class: string | null
      rsf: number | null
      floors: number | null
      year_built: number | null
    }>
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      submarket: row.submarket,
      propertyClass: row.property_class,
      rsf: row.rsf,
      floors: row.floors,
      yearBuilt: row.year_built
    }))
  })

  ipcMain.handle(IpcChannels.DATA_LIST_LEASES, (): LeaseRow[] => {
    const { db } = requireActive()
    const rows = db!
      .prepare(
        `SELECT id, property_id, tenant, suite, floor, rsf, lease_type,
                start_date, expiration_date, rent_dollars_sf, status
           FROM lease
          ORDER BY property_id, tenant`
      )
      .all() as Array<{
      id: number
      property_id: string
      tenant: string
      suite: string | null
      floor: number | null
      rsf: number | null
      lease_type: string | null
      start_date: string | null
      expiration_date: string | null
      rent_dollars_sf: number | null
      status: string | null
    }>
    return rows.map((row) => ({
      id: row.id,
      propertyId: row.property_id,
      tenant: row.tenant,
      suite: row.suite,
      floor: row.floor,
      rsf: row.rsf,
      leaseType: row.lease_type,
      startDate: row.start_date,
      expirationDate: row.expiration_date,
      rent_dollarsSF: row.rent_dollars_sf,
      status: row.status
    }))
  })

  ipcMain.handle(IpcChannels.DATA_LIST_SOURCES, (): SourceFileRow[] => {
    const { db } = requireActive()
    const rows = db!
      .prepare(
        `SELECT id, filename, file_type, ingestion_date, hash,
                is_confidential, size_bytes, relative_path
           FROM source_file
          ORDER BY ingestion_date DESC`
      )
      .all() as Array<{
      id: string
      filename: string
      file_type: string | null
      ingestion_date: string
      hash: string
      is_confidential: number
      size_bytes: number
      relative_path: string
    }>
    return rows.map((row) => ({
      id: row.id,
      filename: row.filename,
      fileType: row.file_type,
      ingestionDate: row.ingestion_date,
      hash: row.hash,
      isConfidential: row.is_confidential === 1,
      sizeBytes: row.size_bytes,
      relativePath: row.relative_path
    }))
  })

  ipcMain.handle(IpcChannels.ANALYSIS_HEADLINE_METRICS, (): HeadlineMetrics => {
    const { db, workspace } = requireActive()
    const row = db!
      .prepare(
        `SELECT
           AVG(total_availability_pct) AS availability,
           AVG(avg_direct_asking_rate_dollars_sf) AS asking_rate,
           SUM(current_quarter_net_absorption_sf) AS net_absorption,
           SUM(deliveries_sf) AS deliveries,
           SUM(under_construction_sf) AS under_construction
         FROM market_statistic
        WHERE quarter = ?`
      )
      .get(workspace!.currentQuarter) as {
      availability: number | null
      asking_rate: number | null
      net_absorption: number | null
      deliveries: number | null
      under_construction: number | null
    }
    return {
      quarter: workspace!.currentQuarter,
      market: workspace!.market,
      availabilityRate_pct: row.availability,
      netAbsorption_SF: row.net_absorption,
      deliveries_SF: row.deliveries,
      underConstruction_SF: row.under_construction,
      avgAskingRate_dollarsSF: row.asking_rate
    }
  })

  ipcMain.handle(IpcChannels.ANALYSIS_LIST_SYNTHESIS, (): SynthesisCard[] => {
    const { db, workspace } = requireActive()
    const rows = db!
      .prepare(
        `SELECT id, quarter, card_type, title, body, metric_value, metric_unit,
                direction, source, generated_at, pinned
           FROM ai_synthesis_card
          WHERE quarter = ?
          ORDER BY generated_at DESC`
      )
      .all(workspace!.currentQuarter) as Array<{
      id: number
      quarter: string
      card_type: SynthesisCard['cardType']
      title: string
      body: string
      metric_value: number | null
      metric_unit: string | null
      direction: SynthesisCard['direction']
      source: SynthesisCard['source']
      generated_at: string
      pinned: number
    }>
    return rows.map((row) => ({
      id: row.id,
      quarter: row.quarter,
      cardType: row.card_type,
      title: row.title,
      body: row.body,
      metricValue: row.metric_value,
      metricUnit: row.metric_unit,
      direction: row.direction,
      source: row.source,
      generatedAt: row.generated_at,
      pinned: row.pinned === 1
    }))
  })

  ipcMain.handle(
    IpcChannels.ANALYSIS_CREATE_SYNTHESIS,
    (_event, input: SynthesisCardInput): SynthesisCard => {
      const { db, workspace } = requireActive()
      const now = new Date().toISOString()
      const result = db!
        .prepare(
          `INSERT INTO ai_synthesis_card
             (quarter, card_type, title, body, metric_value, metric_unit,
              direction, source, generated_at, pinned)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'manual', ?, 0)`
        )
        .run(
          workspace!.currentQuarter,
          input.cardType,
          input.title,
          input.body,
          input.metricValue ?? null,
          input.metricUnit ?? null,
          input.direction ?? null,
          now
        )
      return {
        id: Number(result.lastInsertRowid),
        quarter: workspace!.currentQuarter,
        cardType: input.cardType,
        title: input.title,
        body: input.body,
        metricValue: input.metricValue ?? null,
        metricUnit: input.metricUnit ?? null,
        direction: input.direction ?? null,
        source: 'manual',
        generatedAt: now,
        pinned: false
      }
    }
  )

  ipcMain.handle(IpcChannels.ANALYSIS_LIST_SCENARIOS, (): Scenario[] => {
    const { db } = requireActive()
    const rows = db!
      .prepare(
        `SELECT id, name, base_quarter, interest_rate_shift_bps, rent_growth_pct,
                cap_rate_shift_bps, created_at, updated_at
           FROM scenario
          ORDER BY created_at DESC`
      )
      .all() as Array<{
      id: number
      name: string
      base_quarter: string
      interest_rate_shift_bps: number
      rent_growth_pct: number
      cap_rate_shift_bps: number
      created_at: string
      updated_at: string
    }>
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      baseQuarter: row.base_quarter,
      interestRateShift_bps: row.interest_rate_shift_bps,
      rentGrowth_pct: row.rent_growth_pct,
      capRateShift_bps: row.cap_rate_shift_bps,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  })

  ipcMain.handle(
    IpcChannels.ANALYSIS_SAVE_SCENARIO,
    (_event, input: ScenarioInput): Scenario => {
      const { db, workspace } = requireActive()
      const now = new Date().toISOString()
      if (input.id) {
        db!
          .prepare(
            `UPDATE scenario SET name = ?, interest_rate_shift_bps = ?,
                                  rent_growth_pct = ?, cap_rate_shift_bps = ?,
                                  updated_at = ?
              WHERE id = ?`
          )
          .run(
            input.name,
            input.interestRateShift_bps,
            input.rentGrowth_pct,
            input.capRateShift_bps,
            now,
            input.id
          )
        const row = db!
          .prepare('SELECT * FROM scenario WHERE id = ?')
          .get(input.id) as {
          id: number
          name: string
          base_quarter: string
          interest_rate_shift_bps: number
          rent_growth_pct: number
          cap_rate_shift_bps: number
          created_at: string
          updated_at: string
        }
        return {
          id: row.id,
          name: row.name,
          baseQuarter: row.base_quarter,
          interestRateShift_bps: row.interest_rate_shift_bps,
          rentGrowth_pct: row.rent_growth_pct,
          capRateShift_bps: row.cap_rate_shift_bps,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }
      }
      const result = db!
        .prepare(
          `INSERT INTO scenario
             (name, base_quarter, interest_rate_shift_bps, rent_growth_pct,
              cap_rate_shift_bps, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          input.name,
          workspace!.currentQuarter,
          input.interestRateShift_bps,
          input.rentGrowth_pct,
          input.capRateShift_bps,
          now,
          now
        )
      return {
        id: Number(result.lastInsertRowid),
        name: input.name,
        baseQuarter: workspace!.currentQuarter,
        interestRateShift_bps: input.interestRateShift_bps,
        rentGrowth_pct: input.rentGrowth_pct,
        capRateShift_bps: input.capRateShift_bps,
        createdAt: now,
        updatedAt: now
      }
    }
  )

  ipcMain.handle(
    IpcChannels.ANALYSIS_DELETE_SCENARIO,
    (_event, id: number): null => {
      const { db } = requireActive()
      db!.prepare('DELETE FROM scenario WHERE id = ?').run(id)
      return null
    }
  )

  ipcMain.handle(IpcChannels.REPORT_LIST_PINS, (): ReportPin[] => {
    const { db } = requireActive()
    const rows = db!
      .prepare(
        `SELECT id, module_type, module_ref, pin_order, section, created_at
           FROM report_pin
          ORDER BY pin_order ASC, created_at ASC`
      )
      .all() as Array<{
      id: number
      module_type: string
      module_ref: string
      pin_order: number
      section: string | null
      created_at: string
    }>
    return rows.map((row) => ({
      id: row.id,
      moduleType: row.module_type,
      moduleRef: row.module_ref,
      pinOrder: row.pin_order,
      section: row.section,
      createdAt: row.created_at
    }))
  })

  ipcMain.handle(IpcChannels.AI_GET_CONFIG, (): AiConfigPublic => readAiConfig())

  ipcMain.handle(
    IpcChannels.AI_SAVE_CONFIG,
    (_event, input: AiConfigSaveInput): AiConfigPublic => writeAiConfig(input)
  )

  ipcMain.handle(IpcChannels.AI_CLEAR_CONFIG, (): AiConfigPublic => clearAiConfig())

  ipcMain.handle(
    IpcChannels.AI_TEST_CONNECTION,
    async (): Promise<AiConnectionResult> => testActiveProviderConnection()
  )

  ipcMain.handle(
    IpcChannels.AI_GENERATE_SYNTHESIS,
    async (): Promise<AiSynthesisGenerationResult> => {
      try {
        const { db, workspace } = requireActive()
        const result = await generateSynthesisForWorkspace(db!, workspace!)
        return { ok: true, inserted: result.inserted, usage: result.usage }
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : 'Unknown error.'
        }
      }
    }
  )

  ipcMain.handle(
    IpcChannels.BRIDGE_SCAN_CHANGES,
    (): ExternalChangeScanResult => {
      const { workspace } = requireActive()
      const result = scanExternalChanges(workspace!.id)
      return {
        scannedAt: result.scannedAt,
        changes: result.changes.map((c) => ({
          relativePath: c.relativePath,
          status: c.status,
          modifiedAt: c.modifiedAt,
          sizeBytes: c.sizeBytes,
          preview: c.preview
        }))
      }
    }
  )

  ipcMain.handle(IpcChannels.BRIDGE_ACK_CHANGES, (): null => {
    const { workspace } = requireActive()
    acknowledgeExternalChanges(workspace!.id)
    return null
  })

  ipcMain.handle(
    IpcChannels.REPORT_TOGGLE_PIN,
    (_event, payload: { moduleType: string; moduleRef: string; section?: string }): boolean => {
      const { db } = requireActive()
      const existing = db!
        .prepare(
          'SELECT id FROM report_pin WHERE module_type = ? AND module_ref = ?'
        )
        .get(payload.moduleType, payload.moduleRef) as { id: number } | undefined
      if (existing) {
        db!.prepare('DELETE FROM report_pin WHERE id = ?').run(existing.id)
        if (payload.moduleType === 'synthesis_card') {
          db!
            .prepare('UPDATE ai_synthesis_card SET pinned = 0 WHERE id = ?')
            .run(Number(payload.moduleRef))
        }
        return false
      }
      const maxOrder = db!
        .prepare('SELECT COALESCE(MAX(pin_order), 0) AS m FROM report_pin')
        .get() as { m: number }
      db!
        .prepare(
          `INSERT INTO report_pin (module_type, module_ref, pin_order, section, created_at)
           VALUES (?, ?, ?, ?, ?)`
        )
        .run(
          payload.moduleType,
          payload.moduleRef,
          maxOrder.m + 1,
          payload.section ?? null,
          new Date().toISOString()
        )
      if (payload.moduleType === 'synthesis_card') {
        db!
          .prepare('UPDATE ai_synthesis_card SET pinned = 1 WHERE id = ?')
          .run(Number(payload.moduleRef))
      }
      return true
    }
  )
}
