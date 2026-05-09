# QuarterlineV2 Next Steps

Date: 2026-05-09

## Current State

- Milestones 0-3: **Complete.**
- Milestone 4 (Workspace Management and Navigation): **In progress** —
  implementation done, awaiting Windows smoke test.
- Milestone 5 (Data Ingestion and Storage): **In progress** —
  implementation done, awaiting Windows smoke test.

The Electron scaffold runs. Workspaces persist under `~/.quarterline/`.
Imports (CSV market/submarket statistics, JSON property+lease data, file
ingestion into `sources/`) drive a Data Studio view in the renderer with
sub-tabs and tabular numerics. Each successful import re-exports
`data/*.json` per the AI bridge spec and refreshes the WORKSPACE.md
manifest's "Current Data Summary".

## Immediate Priorities

1. **Smoke-test M4 + M5 on Windows.**

   Workspace lifecycle (M4):
   - `npm start`, see the empty-state card.
   - Create "Atlanta Office Q1 2026"; folder appears under
     `%USERPROFILE%\.quarterline\workspaces\atlanta-office-q1-2026\`.
   - Switch / close / reopen via the sidebar switcher.
   - Restart app → window position and last workspace restore.

   Data ingestion (M5), with the Atlanta workspace open:
   - Open the "Data Studio" sidebar item.
   - Click **Import market stats CSV**, pick
     `docs/reference-artifacts/samples/atlanta-market-stats-q1-2026.csv`.
     Expect 4 rows in the Market Stats tab; verify
     `<workspace>/data/market-statistics.json` exists with the schema.
   - **Import submarket stats CSV** with the submarket sample → 5 rows.
   - **Import property / lease JSON** with the Atlanta JSON sample →
     3 properties, 3 leases. Verify `data/property-data.json` and
     `data/lease-data.json` are generated.
   - **Add source file(s)** with any local file → appears in Source Files
     tab; lives under `<workspace>/sources/`; is **not** referenced in
     `data/*.json`.
   - Open `WORKSPACE.md`; "Current Data Summary" shows the row counts and
     headline metrics.
   - Re-importing the same CSV replaces the quarter's rows (no
     duplicates).
   - Importing a malformed CSV (delete a required column) shows a clear
     validation banner with row/column details.

   If clean, promote M4 and M5 to **Complete** in `docs/milestones.md`,
   add decision-log entries, and start M6.

2. **Begin Milestone 6 (Analysis Modules)** once M4 + M5 are verified.
   - Replace placeholder module cards with real modules driven by
     imported data.
   - AI synthesis cards (initially manually authored, M7 wires AI).
   - 2D market map with submarket boundaries.
   - 2D stacking plan for a selected property.
   - Financial table matching the CBRE column structure.
   - What-if scenario controls.
   - Pin-to-report wiring (M8 closes the loop with assembly).

## Open Decisions Still to Resolve

- Source-file retention and cleanup rules (M9).
- Encryption expectations for source files at rest (M9).
- Workspace backup and restore model (post-MVP).

## What Exists

- Electron app shell: main / preload / renderer split.
- Workspace lifecycle: create, list, open, close, switch.
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
- ESLint + Prettier, Windows packaging via electron-builder.
