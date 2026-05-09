# QuarterlineV2 Next Steps

Date: 2026-05-09

## Current State

- Milestones 0-6: **Complete.**
- Milestone 7 (AI Integration): **Next.**

The Portfolio view now renders six real modules driven by imported data:
key metrics banner, AI synthesis cards (manual-author path), 2D Leaflet
market map with submarket polygons, stacking plan with occupancy
coloring, CBRE-style financial table, and a what-if scenario panel with
ECharts dual-axis chart. Pin-to-report buttons register modules in
`report_pin` for the M8 assembly. Workspaces persist; data layer is
covered by `npm run smoke-test`.

## Immediate Priorities

1. **Begin Milestone 7 (AI Integration).** Two paths:
   - **Built-in AI** (main process):
     - Settings UI for provider selection (Anthropic, OpenAI) and API key.
     - Settings stored locally per app, not per workspace; never written
       to the workspace folder.
     - Generate synthesis cards from market data (uses the same
       `ai_synthesis_card` schema; sets `source = 'built-in-ai'`).
     - Generate narrative drafts for report sections (writes to
       `narratives/<section>.md`).
     - Graceful degradation when no provider is configured (modules
       continue to work with the manual-author path).
   - **External AI bridge**:
     - The folder contract already exists (WORKSPACE.md + data/*.json).
     - Add external change detection: on focus / refresh, scan
       `narratives/` and `notes/` for files modified externally since
       the last app-managed save.
     - Diff preview + accept/reject UI for imported narratives.

2. **Decisions to make as M7 starts:**
   - Anthropic SDK vs. OpenAI SDK first (or both via a small adapter).
   - Where to store the API key (Electron `safeStorage` keychain vs.
     `~/.quarterline/config.json` plaintext). Strongly favor `safeStorage`.
   - Synthesis card prompt design — what data we send, what shape we
     expect back.

## Open Decisions Still to Resolve

- Source-file retention and cleanup rules (M9).
- Encryption expectations for source files at rest (M9).
- Workspace backup and restore model (post-MVP).

## What Exists

- Electron app shell: main / preload / renderer split.
- Workspace lifecycle: create / list / open / close / switch /
  restart-restore.
- Per-workspace SQLite with migration runner; tables for `workspace`,
  `market_statistic`, `submarket_statistic`, `property`, `lease`,
  `source_file`, `ai_synthesis_card`, `scenario`, `report_pin`.
- CSV import (`csv-parse`) and JSON import for properties + leases.
- Source file ingestion with sha256 dedup and confidentiality flag.
- Data export to `data/*.json` (matches `docs/ai-bridge-spec.md`).
- WORKSPACE.md manifest with auto-generated "Current Data Summary".
- Renderer:
  - Workspace context, sidebar routing.
  - Data Studio view with five sub-tabs and import actions.
  - Portfolio view with six analysis modules:
    KeyMetricsBanner, SynthesisCards (manual-author), MarketMap
    (Leaflet + OSM), StackingPlan, FinancialTable (CBRE-style),
    ScenarioControls (ECharts dual-axis).
  - Pin-to-report on each module, persisted in `report_pin`.
- Sample import fixtures and Atlanta submarket GeoJSON under
  `docs/reference-artifacts/samples/`.
- Automated smoke test: `npm run smoke-test` (Electron-runtime, 31/31)
  covers the data path end-to-end.
- ESLint + Prettier, Windows packaging via electron-builder.
