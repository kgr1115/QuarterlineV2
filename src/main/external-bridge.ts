import { existsSync, readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'fs'
import { join, relative } from 'path'
import { createHash } from 'crypto'
import { getWorkspaceFolder } from './paths'

export type ExternalChange = {
  relativePath: string
  absolutePath: string
  status: 'created' | 'modified' | 'deleted'
  modifiedAt: string
  sizeBytes: number
  preview: string
}

type SnapshotEntry = {
  hash: string
  modifiedAt: string
  sizeBytes: number
}

type Snapshot = {
  scannedAt: string
  files: Record<string, SnapshotEntry>
}

const TRACKED_DIRS = ['narratives', 'notes']
const SNAPSHOT_FILENAME = 'last-scan.json'

function snapshotPath(workspaceId: string): string {
  return join(
    getWorkspaceFolder(workspaceId),
    '.quarterline',
    SNAPSHOT_FILENAME
  )
}

function readSnapshot(workspaceId: string): Snapshot {
  const path = snapshotPath(workspaceId)
  if (!existsSync(path)) {
    return { scannedAt: new Date(0).toISOString(), files: {} }
  }
  try {
    const raw = readFileSync(path, 'utf8')
    const parsed = JSON.parse(raw) as Partial<Snapshot>
    return {
      scannedAt: parsed.scannedAt ?? new Date(0).toISOString(),
      files: parsed.files ?? {}
    }
  } catch {
    return { scannedAt: new Date(0).toISOString(), files: {} }
  }
}

function writeSnapshot(workspaceId: string, snap: Snapshot): void {
  const path = snapshotPath(workspaceId)
  mkdirSync(join(getWorkspaceFolder(workspaceId), '.quarterline'), {
    recursive: true
  })
  writeFileSync(path, JSON.stringify(snap, null, 2), 'utf8')
}

function walkMarkdown(root: string, base: string, out: string[]): void {
  if (!existsSync(root)) return
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const abs = join(root, entry.name)
    if (entry.isDirectory()) {
      walkMarkdown(abs, base, out)
    } else if (entry.isFile() && /\.md$/i.test(entry.name)) {
      out.push(relative(base, abs).replace(/\\/g, '/'))
    }
  }
}

function hashFile(absolutePath: string): string {
  const buf = readFileSync(absolutePath)
  return createHash('sha256').update(buf).digest('hex')
}

function previewFile(absolutePath: string, limit = 800): string {
  const text = readFileSync(absolutePath, 'utf8')
  if (text.length <= limit) return text
  return text.slice(0, limit) + '\n…'
}

export function scanExternalChanges(workspaceId: string): {
  scannedAt: string
  changes: ExternalChange[]
} {
  const root = getWorkspaceFolder(workspaceId)
  const scannedAt = new Date().toISOString()
  const previous = readSnapshot(workspaceId)
  const seen = new Set<string>()
  const currentEntries: Record<string, SnapshotEntry> = {}
  const changes: ExternalChange[] = []

  const tracked: string[] = []
  for (const dir of TRACKED_DIRS) {
    walkMarkdown(join(root, dir), root, tracked)
  }

  for (const rel of tracked) {
    const abs = join(root, rel)
    const stats = statSync(abs)
    const hash = hashFile(abs)
    const entry: SnapshotEntry = {
      hash,
      modifiedAt: stats.mtime.toISOString(),
      sizeBytes: stats.size
    }
    currentEntries[rel] = entry
    seen.add(rel)
    const prev = previous.files[rel]
    if (!prev) {
      changes.push({
        relativePath: rel,
        absolutePath: abs,
        status: 'created',
        modifiedAt: entry.modifiedAt,
        sizeBytes: entry.sizeBytes,
        preview: previewFile(abs)
      })
    } else if (prev.hash !== hash) {
      changes.push({
        relativePath: rel,
        absolutePath: abs,
        status: 'modified',
        modifiedAt: entry.modifiedAt,
        sizeBytes: entry.sizeBytes,
        preview: previewFile(abs)
      })
    }
  }

  for (const rel of Object.keys(previous.files)) {
    if (!seen.has(rel)) {
      changes.push({
        relativePath: rel,
        absolutePath: join(root, rel),
        status: 'deleted',
        modifiedAt: previous.files[rel].modifiedAt,
        sizeBytes: previous.files[rel].sizeBytes,
        preview: ''
      })
    }
  }

  return { scannedAt, changes }
}

export function acknowledgeExternalChanges(workspaceId: string): void {
  const root = getWorkspaceFolder(workspaceId)
  const tracked: string[] = []
  for (const dir of TRACKED_DIRS) {
    walkMarkdown(join(root, dir), root, tracked)
  }
  const files: Record<string, SnapshotEntry> = {}
  for (const rel of tracked) {
    const abs = join(root, rel)
    const stats = statSync(abs)
    files[rel] = {
      hash: hashFile(abs),
      modifiedAt: stats.mtime.toISOString(),
      sizeBytes: stats.size
    }
  }
  writeSnapshot(workspaceId, { scannedAt: new Date().toISOString(), files })
}
