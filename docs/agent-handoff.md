# Agent Handoff

Date: 2026-05-09

## Current Product State

QuarterlineV2 is a downloadable desktop app for institutional CRE research
and reporting. Implementation is underway. Milestones 0-7 are complete
(M7 was accepted on implementation review; live API verification was
deferred at the project owner's direction). M8 (Report Assembly and
Export) has its implementation landed and is awaiting a GUI walkthrough
on Windows. M9 (Polish, Packaging, Release Prep) is in progress in
parallel.
Phase 1 covers crash logging, renderer error boundary, native menu
with keyboard shortcuts, installer metadata, and Settings app-info.
Phase 2 covers the accessibility pass, user preferences (default
market / property type used by the New Workspace dialog), and
auto-update wiring via `electron-updater` (publish stanza
commented out in `electron-builder.yml` until the release pipeline
is configured).

## Resolved Decisions (see `docs/decision-log.md`)

- Desktop runtime: **Electron**.
- Data model: **Multi-workspace** (one workspace per market, each stored as a
  folder with SQLite + human-readable files).
- AI integration: **Dual model** — built-in API-backed AI (optional) +
  external AI bridge where tools like Claude Desktop or Codex can open a
  workspace folder and read/write content.
- 3D visualization: **2D placeholder for MVP**, full 3D as finished-product
  goal.
- Target platform: **Windows first**.
- Report quality bar: **CBRE Atlanta Office Q1 2026 report** as benchmark
  (see `docs/reference-artifacts/`).
- Workspace storage: **`~/.quarterline/workspaces/<slug>/`** (M4 decision).
- Workspace IDs: **kebab-case slugs of the workspace name with collision
  suffix** (M4 decision).

## Current Design State

Design goal document:

- `docs/design/quarterline-v2-design-goals.md`

Concept artwork:

- `docs/design/quarterline-v2-industrial-minimalism-concept.png`

Original design specification used to generate the artwork:

- `docs/design/technical-design-specification.md`

The artwork expresses the desired industrial-minimalist desktop workspace:
portfolio sidebar, compact global filters, AI synthesis cards, 3D market map,
3D property stacking plan, financial table, and what-if scenario controls.

## Current Technical State

- **Milestones 0-6 complete and verified.**
- Project structure: `src/main/`, `src/preload/`, `src/renderer/`, `src/shared/`.
- Main process modules:
  - `index.ts` — window lifecycle, window-state save/restore, last-workspace
    restore.
  - `paths.ts` — central path helpers for `~/.quarterline/`.
  - `app-config.ts` — read/write `~/.quarterline/config.json`.
  - `workspace-manager.ts` — workspace lifecycle, slug generation, folder
    initialization, active-workspace state, post-import refresh of manifest
    and `data/*.json`.
  - `workspace-db.ts` — per-workspace SQLite schema with a migration runner.
    Tables: `workspace`, `market_statistic`, `submarket_statistic`,
    `property`, `lease`, `source_file`, `_migrations`.
  - `workspace-manifest.ts` — `WORKSPACE.md` renderer with auto-generated
    "Current Data Summary".
  - `csv-import.ts` — header-tolerant CSV importer for market and submarket
    statistics (uses `csv-parse`).
  - `json-import.ts` — JSON importer for property + lease data.
  - `source-ingest.ts` — file ingestion to `<workspace>/sources/` with
    sha256 dedup and confidentiality flag.
  - `data-export.ts` — writes `data/market-statistics.json`,
    `data/submarket-statistics.json`, `data/property-data.json`,
    `data/lease-data.json` per `docs/ai-bridge-spec.md` schemas.
  - `ipc-handlers.ts` — registers workspace, window, dialog, and data
    channels.
- Preload exposes `window.quarterline` with `ping`, `dbStatus`,
  `workspace.*`, `windowState.*`, `dialog.*`, and `data.*` namespaces.
