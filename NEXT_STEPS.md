# QuarterlineV2 Next Steps

Date: 2026-05-09

## Current State

- Milestones 0-3: **Complete.**
- Milestone 4 (Workspace Management and Navigation): **In progress** —
  backend verified by `npm run smoke-test` (31/31 checks); GUI walkthrough
  pending.
- Milestone 5 (Data Ingestion and Storage): **In progress** — backend
  verified by `npm run smoke-test` (31/31 checks); GUI walkthrough pending.

The data layer is proven end-to-end via `npm run smoke-test`. What remains
is interactive UI verification — clicking through the workspace switcher,
the create-workspace modal, the Data Studio import buttons, and confirming
the visuals render correctly.

## Immediate Priorities

1. **Run the GUI walkthrough.**

   Run `npm start` and check:

   M4 (workspace lifecycle):
   - Sidebar switcher dropdown opens; "+ New workspace" launches the modal.
   - Create "Atlanta Office Q1 2026" via the modal.
   - Status bar and filter bar update with the workspace context.
   - Close and reopen the app — last workspace and window position
     restore.
   - "Close current workspace" returns to the empty-state card.

   M5 (data ingestion UI):
   - Click sidebar **Data Studio** — view changes.
   - **Import market stats CSV** with
     `docs/reference-artifacts/samples/atlanta-market-stats-q1-2026.csv` →
     green banner, Market Stats tab populated.
   - **Import submarket stats CSV** with
     `atlanta-submarket-stats-q1-2026.csv` → 5 rows.
   - **Import property / lease JSON** with `atlanta-properties-leases.json`
     → 3 properties, 3 leases.
   - **Add source file(s)** with any local file → Source Files tab shows it.
   - Open `WORKSPACE.md` and confirm the "Current Data Summary" reflects
     the imports.

   If clean, promote M4 and M5 to **Complete** in `docs/milestones.md`,
   add a verification date, and start M6.

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
- Automated smoke test: `npm run smoke-test` runs the full data path
  under Electron and verifies file artifacts.
- ESLint + Prettier, Windows packaging via electron-builder.
