import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { mkdirSync } from 'fs'

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (db) return db

  const userDataPath = app.getPath('userData')
  const dbDir = join(userDataPath, 'data')
  mkdirSync(dbDir, { recursive: true })

  const dbPath = join(dbDir, 'quarterline.db')
  db = new Database(dbPath)

  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS _meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  const version = db.prepare('SELECT sqlite_version() AS v').get() as { v: string }
  console.log(`SQLite ${version.v} at ${dbPath}`)

  return db
}

export function getDatabasePath(): string {
  const userDataPath = app.getPath('userData')
  return join(userDataPath, 'data', 'quarterline.db')
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
