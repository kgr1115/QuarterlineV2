# QuarterlineV2 Next Steps

Date: 2026-05-09

## Current State

- Milestones 0-5: **Complete.**
- Milestone 6 (Analysis Modules): **Next.**

The Electron scaffold runs. Workspaces persist under `~/.quarterline/`
and survive app restarts. CSV/JSON imports load market statistics,
submarket statistics, properties, and leases into a per-workspace SQLite
database, while source files are ingested into `sources/` with sha256
dedup. After every import, `data/*.json` and `WORKSPACE.md` "Current
Data Summary" auto-regenerate per `docs/ai-bridge-spec.md`. The Data
Studio view in the renderer browses all imported tables.

## Immediate Priorities

1. **Begin Milestone 6 (Analysis Modules).** Replace placeholder module
   cards with real modules driven by imported data.

   - **AI synthesis cards** (tier 1): render cards from
     `AISynthesisCard` records. Manual authoring path first; M7 wires
     in built-in AI generation.
   - **2D market map** (tier 2 left): submarket boundaries colored by a
     selected metric. Mapbox or Leaflet — decision pending.
   - **2D stacking plan** (tier 2 right): floor grid for a selected
     property, colored by occupancy.
   - **Financial table** (tier 3 left): market statistics table matching
     the CBRE reference column structure (already imported in M5).
   - **What-if scenario controls** (tier 3 right): sliders for interest
     rate, rent growth, cap rate shift; chart showing actual vs.
     simulated curves.
   - **Key metrics banner**: 5 hero metrics with directional arrows.
   - **Pin-to-report**: action on each module that registers it for the
     M8 report assembly.

2. **Decisions to make as M6 starts:**
   - 2D map library (Mapbox GL JS vs. Leaflet vs. d3-geo).
   - Charting library for the financial table and scenario chart
     (Recharts, Visx, Apache ECharts, hand-rolled with d3).
   - Submarket boundary data source for the Atlanta sample
     (placeholder polygons vs. simplified GeoJSON).

## Open Decisions Still to Resolve

- Source-file retention and cleanup rules (M9).
- Encryption expectations for source files at rest (M9).
- Workspace backup and restore model (post-MVP).

## What Exists

- Electron app shell: main / preload / renderer split.
- Workspace lifecycle: create, list, open, close, switch, restart-restore.
- Per-workspace SQLite with migration runner; tables for `workspace`,
  `market_statistic`, `submarket_statistic`, `property`, `lease`,
  `source_file`.
- CSV import (`csv-parse`) for market and submarket statistics.
- JSON import for property + lease data.
- Source file ingestion with sha256 dedup and confidentiality flag.
- Data export to `data/*.json` after each import (matches
  `docs/ai-bridge-spec.md`).
- WORKSPACE.md manifest with auto-generated "Current Data Summary".
- Renderer: workspace context, sidebar routing, Data Studio view with
  five sub-tabs and import actions, validation banner.
- Sample import fixtures under `docs/reference-artifacts/samples/`.
- Automated smoke test: `npm run smoke-test` (Electron-runtime, 31/31)
  covers the data path end-to-end.
- ESLint + Prettier, Windows packaging via electron-builder.
