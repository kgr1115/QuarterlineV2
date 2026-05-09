import { BrowserWindow } from 'electron'
import { mkdirSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'
import type Database from 'better-sqlite3'
import { getWorkspaceFolder } from './paths'
import type { Workspace } from './workspace-manager'

export type ExportResult = {
  relativePath: string
  absolutePath: string
  sizeBytes: number
  generatedAt: string
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })
  try {
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
    await win.loadURL(dataUrl)
    await new Promise((resolve) => setTimeout(resolve, 300))
    const buffer = await win.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
      pageSize: 'Letter'
    })
    return buffer
  } finally {
    if (!win.isDestroyed()) win.destroy()
  }
}

export async function exportReportPdf(
  db: Database.Database,
  workspace: Workspace,
  html: string
): Promise<ExportResult> {
  const buffer = await htmlToPdfBuffer(html)

  const exportsDir = join(getWorkspaceFolder(workspace.id), 'exports')
  mkdirSync(exportsDir, { recursive: true })

  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19)
  const filename = `${sanitizeFilename(workspace.name)}_${stamp}.pdf`
  const absolutePath = join(exportsDir, filename)
  const relativePath = `exports/${filename}`

  writeFileSync(absolutePath, buffer)
  const stats = statSync(absolutePath)
  const generatedAt = new Date().toISOString()

  db.prepare(
    `INSERT INTO report_export (format, relative_path, generated_at, size_bytes)
     VALUES ('pdf', ?, ?, ?)`
  ).run(relativePath, generatedAt, stats.size)

  return {
    relativePath,
    absolutePath,
    sizeBytes: stats.size,
    generatedAt
  }
}

export type ExportRow = {
  id: number
  format: string
  relativePath: string
  generatedAt: string
  sizeBytes: number
}

export function listExports(db: Database.Database): ExportRow[] {
  const rows = db
    .prepare(
      `SELECT id, format, relative_path, generated_at, size_bytes
         FROM report_export
        ORDER BY generated_at DESC`
    )
    .all() as Array<{
    id: number
    format: string
    relative_path: string
    generated_at: string
    size_bytes: number
  }>
  return rows.map((row) => ({
    id: row.id,
    format: row.format,
    relativePath: row.relative_path,
    generatedAt: row.generated_at,
    sizeBytes: row.size_bytes
  }))
}
