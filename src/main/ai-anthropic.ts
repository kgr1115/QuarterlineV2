import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import type {
  AiProviderAdapter,
  NarrativeGenerationInput,
  NarrativeGenerationResult,
  SynthesisGenerationInput,
  SynthesisGenerationResult
} from './ai-provider'

const SYNTHESIS_SYSTEM_PROMPT = `You are a senior commercial real estate research analyst.

You write tight, evidence-based market synthesis cards for an institutional CRE quarterly report. Each card surfaces ONE insight tied to a specific number from the data the user provides.

When you generate cards, follow these rules:
- Be specific. Cite numbers from the data — vacancy %, absorption SF, rent $/SF, submarket names.
- Use parentheses for negative numbers: (443,000) not -443,000.
- Use SF for square feet, MSF for millions of square feet, $/SF for per-square-foot rates.
- Keep card bodies to 2 short sentences. Lead with the finding, follow with the why or the implication.
- Pick the card type that best fits the insight:
  - "market_overview" — headline narrative for the quarter (one per workspace, max).
  - "trend_alert" — a directional change the analyst should call out.
  - "anomaly" — a number or movement that doesn't fit the pattern.
  - "opportunity" — a leasing or capital-markets opportunity implied by the data.
- Set direction = "up" / "down" / "flat" based on the metric movement; null if the card isn't about a trend.
- Use null for metricValue / metricUnit if the card is qualitative.
- Do not fabricate data. If a metric isn't in the input, do not invent it.

Generate 3 to 5 cards covering distinct insights.`

const SynthesisCardSchema = z.object({
  cardType: z.enum(['market_overview', 'trend_alert', 'anomaly', 'opportunity']),
  title: z.string().describe('Short headline, < 80 chars.'),
  body: z.string().describe('1-2 sentence body with cited numbers.'),
  metricValue: z
    .number()
    .nullable()
    .describe('The headline metric for this card, or null if qualitative.'),
  metricUnit: z
    .string()
    .nullable()
    .describe('Unit for metricValue (e.g., "%", "$/SF", "SF") or null.'),
  direction: z
    .enum(['up', 'down', 'flat'])
    .nullable()
    .describe('Trend direction or null if not a trend card.')
})

const SynthesisResponseSchema = z.object({
  cards: z.array(SynthesisCardSchema).min(1).max(8)
})

const NARRATIVE_SYSTEM_PROMPT = `You are a senior commercial real estate research analyst writing a section of a quarterly market report. Write as the analyst, not as an AI.

Style:
- 2-3 paragraphs, dense but readable.
- Cite specific numbers from the provided data.
- Refer to submarkets, property classes, and tenants by name.
- Use parentheses for negative numbers: (443,000) not -443,000.
- Use SF, MSF, $/SF FSG/yr.
- No bullet lists, no headings — just prose.
- Do not fabricate data. If a number isn't in the input, do not invent it.`

function buildSynthesisUserMessage(input: SynthesisGenerationInput): string {
  const lines: string[] = [
    `Workspace: ${input.workspace.name}`,
    `Market: ${input.workspace.market}`,
    `Property type: ${input.workspace.propertyType}`,
    `Quarter: ${input.workspace.currentQuarter}`,
    '',
    `Inventory: ${input.propertyCount} properties, ${input.leaseCount} leases tracked.`,
    '',
    'MARKET STATISTICS BY CLASS:'
  ]
  for (const row of input.marketStats) {
    const subclass = row.subclass ? ` (${row.subclass})` : ''
    lines.push(
      `- ${row.propertyClass}${subclass}: ${row.netRentableArea_MSF ?? '—'} MSF | ` +
        `vacancy ${row.totalVacancy_pct ?? '—'}% | ` +
        `availability ${row.totalAvailability_pct ?? '—'}% | ` +
        `asking rate $${row.avgDirectAskingRate_dollarsSF ?? '—'}/SF | ` +
        `qtr net abs ${row.currentQuarterNetAbsorption_SF ?? '—'} SF | ` +
        `under construction ${row.underConstruction_SF ?? '—'} SF`
    )
  }
  if (input.submarketStats.length > 0) {
    lines.push('', 'SUBMARKET STATISTICS:')
    for (const row of input.submarketStats) {
      lines.push(
        `- ${row.submarket}: ${row.netRentableArea_MSF ?? '—'} MSF | ` +
          `availability ${row.totalAvailability_pct ?? '—'}% | ` +
          `qtr net abs ${row.currentQuarterNetAbsorption_SF ?? '—'} SF`
      )
    }
  }
  lines.push(
    '',
    'Generate 3 to 5 synthesis cards covering the most important insights for the analyst.'
  )
  return lines.join('\n')
}

export class AnthropicAdapter implements AiProviderAdapter {
  private client: Anthropic
  private model: string

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey })
    this.model = model
  }

  async testConnection(): Promise<{ ok: true } | { ok: false; message: string }> {
    try {
      await this.client.messages.create({
        model: this.model,
        max_tokens: 16,
        messages: [{ role: 'user', content: 'ping' }]
      })
      return { ok: true }
    } catch (err) {
      if (err instanceof Anthropic.AuthenticationError) {
        return { ok: false, message: 'Invalid API key.' }
      }
      if (err instanceof Anthropic.PermissionDeniedError) {
        return {
          ok: false,
          message: 'API key does not have permission for this model.'
        }
      }
      if (err instanceof Anthropic.NotFoundError) {
        return { ok: false, message: `Model "${this.model}" not found.` }
      }
      if (err instanceof Anthropic.APIError) {
        return { ok: false, message: `${err.status}: ${err.message}` }
      }
      return {
        ok: false,
        message: err instanceof Error ? err.message : 'Unknown error.'
      }
    }
  }

  async generateSynthesis(
    input: SynthesisGenerationInput
  ): Promise<SynthesisGenerationResult> {
    const response = await this.client.messages.parse({
      model: this.model,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'medium',
        format: zodOutputFormat(SynthesisResponseSchema)
      },
      system: [
        {
          type: 'text',
          text: SYNTHESIS_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [
        { role: 'user', content: buildSynthesisUserMessage(input) }
      ]
    })

    const parsed = response.parsed_output
    if (!parsed) {
      throw new Error(
        `AI response could not be parsed against the synthesis schema (stop_reason=${response.stop_reason}).`
      )
    }

    return {
      cards: parsed.cards.map((card) => ({
        cardType: card.cardType,
        title: card.title,
        body: card.body,
        metricValue: card.metricValue,
        metricUnit: card.metricUnit,
        direction: card.direction
      })),
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
        cacheCreationTokens: response.usage.cache_creation_input_tokens ?? 0
      }
    }
  }

  async generateNarrative(
    input: NarrativeGenerationInput
  ): Promise<NarrativeGenerationResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'medium' },
      system: [
        {
          type: 'text',
          text: NARRATIVE_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [
        {
          role: 'user',
          content: `Write the "${input.section}" section for the ${input.workspace.market} ${input.workspace.propertyType} ${input.workspace.currentQuarter} report.\n\nContext:\n${input.context}`
        }
      ]
    })

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n\n')
      .trim()

    return {
      markdown: text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
        cacheCreationTokens: response.usage.cache_creation_input_tokens ?? 0
      }
    }
  }
}
