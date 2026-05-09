import { app } from 'electron'
import { existsSync, readFileSync, rmSync, statSync, writeFileSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'
import { tmpdir } from 'os'
import {
  createWorkspace,
  openWorkspace,
  closeActiveWorkspace,
  getActiveWorkspaceDb,
  getActiveWorkspace,
  refreshWorkspaceArtifacts
} from '../src/main/workspace-manager'
import {
  importMarketStatistics,
  importSubmarketStatistics
} from '../src/main/csv-import'
import { importPropertyAndLeaseData } from '../src/main/json-import'
import { ingestSourceFiles } from '../src/main/source-ingest'
import { getWorkspaceFolder, getQuarterlineRoot } from '../src/main/paths'
import { homedir } from 'os'

type Check = { label: string; ok: boolean; detail?: string }

const checks: Check[] = []

function check(label: string, ok: boolean, detail?: string): void {
  checks.push({ label, ok, detail })
  const icon = ok ? '✓' : '✗'
  console.log(`${icon} ${label}${detail ? `\n    ${detail}` : ''}`)
}

function fail(label: string, err: unknown): never {
  const msg = err instanceof Error ? err.stack ?? err.message : String(err)
  console.error(`✗ ${label}\n    ${msg}`)
  process.exit(1)
}

const SAMPLES = resolve(process.cwd(), 'docs/reference-artifacts/samples')

function makeTempSourceFile(): string {
  const dir = join(tmpdir(), 'quarterline-smoke')
  mkdirSync(dir, { recursive: true })
  const path = join(dir, `smoke-source-${Date.now()}.txt`)
  writeFileSync(path, 'A confidential lease abstract used as a smoke test fixture.\n')
  return path
}

async function run(): Promise<void> {
  const workspaceName = `Smoke Test ${new Date().toISOString().replace(/[:.]/g, '-')}`

  let workspaceId: string

  try {
    const created = createWorkspace({
      name: workspaceName,
      market: 'Atlanta',
      propertyType: 'Office',
      quarter: 'Q1 2026'
    })
    workspaceId = created.id
    check('workspace created', true, `id=${created.id}`)
  } catch (err) {
    fail('workspace create', err)
  }

  try {
    const folder = getWorkspaceFolder(workspaceId)
    check('workspace folder exists', existsSync(folder), folder)
    for (const sub of ['data', 'narratives', 'narratives/custom', 'notes', 'sources', 'exports', '.quarterline']) {
      check(`subfolder ${sub}`, existsSync(join(folder, sub)))
    }
    check('WORKSPACE.md exists', existsSync(join(folder, 'WORKSPACE.md')))
    check('workspace.db exists', existsSync(join(folder, 'workspace.db')))
  } catch (err) {
    fail('folder layout', err)
  }

  try {
    openWorkspace(workspaceId)
    check('workspace opened', getActiveWorkspace()?.id === workspaceId)
  } catch (err) {
    fail('workspace open', err)
  }

  const db = getActiveWorkspaceDb()
  if (!db) fail('active db', new Error('null db'))

  try {
    const csv = readFileSync(
      join(SAMPLES, 'atlanta-market-stats-q1-2026.csv'),
      'utf8'
    )
    const result = importMarketStatistics(db!, csv, 'Q1 2026')
    check(
      'market stats import',
      result.ok && result.rowCount === 4,
      `ok=${result.ok}, rows=${result.rowCount}, errs=${result.errors.length}`
    )
    refreshWorkspaceArtifacts()
  } catch (err) {
    fail('market stats import', err)
  }

  try {
    const csv = readFileSync(
      join(SAMPLES, 'atlanta-submarket-stats-q1-2026.csv'),
      'utf8'
    )
    const result = importSubmarketStatistics(db!, csv, 'Q1 2026')
    check(
      'submarket stats import',
      result.ok && result.rowCount === 5,
      `ok=${result.ok}, rows=${result.rowCount}, errs=${result.errors.length}`
    )
    refreshWorkspaceArtifacts()
  } catch (err) {
    fail('submarket stats import', err)
  }

  try {
    const json = readFileSync(
      join(SAMPLES, 'atlanta-properties-leases.json'),
      'utf8'
    )
    const result = importPropertyAndLeaseData(db!, json)
    check(
      'property/lease import',
      result.ok && result.propertiesImported === 3 && result.leasesImported === 3,
      `ok=${result.ok}, props=${result.propertiesImported}, leases=${result.leasesImported}, errs=${result.errors.length}`
    )
    refreshWorkspaceArtifacts()
  } catch (err) {
    fail('property/lease import', err)
  }

  try {
    const tempPath = makeTempSourceFile()
    const result = ingestSourceFiles(db!, workspaceId, [tempPath])
    check(
      'source file ingest',
      result.ok && result.ingested.length === 1,
      `ingested=${result.ingested.length}, errs=${result.errors.length}`
    )
    refreshWorkspaceArtifacts()
  } catch (err) {
    fail('source ingest', err)
  }

  try {
    const folder = getWorkspaceFolder(workspaceId)
    const dataDir = join(folder, 'data')
    for (const name of [
      'market-statistics.json',
      'submarket-statistics.json',
      'property-data.json',
      'lease-data.json'
    ]) {
      const path = join(dataDir, name)
      const exists = existsSync(path)
      const size = exists ? statSync(path).size : 0
      check(`data/${name}`, exists && size > 0, `size=${size}b`)
    }
    const market = JSON.parse(
      readFileSync(join(dataDir, 'market-statistics.json'), 'utf8')
    )
    check(
      'market-statistics.json has 4 rows + correct context',
      market.statistics?.length === 4 &&
        market.market === 'Atlanta' &&
        market.quarter === 'Q1 2026'
    )
  } catch (err) {
    fail('data export verification', err)
  }

  try {
    const manifest = readFileSync(
      join(getWorkspaceFolder(workspaceId), 'WORKSPACE.md'),
      'utf8'
    )
    check(
      'WORKSPACE.md context block',
      manifest.includes('**Workspace**: ' + workspaceName) &&
        manifest.includes('**Market**: Atlanta') &&
        manifest.includes('**Quarter**: Q1 2026')
    )
    check(
      'WORKSPACE.md data summary populated',
      manifest.includes('Market statistic rows: 4') &&
        manifest.includes('Submarket statistic rows: 5') &&
        manifest.includes('Properties: 3') &&
        manifest.includes('Leases: 3')
    )
    check(
      'WORKSPACE.md does not reference sources/',
      !manifest.includes('sources/smoke-source')
    )
  } catch (err) {
    fail('manifest verification', err)
  }

  try {
    const folder = getWorkspaceFolder(workspaceId)
    const sourcesDir = join(folder, 'sources')
    const sourcesContents = require('fs').readdirSync(sourcesDir) as string[]
    check(
      'sources/ directory contains exactly 1 file',
      sourcesContents.length === 1,
      `files=${sourcesContents.join(', ')}`
    )
    for (const name of [
      'market-statistics.json',
      'submarket-statistics.json',
      'property-data.json',
      'lease-data.json'
    ]) {
      const content = readFileSync(
        join(folder, 'data', name),
        'utf8'
      )
      check(
        `data/${name} does NOT contain source path`,
        !content.includes('smoke-source')
      )
    }
  } catch (err) {
    fail('source isolation verification', err)
  }

  try {
    const malformed = [
      'Subclass,Net Rentable Area (MSF),Total Vacancy (%)',
      'Trophy,12.45,15.2',
      'Prime,20.61,17.0'
    ].join('\n')
    const result = importMarketStatistics(db!, malformed, 'Q1 2026')
    const headerError = result.errors.some(
      (e) => e.row === 0 && e.column === 'property_class'
    )
    check(
      'malformed CSV (missing required Property Class column) rejected',
      !result.ok && headerError,
      `errors=${result.errors.length}`
    )
  } catch (err) {
    fail('malformed csv rejection', err)
  }

  closeActiveWorkspace()

  try {
    const folder = getWorkspaceFolder(workspaceId)
    rmSync(folder, { recursive: true, force: true })
    check('cleanup workspace folder removed', !existsSync(folder))
  } catch (err) {
    fail('cleanup', err)
  }

  const failed = checks.filter((c) => !c.ok)
  console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`)
  if (failed.length > 0) {
    console.log('FAILED:')
    for (const f of failed) console.log(`  - ${f.label}${f.detail ? ` (${f.detail})` : ''}`)
    process.exit(1)
  }
  process.exit(0)
}

console.log(`Quarterline V2 smoke test`)
console.log(`Quarterline root: ${getQuarterlineRoot()}`)
console.log(`Home: ${homedir()}`)
console.log('')

app
  .whenReady()
  .then(() => run())
  .catch((err) => fail('top-level', err))
