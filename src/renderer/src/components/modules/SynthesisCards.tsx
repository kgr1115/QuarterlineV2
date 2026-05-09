import { useCallback, useEffect, useState } from 'react'
import type {
  SynthesisCard,
  SynthesisCardInput
} from '../../../../shared/ipc-channels'
import { useWorkspace } from '../../state/workspace'

const CARD_TYPES: { id: SynthesisCard['cardType']; label: string }[] = [
  { id: 'market_overview', label: 'Market Overview' },
  { id: 'trend_alert', label: 'Trend Alert' },
  { id: 'anomaly', label: 'Anomaly' },
  { id: 'opportunity', label: 'Opportunity' }
]

function CardForm({
  onSubmit,
  onCancel
}: {
  onSubmit: (input: SynthesisCardInput) => Promise<void>
  onCancel: () => void
}) {
  const [cardType, setCardType] = useState<SynthesisCard['cardType']>('market_overview')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || !body.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({
        cardType,
        title: title.trim(),
        body: body.trim()
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="synthesis-form" onSubmit={handleSubmit}>
      <select
        className="synthesis-form-input"
        value={cardType}
        onChange={(e) => setCardType(e.target.value as SynthesisCard['cardType'])}
      >
        {CARD_TYPES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
      <input
        className="synthesis-form-input"
        type="text"
        placeholder="Card title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="synthesis-form-input synthesis-form-body"
        placeholder="Insight body — keep it tight, 1–3 sentences."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        required
      />
      <div className="synthesis-form-actions">
        <button
          type="button"
          className="synthesis-btn-secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="synthesis-btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Saving…' : 'Save card'}
        </button>
      </div>
    </form>
  )
}

function CardItem({
  card,
  onTogglePin
}: {
  card: SynthesisCard
  onTogglePin: () => Promise<void>
}) {
  const typeLabel =
    CARD_TYPES.find((t) => t.id === card.cardType)?.label ?? 'Synthesis'
  return (
    <div className={`module-card synthesis-card ${card.pinned ? 'pinned' : ''}`}>
      <div className="module-header">
        <div className="synthesis-card-header">
          <span className="synthesis-card-type">{typeLabel}</span>
          <span className="synthesis-card-source">{card.source.replace('-', ' ')}</span>
        </div>
        <button
          type="button"
          className={`synthesis-pin ${card.pinned ? 'on' : ''}`}
          onClick={onTogglePin}
          title={card.pinned ? 'Unpin from report' : 'Pin to report'}
        >
          {card.pinned ? '◉' : '○'}
        </button>
      </div>
      <div className="module-body synthesis-card-body">
        <div className="synthesis-card-title">{card.title}</div>
        <div className="synthesis-card-text">{card.body}</div>
      </div>
    </div>
  )
}

export function SynthesisCards() {
  const { current } = useWorkspace()
  const [cards, setCards] = useState<SynthesisCard[]>([])
  const [adding, setAdding] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [aiConfigured, setAiConfigured] = useState(false)

  const refresh = useCallback(async () => {
    if (!current) {
      setCards([])
      return
    }
    const [list, cfg] = await Promise.all([
      window.quarterline.analysis.listSynthesis(),
      window.quarterline.ai.getConfig()
    ])
    setCards(list)
    setAiConfigured(cfg.hasKey)
  }, [current])

  useEffect(() => {
    void refresh()
  }, [refresh])

  if (!current) return null

  const onSubmit = async (input: SynthesisCardInput) => {
    await window.quarterline.analysis.createSynthesis(input)
    setAdding(false)
    await refresh()
  }

  const onTogglePin = async (card: SynthesisCard) => {
    await window.quarterline.report.togglePin(
      'synthesis_card',
      String(card.id),
      'market-overview'
    )
    await refresh()
  }

  const onGenerate = async () => {
    if (generating) return
    setGenerating(true)
    setGenerationError(null)
    try {
      const result = await window.quarterline.ai.generateSynthesis()
      if (!result.ok) {
        setGenerationError(result.message ?? 'AI generation failed.')
      } else {
        await refresh()
      }
    } finally {
      setGenerating(false)
    }
  }

  const generateButton = aiConfigured ? (
    <button
      type="button"
      className="synthesis-add-btn"
      onClick={onGenerate}
      disabled={generating}
    >
      {generating ? 'Generating…' : '✦ Generate'}
    </button>
  ) : null

  if (generating && cards.length === 0) {
    return (
      <div className="tier-row cols-3" aria-busy="true" aria-label="Generating synthesis cards">
        {[0, 1, 2].map((i) => (
          <div key={i} className="synthesis-card-skeleton">
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-line full" />
            <div className="skeleton skeleton-line full" />
            <div className="skeleton skeleton-line long" />
          </div>
        ))}
      </div>
    )
  }

  if (cards.length === 0 && !adding) {
    return (
      <>
        {generationError && (
          <div className="data-studio-banner data-studio-banner-error">
            {generationError}
          </div>
        )}
        <div className="tier-row cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="module-card synthesis-empty-card">
              <div className="module-header">
                <span className="module-title">AI Synthesis</span>
                {i === 0 && (
                  <div className="synthesis-empty-actions">
                    {generateButton}
                    <button
                      type="button"
                      className="synthesis-add-btn"
                      onClick={() => setAdding(true)}
                    >
                      + Add
                    </button>
                  </div>
                )}
              </div>
              <div className="module-body">
                <div className="synthesis-empty-text">
                  {i === 0
                    ? aiConfigured
                      ? 'No synthesis cards yet. Click ✦ Generate to draft cards from imported market data, or + Add to author one manually.'
                      : 'No synthesis cards yet. Configure an AI provider in Settings to generate cards automatically, or add one manually.'
                    : i === 1
                      ? 'External AI tools can also write synthesis to narratives/ — see WORKSPACE.md.'
                      : 'Cards drive the report cover narrative. Pin to include in assembly.'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      {generationError && (
        <div className="data-studio-banner data-studio-banner-error">
          {generationError}
        </div>
      )}
      <div className="tier-row cols-3">
        {adding ? (
          <div className="module-card">
            <div className="module-header">
              <span className="module-title">New synthesis card</span>
            </div>
            <div className="module-body">
              <CardForm onSubmit={onSubmit} onCancel={() => setAdding(false)} />
            </div>
          </div>
        ) : (
          <div className="module-card synthesis-add-tile">
            <div className="synthesis-add-tile-actions">
              {generateButton}
              <button
                type="button"
                className="synthesis-add-tile-btn"
                onClick={() => setAdding(true)}
              >
                + Add card
              </button>
            </div>
          </div>
        )}
        {cards.slice(0, 5).map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onTogglePin={() => onTogglePin(card)}
          />
        ))}
      </div>
    </>
  )
}
