import { createHash, randomUUID } from 'crypto'
import { copyFileSync, mkdirSync, statSync } from 'fs'
import { extname, basename, join } from 'path'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { getWorkspaceFolder } from './paths'

export type IngestedSource = {
  id: string
  filename: string
  fileType: string
  ingestionDate: string
  hash: string
  isConfidential: boolean
  sizeBytes: number
  relativePath: string
}

export type IngestResult = {
  ok: boolean
  ingested: IngestedSource[]
  errors: { path: string; message: string }[]
}

function computeFileHash(absolutePath: string): string {
  const buffer = readFileSync(absolutePath)
  return createHash('sha256').update(buffer).digest('hex')
}

export function ingestSourceFiles(
  db: Database.Database,
  workspaceId: string,
  paths: string[]
): IngestResult {
  const sourcesDir = join(getWorkspaceFolder(workspaceId), 'sources')
  mkdirSync(sourcesDir, { recursive: true })

  const ingested: IngestedSource[] = []
  const errors: { path: string; message: string }[] = []

  const insert = db.prepare(`
    INSERT INTO source_file
      (id, filename, file_type, ingestion_date, hash, is_confidential, size_bytes, relative_path)
    VALUES
      (@id, @filename, @file_type, @ingestion_date, @hash, @is_confidential, @size_bytes, @relative_path)
  `)
  const findByHash = db.prepare('SELECT id FROM source_file WHERE hash = ?')

  for (const sourcePath of paths) {
    try {
      const stats = statSync(sourcePath)
      if (!stats.isFile()) {
        errors.push({ path: sourcePath, message: 'not a regular file' })
        continue
      }

      const hash = computeFileHash(sourcePath)
      const existing = findByHash.get(hash) as { id: string } | undefined
      if (existing) {
        errors.push({
          path: sourcePath,
          message: 'a source with this content has already been ingested'
        })
        continue
      }

      const id = randomUUID()
      const baseFilename = basename(sourcePath)
      const ext = extname(baseFilename)
      const storedName = `${hash.slice(0, 12)}${ext || ''}`
      const targetAbsolute = join(sourcesDir, storedName)
      copyFileSync(sourcePath, targetAbsolute)

      const record = {
        id,
        filename: baseFilename,
        file_type: ext.replace(/^\./, '').toLowerCase() || null,
        ingestion_date: new Date().toISOString(),
        hash,
        is_confidential: 1,
        size_bytes: stats.size,
        relative_path: `sources/${storedName}`
      }
      insert.run(record)

      ingested.push({
        id,
        filename: record.filename,
        fileType: record.file_type ?? '',
        ingestionDate: record.ingestion_date,
        hash: record.hash,
        isConfidential: true,
        sizeBytes: record.size_bytes,
        relativePath: record.relative_path
      })
    } catch (err) {
      errors.push({
        path: sourcePath,
        message: err instanceof Error ? err.message : String(err)
      })
    }
  }

  return { ok: errors.length === 0, ingested, errors }
}
