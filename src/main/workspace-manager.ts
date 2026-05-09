import Database from 'better-sqlite3'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import {
  getWorkspaceDbPath,
  getWorkspaceFolder,
  getWorkspaceManifestPath,
  getWorkspacesRoot
} from './paths'
import { renderWorkspaceManifest } from './workspace-manifest'
import {
  insertWorkspaceRow,
  openWorkspaceDb,
  readWorkspaceRow,
  touchWorkspace,
  type WorkspaceRow
} from './workspace-db'
import { updateAppConfig } from './app-config'

export type Workspace = {
  id: string
  name: string
  market: string
  propertyType: string
  currentQuarter: string
  createdAt: string
  updatedAt: string
}

export type WorkspaceCreateInput = {
  name: string
  market: string
  propertyType: string
  quarter: string
}

const WORKSPACE_SUBFOLDERS = [
  'data',
  'narratives',
  'narratives/custom',
  'notes',
  'sources',
  'exports',
  '.quarterline'
]

let activeDb: Database.Database | null = null
let activeWorkspaceId: string | null = null

function rowToWorkspace(row: WorkspaceRow): Workspace {
  return {
    id: row.id,
    name: row.name,
    market: row.market,
    propertyType: row.property_type,
    currentQuarter: row.current_quarter,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

function uniqueWorkspaceId(name: string): string {
  const base = slugify(name) || 'workspace'
  const root = getWorkspacesRoot()
  if (!existsSync(getWorkspaceFolder(base))) return base

  let suffix = 2
  while (existsSync(getWorkspaceFolder(`${base}-${suffix}`))) {
    suffix++
    if (suffix > 999) {
      throw new Error(`Could not generate unique id for "${name}" under ${root}`)
    }
  }
  return `${base}-${suffix}`
}

function listWorkspaceIds(): string[] {
  const root = getWorkspacesRoot()
  if (!existsSync(root)) return []
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((id) => existsSync(getWorkspaceDbPath(id)))
}

function readWorkspaceById(id: string): Workspace | null {
  if (!existsSync(getWorkspaceDbPath(id))) return null
  const db = new Database(getWorkspaceDbPath(id), { readonly: true })
  try {
    const row = db.prepare('SELECT * FROM workspace LIMIT 1').get() as
      | WorkspaceRow
      | undefined
    return row ? rowToWorkspace(row) : null
  } finally {
    db.close()
  }
}

export function listWorkspaces(): Workspace[] {
  return listWorkspaceIds()
    .map((id) => readWorkspaceById(id))
    .filter((ws): ws is Workspace => ws !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

function ensureWorkspaceFolders(id: string): void {
  const root = getWorkspaceFolder(id)
  mkdirSync(root, { recursive: true })
  for (const sub of WORKSPACE_SUBFOLDERS) {
    mkdirSync(`${root}/${sub}`, { recursive: true })
  }
}

function writeManifest(workspace: Workspace): void {
  const manifestPath = getWorkspaceManifestPath(workspace.id)
  mkdirSync(dirname(manifestPath), { recursive: true })
  const content = renderWorkspaceManifest({
    name: workspace.name,
    market: workspace.market,
    propertyType: workspace.propertyType,
    quarter: workspace.currentQuarter,
    lastUpdated: workspace.updatedAt
  })
  writeFileSync(manifestPath, content, 'utf8')
}

export function createWorkspace(input: WorkspaceCreateInput): Workspace {
  const trimmedName = input.name.trim()
  if (!trimmedName) throw new Error('Workspace name is required')
  if (!input.market.trim()) throw new Error('Market is required')
  if (!input.propertyType.trim()) throw new Error('Property type is required')
  if (!input.quarter.trim()) throw new Error('Quarter is required')

  const id = uniqueWorkspaceId(trimmedName)
  ensureWorkspaceFolders(id)

  const now = new Date().toISOString()
  const row: WorkspaceRow = {
    id,
    name: trimmedName,
    market: input.market.trim(),
    property_type: input.propertyType.trim(),
    current_quarter: input.quarter.trim(),
    created_at: now,
    updated_at: now,
    settings: '{}'
  }

  const db = openWorkspaceDb(id)
  try {
    insertWorkspaceRow(db, row)
  } finally {
    db.close()
  }

  const workspace = rowToWorkspace(row)
  writeManifest(workspace)
  return workspace
}

export function openWorkspace(id: string): Workspace {
  if (!existsSync(getWorkspaceDbPath(id))) {
    throw new Error(`Workspace "${id}" not found`)
  }

  if (activeWorkspaceId !== id) {
    closeActiveWorkspace()
    activeDb = openWorkspaceDb(id)
    activeWorkspaceId = id
  }

  const row = readWorkspaceRow(activeDb!)
  if (!row) throw new Error(`Workspace "${id}" has no metadata row`)

  touchWorkspace(activeDb!, id)
  const fresh = readWorkspaceRow(activeDb!)
  if (!fresh) throw new Error(`Workspace "${id}" disappeared during open`)

  const workspace = rowToWorkspace(fresh)
  writeManifest(workspace)
  updateAppConfig({ lastWorkspaceId: id })
  return workspace
}

export function getActiveWorkspace(): Workspace | null {
  if (!activeDb || !activeWorkspaceId) return null
  const row = readWorkspaceRow(activeDb)
  return row ? rowToWorkspace(row) : null
}

export function getActiveWorkspaceDb(): Database.Database | null {
  return activeDb
}

export function closeActiveWorkspace(): void {
  if (activeDb) {
    activeDb.close()
    activeDb = null
  }
  activeWorkspaceId = null
}

export function clearLastWorkspace(): void {
  closeActiveWorkspace()
  updateAppConfig({ lastWorkspaceId: null })
}
