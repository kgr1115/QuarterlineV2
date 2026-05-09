import type Database from 'better-sqlite3'
import { AnthropicAdapter } from './ai-anthropic'
import type {
  AiProviderAdapter,
  NarrativeGenerationResult,
  SynthesisGenerationResult
} from './ai-provider'
import { getActiveProvider, getDecryptedApiKey } from './ai-config'
import type { Workspace } from './workspace-manager'

function getAdapter(): AiProviderAdapter {
  const active = getActiveProvider()
  if (!active) {
    throw new Error(
      'No AI provider is configured. Open Settings → AI Provider to add a key.'
    )
  }
  const key = getDecryptedApiKey()
  if (!key) {
    throw new Error(
      'AI provider is configured but the stored key cannot be decrypted on this system.'
    )
  }
  switch (active.provider) {
    case 'anthropic':
      return new AnthropicAdapter(key, active.model)
    default:
      throw new Error(`Unsupported AI provider: ${active.provider}`)
  }
}

export async function testActiveProviderConnection(): Promise<
  { ok: true } | { ok: false; message: string }
> {
  try {
    const adapter = getAdapter()
    return await adapter.testConnection()
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Unknown error.'
    }
  }
}

export async function generateSynthesisForWorkspace(
  db: Database.Database,
  workspace: Workspace
): Promise<{ inserted: number; usage: SynthesisGenerationResult['usage'] }> {
  const adapter = getAdapter()

  const marketStats = db
    .prepare(
      `SELECT property_class, subclass, net_rentable_area_msf,
              total_vacancy_pct, total_availability_pct,
              avg_direct_asking_rate_dollars_sf,
              current_quarter_net_absorption_sf,
              under_construction_sf
         FROM market_statistic
        WHERE quarter = ?
        ORDER BY property_class, subclass`
    )
    .all(workspace.currentQuarter) as Array<{
    property_class: string
    subclass: string | null
    net_rentable_area_msf: number | null
    total_vacancy_pct: number | null
    total_availability_pct: number | null
    avg_direct_asking_rate_dollars_sf: number | null
    current_quarter_net_absorption_sf: number | null
    under_construction_sf: number | null
  }>

  const submarketStats = db
    .prepare(
      `SELECT submarket, net_rentable_area_msf, total_availability_pct,
              current_quarter_net_absorption_sf
         FROM submarket_statistic
        WHERE quarter = ?
        ORDER BY net_rentable_area_msf DESC`
    )
    .all(workspace.currentQuarter) as Array<{
    submarket: string
    net_rentable_area_msf: number | null
    total_availability_pct: number | null
    current_quarter_net_absorption_sf: number | null
  }>

  const { n: propertyCount } = db
    .prepare('SELECT COUNT(*) AS n FROM property')
    .get() as { n: number }
  const { n: leaseCount } = db
    .prepare('SELECT COUNT(*) AS n FROM lease')
    .get() as { n: number }

  if (marketStats.length === 0 && submarketStats.length === 0) {
    throw new Error(
      'No market or submarket statistics imported yet for this quarter; AI has no data to synthesize.'
    )
  }

  const result = await adapter.generateSynthesis({
    workspace,
    marketStats: marketStats.map((row) => ({
      propertyClass: row.property_class,
      subclass: row.subclass,
      netRentableArea_MSF: row.net_rentable_area_msf,
      totalVacancy_pct: row.total_vacancy_pct,
      totalAvailability_pct: row.total_availability_pct,
      avgDirectAskingRate_dollarsSF: row.avg_direct_asking_rate_dollars_sf,
      currentQuarterNetAbsorption_SF: row.current_quarter_net_absorption_sf,
      underConstruction_SF: row.under_construction_sf
    })),
    submarketStats: submarketStats.map((row) => ({
      submarket: row.submarket,
      netRentableArea_MSF: row.net_rentable_area_msf,
      totalAvailability_pct: row.total_availability_pct,
      currentQuarterNetAbsorption_SF: row.current_quarter_net_absorption_sf
    })),
    propertyCount,
    leaseCount
  })

  const insert = db.prepare(
    `INSERT INTO ai_synthesis_card
       (quarter, card_type, title, body, metric_value, metric_unit,
        direction, source, generated_at, pinned)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'built-in-ai', ?, 0)`
  )
  const now = new Date().toISOString()
  let inserted = 0
  db.transaction(() => {
    for (const card of result.cards) {
      insert.run(
        workspace.currentQuarter,
        card.cardType,
        card.title,
        card.body,
        card.metricValue,
        card.metricUnit,
        card.direction,
        now
      )
      inserted++
    }
  })()

  return { inserted, usage: result.usage }
}

export async function generateNarrativeForSection(
  workspace: Workspace,
  section: string,
  context: string
): Promise<NarrativeGenerationResult> {
  const adapter = getAdapter()
  return adapter.generateNarrative({ workspace, section, context })
}
