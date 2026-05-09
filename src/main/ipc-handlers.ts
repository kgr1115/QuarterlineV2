import { BrowserWindow, dialog, ipcMain } from 'electron'
import { readFileSync } from 'fs'
import { IpcChannels } from '../shared/ipc-channels'
import type {
  LeaseRow,
  MarketStatRow,
  PropertyRow,
  SourceFileRow,
  SubmarketStatRow,
  WindowState,
  WorkspaceCreateInput
} from '../shared/ipc-channels'
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
}
