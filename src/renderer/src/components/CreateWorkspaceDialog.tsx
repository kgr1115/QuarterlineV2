import { useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../state/workspace'

const PROPERTY_TYPES = ['Office', 'Industrial', 'Retail', 'Multifamily', 'Mixed-Use']

function defaultQuarter(): string {
  const now = new Date()
  const q = Math.floor(now.getMonth() / 3) + 1
  return `Q${q} ${now.getFullYear()}`
}

type Props = {
  open: boolean
  onClose: () => void
}

export function CreateWorkspaceDialog({ open, onClose }: Props) {
  const { create } = useWorkspace()
  const [name, setName] = useState('')
  const [market, setMarket] = useState('')
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPES[0])
  const [quarter, setQuarter] = useState(defaultQuarter())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setName('')
    setError(null)
    setSubmitting(false)
    setQuarter(defaultQuarter())

    let cancelled = false
    window.quarterline.app
      .getPreferences()
      .then((p) => {
        if (cancelled) return
        setMarket(p.defaultMarket ?? '')
        setPropertyType(
          p.defaultPropertyType && PROPERTY_TYPES.includes(p.defaultPropertyType)
            ? p.defaultPropertyType
            : PROPERTY_TYPES[0]
        )
      })
      .catch(() => {
        setMarket('')
        setPropertyType(PROPERTY_TYPES[0])
      })

    requestAnimationFrame(() => nameRef.current?.focus())
    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (submitting) return

    if (!name.trim() || !market.trim()) {
      setError('Name and market are required')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await create({
        name: name.trim(),
        market: market.trim(),
        propertyType,
        quarter: quarter.trim()
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-header">
          <h2 className="dialog-title">New workspace</h2>
        </div>

        <form onSubmit={onSubmit} className="dialog-body">
          <label className="dialog-field">
            <span className="dialog-label">Name</span>
            <input
              ref={nameRef}
              type="text"
              className="dialog-input"
              placeholder="e.g., Atlanta Office Q1 2026"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label className="dialog-field">
            <span className="dialog-label">Market</span>
            <input
              type="text"
              className="dialog-input"
              placeholder="e.g., Atlanta"
              value={market}
              onChange={(event) => setMarket(event.target.value)}
              required
            />
          </label>

          <div className="dialog-row">
            <label className="dialog-field dialog-field-flex">
              <span className="dialog-label">Property type</span>
              <select
                className="dialog-input"
                value={propertyType}
                onChange={(event) => setPropertyType(event.target.value)}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="dialog-field dialog-field-flex">
              <span className="dialog-label">Quarter</span>
              <input
                type="text"
                className="dialog-input"
                placeholder="e.g., Q1 2026"
                value={quarter}
                onChange={(event) => setQuarter(event.target.value)}
                required
              />
            </label>
          </div>

          {error && <div className="dialog-error">{error}</div>}

          <div className="dialog-actions">
            <button
              type="button"
              className="dialog-btn dialog-btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dialog-btn dialog-btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating…' : 'Create workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
