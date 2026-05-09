import Database from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { dirname } from 'path'
import { getWorkspaceDbPath } from './paths'

export type WorkspaceRow = {
  id: string
  name: string
  market: string
  property_type: string
  current_quarter: string
  created_at: string
  updated_at: string
  settings: string
}

type Migration = {
  id: string
  up: (db: Database.Database) => void
}

const MIGRATIONS: Migration[] = [
  {
    id: '0001-workspace-meta',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS workspace (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          market TEXT NOT NULL,
          property_type TEXT NOT NULL,
          current_quarter TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          settings TEXT NOT NULL DEFAULT '{}'
        );
      `)
    }
  },
  {
    id: '0002-market-statistics',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS market_statistic (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quarter TEXT NOT NULL,
          property_class TEXT NOT NULL,
          subclass TEXT,
          net_rentable_area_msf REAL,
          total_vacancy_pct REAL,
          total_availability_pct REAL,
          direct_availability_pct REAL,
          sublease_availability_pct REAL,
          avg_direct_asking_rate_dollars_sf REAL,
          current_quarter_net_absorption_sf INTEGER,
          ytd_net_absorption_sf INTEGER,
          deliveries_sf INTEGER,
          under_construction_sf INTEGER,
          imported_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS submarket_statistic (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quarter TEXT NOT NULL,
          submarket TEXT NOT NULL,
          net_rentable_area_msf REAL,
          total_vacancy_pct REAL,
          total_availability_pct REAL,
          direct_availability_pct REAL,
          sublease_availability_pct REAL,
          avg_direct_asking_rate_dollars_sf REAL,
          current_quarter_net_absorption_sf INTEGER,
          ytd_net_absorption_sf INTEGER,
          deliveries_sf INTEGER,
          under_construction_sf INTEGER,
          imported_at TEXT NOT NULL
        );
      `)
    }
  },
  {
    id: '0003-properties-and-leases',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS property (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          address TEXT,
          submarket TEXT,
          property_class TEXT,
          rsf INTEGER,
          floors INTEGER,
          year_built INTEGER,
          imported_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS lease (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          property_id TEXT NOT NULL,
          tenant TEXT NOT NULL,
          suite TEXT,
          floor INTEGER,
          rsf INTEGER,
          lease_type TEXT,
          start_date TEXT,
          expiration_date TEXT,
          rent_dollars_sf REAL,
          status TEXT,
          imported_at TEXT NOT NULL,
          FOREIGN KEY (property_id) REFERENCES property(id)
        );
      `)
    }
  },
  {
    id: '0004-source-files',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS source_file (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          file_type TEXT,
          ingestion_date TEXT NOT NULL,
          hash TEXT NOT NULL,
          is_confidential INTEGER NOT NULL DEFAULT 1,
          size_bytes INTEGER NOT NULL,
          relative_path TEXT NOT NULL
        );
      `)
    }
  },
  {
    id: '0005-synthesis-cards-and-scenarios',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS ai_synthesis_card (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quarter TEXT NOT NULL,
          card_type TEXT NOT NULL,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          metric_value REAL,
          metric_unit TEXT,
          direction TEXT,
          source TEXT NOT NULL DEFAULT 'manual',
          generated_at TEXT NOT NULL,
          pinned INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS scenario (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          base_quarter TEXT NOT NULL,
          interest_rate_shift_bps REAL NOT NULL DEFAULT 0,
          rent_growth_pct REAL NOT NULL DEFAULT 0,
          cap_rate_shift_bps REAL NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS report_pin (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          module_type TEXT NOT NULL,
          module_ref TEXT NOT NULL,
          pin_order INTEGER NOT NULL,
          section TEXT,
          created_at TEXT NOT NULL,
          UNIQUE(module_type, module_ref)
        );
      `)
    }
  }
]

export function openWorkspaceDb(workspaceId: string): Database.Database {
  const dbPath = getWorkspaceDbPath(workspaceId)
  mkdirSync(dirname(dbPath), { recursive: true })

  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  initWorkspaceSchema(db)
  return db
}

function initWorkspaceSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `)

  const applied = new Set(
    db
      .prepare('SELECT id FROM _migrations')
      .all()
      .map((row) => (row as { id: string }).id)
  )

  const insertMigration = db.prepare(
    'INSERT INTO _migrations (id, applied_at) VALUES (?, ?)'
  )

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.id)) continue
    db.transaction(() => {
      migration.up(db)
      insertMigration.run(migration.id, new Date().toISOString())
    })()
  }
}

export function readWorkspaceRow(db: Database.Database): WorkspaceRow | null {
  const row = db.prepare('SELECT * FROM workspace LIMIT 1').get() as
    | WorkspaceRow
    | undefined
  return row ?? null
}

export function insertWorkspaceRow(
  db: Database.Database,
  row: WorkspaceRow
): void {
  db.prepare(
    `INSERT INTO workspace
      (id, name, market, property_type, current_quarter, created_at, updated_at, settings)
     VALUES
      (@id, @name, @market, @property_type, @current_quarter, @created_at, @updated_at, @settings)`
  ).run(row)
}

export function touchWorkspace(db: Database.Database, id: string): void {
  db.prepare('UPDATE workspace SET updated_at = ? WHERE id = ?').run(
    new Date().toISOString(),
    id
  )
}
