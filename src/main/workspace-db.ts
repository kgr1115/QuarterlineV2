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

    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `)
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
