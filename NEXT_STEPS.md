# QuarterlineV2 Next Steps

Date: 2026-05-09

## Current State

- Milestones 0-6: **Complete.**
- Milestone 7 (AI Integration): **In progress** — implementation landed,
  pending live API call by the user.

The Portfolio view now offers built-in AI synthesis card generation
through Anthropic (`claude-opus-4-7` by default), with the API key
encrypted via Electron's `safeStorage`. The external AI bridge detects
changes to `narratives/` and `notes/` markdown files on focus and shows
a diff-preview banner. The data layer is unchanged and still covered by
`npm run smoke-test` (32/32).

## Immediate Priorities

1. **Live-test the AI integration whenever ready.**
   - Open the Atlanta workspace.
   - Settings → AI Provider → paste an Anthropic API key, save.
   - "Test connection" → expect success.
   - Portfolio → click `✦ Generate` on the synthesis tier → expect
     3–5 cards from the imported market data.
   - Externally edit `narratives/market-overview.md` → refocus the app
     → expect the external-changes banner with the diff preview.
   - If clean, promote M7 to **Complete** in `docs/milestones.md` and
     start M8.

2. **Begin Milestone 8 (Report Assembly and Export)** at any time —
   the data and AI layers are stable and M8 can land in parallel with
   M7's live verification.
   - Report assembly panel (sidebar or drawer): list pinned modules
     and narrative sections in order.
   - Section ordering via drag-and-drop or move-up/move-down.
   - Narrative editor: inline markdown for report sections (the AI
     dispatcher already exposes `generateNarrative` for the
     "Generate with AI" affordance).
   - Exhibit embedding: charts, tables, maps as static images / HTML.
   - Report preview, PDF export via Chromium print-to-PDF, output to
     `<workspace>/exports/`.

## Open Decisions Still to Resolve

- Source-file retention and cleanup rules (M9).
- Encryption expectations for source files at rest (M9).
- Workspace backup and restore model (post-MVP).

## What Exists

- Electron app shell: main / preload / renderer split.
- Workspace lifecycle, multi-workspace persistence, restart-restore.
- Per-workspace SQLite with migration runner.
- CSV / JSON import, source file ingestion (sha256 dedup).
- Data export to `data/*.json` matching `docs/ai-bridge-spec.md`.
- WORKSPACE.md manifest with auto-generated "Current Data Summary".
- Renderer: workspace context, sidebar routing (Portfolio / Data
  Studio / Settings), Data Studio (5 sub-tabs + imports), Portfolio
  with six analysis modules (key-metrics banner, AI synthesis cards,
  Leaflet 2D market map, stacking plan, CBRE-style financial table,
  ECharts dual-axis scenario panel), Settings page for AI provider.
- AI integration:
  - Anthropic adapter (`claude-opus-4-7` default, adaptive thinking,
    `effort: medium`, prompt caching).
  - Adapter interface for future OpenAI / others.
  - API key encrypted via Electron `safeStorage`.
  - Synthesis card generation via structured outputs (Zod schemas).
  - Narrative generation API ready for M8.
  - External AI bridge change detection on `narratives/` and
    `notes/` with diff previews and acknowledge-all.
- Pin-to-report wired to `report_pin` table for M8 assembly.
- Sample fixtures + Atlanta submarket GeoJSON.
- Automated smoke test: `npm run smoke-test` (32/32).
- ESLint + Prettier, Windows packaging via electron-builder.
