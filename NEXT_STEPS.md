# QuarterlineV2 Next Steps

Date: 2026-05-09

## Current State

- Milestones 0-6: **Complete.**
- Milestone 7 (AI Integration): **In progress** — implementation landed,
  pending live API call by the user.
- Milestone 8 (Report Assembly and Export): **In progress** —
  implementation landed, pending GUI walkthrough on Windows.
- Milestone 9 (Polish, Packaging, Release Prep): **In progress** —
  Phase 1 (crash logging, error boundary, native menu, installer
  metadata, Settings app-info) underway in parallel; runs
  independently of M7/M8 verification.

The app now offers the full report-assembly path: edit narratives
inline, reorder/include sections, optionally generate narratives via
the M7 AI dispatcher, preview the rendered report in an iframe, and
export to PDF via Electron's `printToPDF` into the workspace's
`exports/` folder. Smoke test is 32/32.

## Immediate Priorities

1. **Live-test M7 + M8 on Windows whenever ready.**

   M7 (AI Integration):
   - Settings → AI Provider → paste an Anthropic API key, save.
   - Test connection.
   - Portfolio → `✦ Generate` on the synthesis tier → expect 3–5 cards.
   - Externally edit `narratives/market-overview.md` → refocus app →
     external-changes banner appears with diff preview.

   M8 (Report Assembly):
   - Reports → see the six default sections (market-overview through
     leasing-activity).
   - Edit a narrative inline; Save; reopen to confirm persistence.
   - Reorder sections via ↑ / ↓; toggle Include; add a custom section.
   - (M7 key configured) Click `✦ Generate with AI` to draft a section.
   - Click `Preview` → assembled report renders in iframe.
   - Click `Export PDF` → file lands in `<workspace>/exports/`; click
     it in "Recent exports" to open in system viewer.

   If both pass, promote M7 and M8 to **Complete** and start M9.

2. **Continue Milestone 9 (Polish, Packaging, and Release Prep).**
   Phases 1 and 2 landed 2026-05-09.
   - Phase 1 (landed 2026-05-09):
     - Main-process crash logging to `~/.quarterline/logs/`.
     - Renderer error boundary (no white-screen-of-death).
     - Native application menu with keyboard shortcuts
       (Ctrl+N, Ctrl+,, Ctrl+1-3, Cut/Copy/Paste, DevTools).
     - Installer metadata polish (author, copyright, NSIS naming).
     - Settings app-info panel (version, workspace folder root,
       open-folder button).
     - Empty/loading state pass.
   - Phase 2 (landed 2026-05-09):
     - Accessibility pass — sidebar nav as real buttons with
       `aria-current`, focus-visible outlines, FilterBar toolbar
       semantics, icon-button `aria-label`s, pin/include
       `aria-pressed`.
     - User preferences — `preferences.defaultMarket` and
       `defaultPropertyType` in app config; Settings →
       Preferences pane; New Workspace dialog pre-fills.
     - Auto-update wiring — `electron-updater` integrated with
       `app.isPackaged` and `QUARTERLINE_DISABLE_AUTO_UPDATE`
       guards; state surfaced in Settings → About;
       `electron-builder.yml` carries a commented GitHub publish
       stanza ready to enable.
   - Phase 3 (queued):
     - Performance — SQLite index audit + bundle code-splitting
       for echarts/leaflet (only after measurement on a large
       workspace).
     - Release pipeline — fill in `publish:` provider, configure
       GitHub releases, code-signing, first packaged release.
     - Icon and installer artwork — drop `icon.ico` plus optional
       NSIS header/sidebar artwork into `build/`.

## Open Decisions Still to Resolve

- Source-file retention and cleanup rules (M9).
- Encryption expectations for source files at rest (M9).
- Workspace backup and restore model (post-MVP).

## What Exists

- Electron app shell with restart-restored window state.
- Multi-workspace lifecycle, slug-based folders under `~/.quarterline/`.
- Per-workspace SQLite with migration runner. Tables: `workspace`,
  `market_statistic`, `submarket_statistic`, `property`, `lease`,
  `source_file`, `ai_synthesis_card`, `scenario`, `report_pin`,
  `report_section`, `report_export`.
- Data ingestion: CSV (market/submarket stats) + JSON (property+lease)
  + source files (sha256 dedup); auto-export to `data/*.json` and
  WORKSPACE.md "Current Data Summary" refresh after each import.
- Renderer:
  - **Portfolio**: KeyMetricsBanner + AI synthesis cards (manual /
    AI-generated) + 2D Leaflet market map + stacking plan +
    CBRE-style financial table + ECharts dual-axis scenarios.
  - **Data Studio**: 5 sub-tabs with imports.
  - **Reports**: section editor + AI-narrative generator + preview
    iframe + PDF export to `<workspace>/exports/`.
  - **Settings**: AI provider config (encrypted via safeStorage).
- AI integration: Anthropic adapter (`claude-opus-4-7` default,
  adaptive thinking, prompt caching, structured outputs). External AI
  bridge change detection on `narratives/` and `notes/`.
- Pin-to-report on Portfolio modules → `report_pin` table.
- Automated smoke test: `npm run smoke-test` (32/32).
- Sample fixtures + Atlanta submarket GeoJSON.
- ESLint + Prettier; Windows packaging via electron-builder.
