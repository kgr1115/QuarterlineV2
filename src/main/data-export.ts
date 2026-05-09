import Database from 'better-sqlite3'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { getWorkspaceFolder } from './paths'
import type { Workspace } from './workspace-manager'

type MarketStatRecord = {
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
}

type SubmarketStatRecord = Omit<MarketStatRecord, 'property_class' | 'subclass'> & {
  submarket: string
}

type PropertyRecord = {
  id: string
  name: string
  address: string | null
  submarket: string | null
  property_class: string | null
  rsf: number | null
  floors: number | null
  year_built: number | null
}

type LeaseRecord = {
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
}

function dataDir(workspaceId: string): string {
  const dir = join(getWorkspaceFolder(workspaceId), 'data')
  mkdirSync(dir, { recursive: true })
  return dir
}

function writeJson(path: string, payload: unknown): void {
  writeFileSync(path, JSON.stringify(payload, null, 2), 'utf8')
}

export function exportMarketStatistics(
  db: Database.Database,
  workspace: Workspace
): void {
  const rows = db
    .prepare(
      `SELECT property_class, subclass, net_rentable_area_msf, total_vacancy_pct,
              total_availability_pct, direct_availability_pct, sublease_availability_pct,
              avg_direct_asking_rate_dollars_sf, current_quarter_net_absorption_sf,
              ytd_net_absorption_sf, deliveries_sf, under_construction_sf
         FROM market_statistic
        WHERE quarter = ?
        ORDER BY property_class, subclass`
    )
    .all(workspace.currentQuarter) as MarketStatRecord[]

  const payload = {
    market: workspace.market,
    propertyType: workspace.propertyType,
    quarter: workspace.currentQuarter,
    statistics: rows.map((row) => ({
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
  }
  writeJson(join(dataDir(workspace.id), 'market-statistics.json'), payload)
}

export function exportSubmarketStatistics(
  db: Database.Database,
  workspace: Workspace
): void {
  const rows = db
    .prepare(
      `SELECT submarket, net_rentable_area_msf, total_vacancy_pct,
              total_availability_pct, direct_availability_pct, sublease_availability_pct,
              avg_direct_asking_rate_dollars_sf, current_quarter_net_absorption_sf,
              ytd_net_absorption_sf, deliveries_sf, under_construction_sf
         FROM submarket_statistic
        WHERE quarter = ?
        ORDER BY submarket`
    )
    .all(workspace.currentQuarter) as SubmarketStatRecord[]

  const payload = {
    market: workspace.market,
    quarter: workspace.currentQuarter,
    submarkets: rows.map((row) => ({
      name: row.submarket,
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
  writeJson(join(dataDir(workspace.id), 'submarket-statistics.json'), payload)
}

export function exportPropertyData(
  db: Database.Database,
  workspace: Workspace
): void {
  const rows = db
    .prepare(
      `SELECT id, name, address, submarket, property_class, rsf, floors, year_built
         FROM property
        ORDER BY name`
    )
    .all() as PropertyRecord[]

  const payload = {
    properties: rows.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      submarket: row.submarket,
      propertyClass: row.property_class,
      rsf: row.rsf,
      floors: row.floors,
      yearBuilt: row.year_built
    }))
  }
  writeJson(join(dataDir(workspace.id), 'property-data.json'), payload)
}

export function exportLeaseData(
  db: Database.Database,
  workspace: Workspace
): void {
  const rows = db
    .prepare(
      `SELECT property_id, tenant, suite, floor, rsf, lease_type, start_date,
              expiration_date, rent_dollars_sf, status
         FROM lease
        ORDER BY property_id, tenant`
    )
    .all() as LeaseRecord[]

  const payload = {
    leases: rows.map((row) => ({
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
  }
  writeJson(join(dataDir(workspace.id), 'lease-data.json'), payload)
}

export function exportAll(db: Database.Database, workspace: Workspace): void {
  exportMarketStatistics(db, workspace)
  exportSubmarketStatistics(db, workspace)
  exportPropertyData(db, workspace)
  exportLeaseData(db, workspace)
}
