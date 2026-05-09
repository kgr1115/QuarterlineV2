import type { Workspace } from './workspace-manager'

export type SynthesisCardDraft = {
  cardType: 'market_overview' | 'trend_alert' | 'anomaly' | 'opportunity'
  title: string
  body: string
  metricValue: number | null
  metricUnit: string | null
  direction: 'up' | 'down' | 'flat' | null
}

export type SynthesisGenerationInput = {
  workspace: Workspace
  marketStats: Array<{
    propertyClass: string
    subclass: string | null
    netRentableArea_MSF: number | null
    totalVacancy_pct: number | null
    totalAvailability_pct: number | null
    avgDirectAskingRate_dollarsSF: number | null
    currentQuarterNetAbsorption_SF: number | null
    underConstruction_SF: number | null
  }>
  submarketStats: Array<{
    submarket: string
    netRentableArea_MSF: number | null
    totalAvailability_pct: number | null
    currentQuarterNetAbsorption_SF: number | null
  }>
  propertyCount: number
  leaseCount: number
}

export type SynthesisGenerationResult = {
  cards: SynthesisCardDraft[]
  usage?: {
    inputTokens: number
    outputTokens: number
    cacheReadTokens: number
    cacheCreationTokens: number
  }
}

export type NarrativeGenerationInput = {
  workspace: Workspace
  section: string
  context: string
}

export type NarrativeGenerationResult = {
  markdown: string
  usage?: {
    inputTokens: number
    outputTokens: number
    cacheReadTokens: number
    cacheCreationTokens: number
  }
}

export interface AiProviderAdapter {
  testConnection(): Promise<{ ok: true } | { ok: false; message: string }>
  generateSynthesis(input: SynthesisGenerationInput): Promise<SynthesisGenerationResult>
  generateNarrative(input: NarrativeGenerationInput): Promise<NarrativeGenerationResult>
}
