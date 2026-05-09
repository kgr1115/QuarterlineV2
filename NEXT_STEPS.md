# QuarterlineV2 Next Steps

Date: 2026-05-09

## Current State

- Milestones 0-8: **Complete.** M7 was accepted on implementation
  review (live API verification deferred at the project owner's
  direction). M8 was accepted by the project owner on the same
  basis on 2026-05-09.
- Milestone 9 (Polish, Packaging, Release Prep): **In progress** —
  Phases 1, 2, perf-indexes, and Phase 3a have landed. Phase 3b
  (release pipeline + icon assets) is in flight.

The app now offers the full report-assembly path: edit narratives
inline, reorder/include sections, optionally generate narratives via
the M7 AI dispatcher, preview the rendered report in an iframe, and
export to PDF via Electron's `printToPDF` into the workspace's
`exports/` folder. Smoke test is 32/32.

## Immediate Priorities

1. **Cut the first GitHub release.** The repo
   `kgr1115/QuarterlineV2` is public and `electron-builder.yml`
   carries a github publish stanza. Workflow:
   - Bump `package.json` version (e.g. `0.1.0` → `0.1.1`).
   - `git tag v0.1.1 && git push --tags` (electron-builder reads
     the tag) — or use `npm version patch`.
   - With `GH_TOKEN` exported, run `npm run package -- --publish always`.
   - Verify the release shows up at
     `https://github.com/kgr1115/QuarterlineV2/releases`.
   - On the next launch of an installed older build, the auto-updater
     should detect the new release and download it.

2. **Continue Milestone 9 (Polish, Packaging, and Release Prep).**
   Phases 1, 2, perf-indexes, and Phase 3a landed 2026-05-09.
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
   - Phase 3a (landed 2026-05-09):
     - Per-module ErrorBoundary wrapping for the Portfolio modules
       (one broken module no longer takes down the whole view).
     - `lastRoute` persistence in app config so the app reopens to
       the route the user closed on.
     - Ctrl+S in the Reports editor to save the current narrative.
   - Phase 3b (in flight):
     - GitHub publish stanza wired in `electron-builder.yml`
       pointing at `kgr1115/QuarterlineV2` (public).
     - Release pipeline — first tagged release pending (see
       Immediate Priorities #1).
     - Icon and installer artwork — drop `icon.ico` (256x256 multi-
       resolution) into `build/`. Optional NSIS header.bmp +
       sidebar.bmp.
   - Performance — SQLite indexes landed 2026-05-09 (`7f74f52`).
     Bundle code-splitting for echarts/leaflet remains; only
     warranted after measurement on a large workspace.

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