- Renderer:
  - `state/workspace.tsx` — `WorkspaceProvider` and `useWorkspace` hook.
  - `components/WorkspaceSwitcher.tsx` — sidebar dropdown for switching.
  - `components/CreateWorkspaceDialog.tsx` — modal for new workspaces.
  - `components/DataStudio.tsx` — Data Studio view with five sub-tabs
    (Market Stats, Submarket Stats, Properties, Leases, Source Files),
    import actions, and validation banner.
  - Sidebar routes the active nav item to either WorkspaceArea or
    DataStudio. FilterBar and StatusBar consume the workspace context.
- Per-workspace folder layout (created on first save):
  `WORKSPACE.md`, `workspace.db`, `data/`, `narratives/` (with `custom/`),
  `notes/`, `sources/`, `exports/`, `.quarterline/`.
- Build: electron-vite for dev/build, electron-builder for Windows packaging.
- Tooling: ESLint (typescript-eslint), Prettier.
- Sample import fixtures under `docs/reference-artifacts/samples/`.

## Completed Milestones

- **M0**: Documentation system reset.
- **M1**: Desktop architecture decisions (Electron, SQLite, multi-workspace,
  dual AI, 2D MVP, Windows-first).
- **M2**: Design system specification (tokens, typography, layout, components).
- **M3**: Electron scaffold (app shell, SQLite, IPC bridge, packaging pipeline).
- **M4**: Workspace lifecycle (create/open/switch/close, slug-based folder
  IDs, `~/.quarterline/` storage, window-state and last-workspace
  persistence).
- **M5**: Data ingestion (CSV market/submarket stats, JSON property+lease,
  source file ingestion with sha256 dedup, AI-bridge JSON exports,
  Data Studio view).
- **M6**: Analysis modules (key metrics banner, synthesis cards with
  manual-author flow, Leaflet 2D market map, stacking plan, CBRE-style
  financial table, ECharts dual-axis scenario panel, pin-to-report
  contract via `report_pin` table).
- **M7**: AI integration (Anthropic adapter behind a provider interface,
  encrypted-key storage via Electron `safeStorage`, synthesis-card
  generation, narrative generation, external-AI bridge change detection
  on `narratives/` and `notes/`). Accepted on implementation review;
  live API verification deferred at the project owner's direction.

## Required Reading For Next Agent

1. `claude.md`
2. `agent.md`
3. `README.md`
4. `NEXT_STEPS.md`
5. `docs/agent-handoff.md`
6. `docs/documentation-flow.md`
7. `docs/chief-agent-workflow.md`
8. `docs/design/quarterline-v2-design-goals.md`
9. `docs/decision-log.md`
10. `docs/architecture.md`
11. `docs/data-model.md`
12. `docs/ai-bridge-spec.md`
13. `docs/mvp-scope.md`
14. `docs/publication-output-spec.md`

## Active Milestones

**M8 (Report Assembly and Export)** — implementation landed 2026-05-09:
- New `report_section` and `report_export` tables.
- `report-assembly.ts` seeds six default CBRE-style sections on first
  open and manages the section list. Narratives live as files under
  `<workspace>/narratives/` so the AI bridge can co-edit them.
- `report-render.ts` produces the report HTML (cover page with key
  metrics + pinned synthesis cards, section narratives via `marked`,
  market and submarket statistics tables, generated-date footer).
- `report-export.ts` renders to PDF via Electron's
  `webContents.printToPDF()` on a hidden `BrowserWindow` and writes
  to `<workspace>/exports/`.
- `ReportsView.tsx`: three-pane (sections sidebar / editor / preview
  iframe) with reorder, include toggle, custom-section add, AI
  narrative generation, preview, and PDF export.
- Pending: user GUI walkthrough on Windows.

**M9 (Polish, Packaging, Release Prep)** — in progress in parallel.
Phase 1 (crash logging, ErrorBoundary, native menu, installer
metadata, Settings → About), Phase 2 (a11y pass, user preferences,
auto-updater wiring), and a perf-indexes commit have landed. Phase
3 (route persistence, per-module error boundaries, more shortcuts)
is in flight.
