import type Database from 'better-sqlite3'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { getWorkspaceFolder } from './paths'

export type ReportSection = {
  id: number
  sectionKey: string
  title: string
  narrativePath: string
  position: number
  includeInReport: boolean
  createdAt: string
  updatedAt: string
  narrativeContent: string
}

const DEFAULT_SECTIONS: Array<{
  sectionKey: string
  title: string
  narrativePath: string
}> = [
  {
    sectionKey: 'market-overview',
    title: 'Market Overview',
    narrativePath: 'narratives/market-overview.md'
  },
  {
    sectionKey: 'availability',
    title: 'Availability',
    narrativePath: 'narratives/availability.md'
  },
  {
    sectionKey: 'asking-rent',
    title: 'Asking Rent',
    narrativePath: 'narratives/asking-rent.md'
  },
  {
    sectionKey: 'net-absorption',
    title: 'Net Absorption',
    narrativePath: 'narratives/net-absorption.md'
  },
  {
    sectionKey: 'construction-activity',
    title: 'Construction Activity',
    narrativePath: 'narratives/construction-activity.md'
  },
  {
    sectionKey: 'leasing-activity',
    title: 'Leasing Activity',
    narrativePath: 'narratives/leasing-activity.md'
  }
]

export function ensureDefaultSections(db: Database.Database): void {
  const count = db
    .prepare('SELECT COUNT(*) AS n FROM report_section')
    .get() as { n: number }
  if (count.n > 0) return

  const insert = db.prepare(
    `INSERT INTO report_section
       (section_key, title, narrative_path, position, include_in_report,
        created_at, updated_at)
     VALUES (?, ?, ?, ?, 1, ?, ?)`
  )
  const now = new Date().toISOString()
  db.transaction(() => {
    DEFAULT_SECTIONS.forEach((section, idx) => {
      insert.run(
        section.sectionKey,
        section.title,
        section.narrativePath,
        idx + 1,
        now,
        now
      )
    })
  })()
}

function readNarrative(workspaceId: string, narrativePath: string): string {
  const abs = join(getWorkspaceFolder(workspaceId), narrativePath)
  if (!existsSync(abs)) return ''
  try {
    return readFileSync(abs, 'utf8')
  } catch {
    return ''
  }
}

function writeNarrative(
  workspaceId: string,
  narrativePath: string,
  content: string
): void {
  const abs = join(getWorkspaceFolder(workspaceId), narrativePath)
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, content, 'utf8')
}

type SectionRow = {
  id: number
  section_key: string
  title: string
  narrative_path: string
  position: number
  include_in_report: number
  created_at: string
  updated_at: string
}

function rowToSection(row: SectionRow, workspaceId: string): ReportSection {
  return {
    id: row.id,
    sectionKey: row.section_key,
    title: row.title,
    narrativePath: row.narrative_path,
    position: row.position,
    includeInReport: row.include_in_report === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    narrativeContent: readNarrative(workspaceId, row.narrative_path)
  }
}

export function listSections(
  db: Database.Database,
  workspaceId: string
): ReportSection[] {
  ensureDefaultSections(db)
  const rows = db
    .prepare(
      `SELECT id, section_key, title, narrative_path, position,
              include_in_report, created_at, updated_at
         FROM report_section
        ORDER BY position ASC, id ASC`
    )
    .all() as SectionRow[]
  return rows.map((row) => rowToSection(row, workspaceId))
}

export function updateSectionNarrative(
  db: Database.Database,
  workspaceId: string,
  sectionId: number,
  content: string
): ReportSection {
  const row = db
    .prepare('SELECT * FROM report_section WHERE id = ?')
    .get(sectionId) as SectionRow | undefined
  if (!row) throw new Error(`Section ${sectionId} not found`)
  writeNarrative(workspaceId, row.narrative_path, content)
  const now = new Date().toISOString()
  db.prepare('UPDATE report_section SET updated_at = ? WHERE id = ?').run(
    now,
    sectionId
  )
  return rowToSection({ ...row, updated_at: now }, workspaceId)
}

export function reorderSections(
  db: Database.Database,
  workspaceId: string,
  orderedIds: number[]
): ReportSection[] {
  const update = db.prepare(
    'UPDATE report_section SET position = ?, updated_at = ? WHERE id = ?'
  )
  const now = new Date().toISOString()
  db.transaction(() => {
    orderedIds.forEach((id, idx) => update.run(idx + 1, now, id))
  })()
  return listSections(db, workspaceId)
}

export function setSectionIncluded(
  db: Database.Database,
  workspaceId: string,
  sectionId: number,
  included: boolean
): ReportSection[] {
  db.prepare(
    'UPDATE report_section SET include_in_report = ?, updated_at = ? WHERE id = ?'
  ).run(included ? 1 : 0, new Date().toISOString(), sectionId)
  return listSections(db, workspaceId)
}

export function addCustomSection(
  db: Database.Database,
  workspaceId: string,
  title: string
): ReportSection[] {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'section'
  const sectionKey = `custom-${slug}-${Date.now().toString(36)}`
  const narrativePath = `narratives/custom/${slug}.md`

  const max = db
    .prepare('SELECT COALESCE(MAX(position), 0) AS m FROM report_section')
    .get() as { m: number }
  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO report_section
       (section_key, title, narrative_path, position, include_in_report,
        created_at, updated_at)
     VALUES (?, ?, ?, ?, 1, ?, ?)`
  ).run(sectionKey, title.trim(), narrativePath, max.m + 1, now, now)

  // Seed the file if it doesn't exist.
  const abs = join(getWorkspaceFolder(workspaceId), narrativePath)
  if (!existsSync(abs)) writeNarrative(workspaceId, narrativePath, '')

  return listSections(db, workspaceId)
}

export function deleteSection(
  db: Database.Database,
  workspaceId: string,
  sectionId: number
): ReportSection[] {
  db.prepare('DELETE FROM report_section WHERE id = ?').run(sectionId)
  return listSections(db, workspaceId)
}
