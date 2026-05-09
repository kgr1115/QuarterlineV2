# Milestones

Date: 2026-05-09

## Purpose

This file defines the QuarterlineV2 milestone flow. Milestones are sequenced
so each builds on the last. No V1 milestone history applies.

## Current Phase

Status: Implementation. Milestones 0-3 complete; M4 (Workspace Management
and Navigation) implementation landed and is awaiting Windows smoke test;
M5 (Data Ingestion and Storage) is **in progress** in parallel.

## Milestone Authoring Rules

Each milestone includes: owner, goal, scope, non-goals, dependencies,
acceptance criteria, verification method, and required doc updates.

---

### Milestone 0: Documentation System Reset

Owner: Chief Implementation Agent.

Goal: Establish the V2 documentation flow, agent workflow, and design goals.

Status: **Complete.**

Acceptance criteria (all met):

- Root agent docs exist (`claude.md`, `agent.md`).
- Documentation-only repo structure is clean.
- Design artwork stored as a goal, not implementation evidence.
- V1 implementation history removed from active planning docs.

---

### Milestone 1: Desktop Architecture Decision

Owner: Chief Implementation Agent.

Goal: Choose the desktop runtime, data architecture, and AI integration model.

Status: **Complete.**

Decisions made (see `docs/decision-log.md`):

- Runtime: Electron.
- Database: SQLite (better-sqlite3).
- Multi-workspace from day one.
- Dual AI model: built-in API-backed + external AI bridge.
- 2D map/stacking for MVP, 3D as finished-product goal.
- Windows-first packaging.

Documentation updated: `docs/architecture.md`, `docs/data-model.md`,
`docs/mvp-scope.md`, `docs/publication-output-spec.md`.

---

### Milestone 2: Design System Specification

Owner: Chief Product and Frontend Agent.

Goal: Convert concept artwork into implementable design-system guidance.

Status: **Complete.**

Deliverables:

- `docs/design/design-system-spec.md` — color tokens, typography, spacing,
  layout grid, component anatomy, interaction states, desktop chrome.
- `docs/design/technical-design-specification.md` — original design spec that
  generated the concept artwork.
- `docs/ai-bridge-spec.md` — WORKSPACE.md manifest format, data export
  schemas, narrative file conventions, external change detection.

---

### Milestone 3: Electron Scaffold

Owner: Chief Implementation Agent + Chief Backend and Data Agent.

Goal: Create a clean, running Electron app shell with the basic project
structure, dev tooling, and packaging pipeline.

Dependencies: Milestones 1 and 2 (complete).

Status: **Complete.**

Deliverables:

- Electron main process with `contextIsolation: true` and preload script
  (`src/main/index.ts`, `src/preload/index.ts`).
- React 19 renderer with TypeScript via electron-vite (`src/renderer/`).
- SQLite integration (better-sqlite3) in main process with WAL mode
  (`src/main/database.ts`).
- Typed IPC bridge with shared channel definitions (`src/shared/ipc-channels.ts`,
  `src/main/ipc-handlers.ts`). Ping and DB status handlers verified.
- Dev commands: `npm start` (electron-vite dev with HMR), `npm run build`
  (production build), `npm run package` (Windows NSIS installer).
- App shell layout: sidebar with grouped navigation (Research, Output, Analysis,
  Monitor, System), global filter bar (Market/Property level toggle, market,
  quarter, type selects), three-tier workspace area with placeholder module
  cards, and status bar with live SQLite version display.
- Design tokens in CSS custom properties (`tokens.css`) matching the
  design-system spec.
- ESLint (typescript-eslint) + Prettier configuration.
- Git setup with `.gitignore` covering `node_modules/`, `out/`, `dist/`.
- Windows packaging via electron-builder (`electron-builder.yml`, NSIS target).

Acceptance criteria (all met):

- `npm start` launches an Electron window on Windows.
- Window shows the sidebar / filter bar / workspace / status bar layout
  skeleton from the design spec.
- `npm run build` compiles main, preload, and renderer bundles cleanly
  (verified 2026-05-09).
- `npm run package` produces a Windows NSIS installer that launches the app.
- SQLite database is created and queried from the main process (WAL mode,
  user-data path).
- IPC bridge passes a test message (ping) from renderer to main and back, and
  reports SQLite version live in the status bar.

---

### Milestone 4: Workspace Management and Navigation

Owner: Chief Backend and Data Agent + Chief Product and Frontend Agent.

Goal: Multi-workspace creation, persistence, and navigation.

Dependencies: Milestone 3.

Status: **In progress.** Started 2026-05-09. Backend verified by automated
smoke test the same day (`npm run smoke-test`, 31/31 checks). Awaiting
human GUI walkthrough to promote to **Complete**.

Work to date:

- Workspace storage rooted at `~/.quarterline/workspaces/<slug>/` per
  `docs/data-model.md` (decision recorded in `docs/decision-log.md`).
- Workspace folder IDs are kebab-case slugs of the workspace name, with a
  numeric suffix on collision (decision recorded in `docs/decision-log.md`).
- Each workspace folder is initialized with `WORKSPACE.md` (per
  `docs/ai-bridge-spec.md`), `workspace.db`, and the subfolders `data/`,
  `narratives/` (with `custom/`), `notes/`, `sources/`, `exports/`, and
  `.quarterline/`.
- Per-workspace `workspace.db` schema: `workspace` table (id, name, market,
  property_type, current_quarter, created_at, updated_at, settings) plus
  `_migrations`. WAL mode and foreign keys enabled.
- App-level config at `~/.quarterline/config.json` stores `lastWorkspaceId`
  and `windowState` (width, height, x, y, isMaximized).
- IPC channels: `workspace:list`, `workspace:create`, `workspace:open`,
  `workspace:close`, `workspace:current`, `window:state:get`,
  `window:state:save`. `db:status` now reports on the active workspace's DB.
- Renderer: `WorkspaceProvider` React context, `WorkspaceSwitcher` in the
  sidebar (workspace list, switch, new, close-current), modal
  `CreateWorkspaceDialog` with name/market/property-type/quarter inputs and
  validation, empty-state card in the workspace area when no workspace is
  open, `FilterBar` reads market/quarter/type from the active workspace,
  `StatusBar` shows workspace name and DB status.
- `src/main/index.ts` saves window bounds on close and restores them on
  launch; restores the last opened workspace if present.

Verified (automated, 2026-05-09):

- `npm run build` and `npx tsc --noEmit` clean.
- App launches via `npm start` without errors (main + preload + renderer
  bundles built; dev server up).
- `npm run smoke-test` (Electron-runtime test): workspace creation produces
  the full folder layout, `WORKSPACE.md` and `workspace.db` are written,
  workspace can be opened, the workspace context block in `WORKSPACE.md`
  matches the inputs.

Pending verification (manual GUI walkthrough):

- Sidebar workspace switcher dropdown opens and shows the workspaces.
- "+ New workspace" modal opens, inputs validate, submit creates the
  workspace and closes the modal.
- Switching between workspaces loads the correct context (status bar and
  filter bar update live).
- Closing the app and reopening restores the last opened workspace and
  the window's bounds.
- "Close current workspace" returns to the empty-state card.

Scope:

- Workspace creation flow (name, market, property type, quarter).
- Workspace list in sidebar with switcher.
- Workspace folder creation on disk (SQLite + file structure from
  `docs/data-model.md`).
- WORKSPACE.md manifest generation (from `docs/ai-bridge-spec.md`).
- Workspace open/close/switch.
- Portfolio sidebar navigation (Portfolio, Assets, Reports, etc.).
- Global filter bar (Market Level / Property Level, market, quarter, type).
- Status bar with workspace name and save status.
- Window state persistence (size, position, last workspace).

Non-goals:

- No data import yet (empty workspaces).
- No analysis modules.

Acceptance criteria:

- Analyst can create a new workspace named "Atlanta Office Q1 2026".
- Workspace appears in sidebar list.
- Switching workspaces loads the correct context.
- Closing and reopening the app restores the last workspace.
- WORKSPACE.md exists in the workspace folder with correct context.
- Global filters render and persist selection state.

Verification: manual walkthrough of workspace lifecycle.

---

### Milestone 5: Data Ingestion and Storage

Owner: Chief Backend and Data Agent.

Goal: Import market data from CSV/JSON into a workspace.

Dependencies: Milestone 4.

Status: **In progress.** Started 2026-05-09. Backend verified by automated
smoke test the same day (`npm run smoke-test`, 31/31 checks). Awaiting
human GUI walkthrough to promote to **Complete**.

Work to date:

- Per-workspace SQLite schema extended with `market_statistic`,
  `submarket_statistic`, `property`, `lease`, and `source_file` tables.
  Migration runner records applied migrations and runs them in order.
- `csv-parse` (6.x) added as a dependency for header-tolerant parsing.
- CSV importer (`src/main/csv-import.ts`) supports CBRE-style columns,
  case-insensitive header matching, and accepted aliases. Numeric parsing
  handles `%`, `$`, comma separators, parenthesized negatives, blanks,
  and `n/a`. Re-importing the same quarter replaces that quarter's rows
  in a single transaction.
- JSON importer (`src/main/json-import.ts`) reads
  `{ properties: [...], leases: [...] }` payloads, upserts properties by
  ID, replaces all leases. Pre-validates lease `propertyId` references
  before any DB write.
- Source ingestion (`src/main/source-ingest.ts`) hashes (sha256), copies
  to `<workspace>/sources/<short-hash><ext>`, records confidentiality
  flag, deduplicates by content hash.
- Data export (`src/main/data-export.ts`) writes
  `data/market-statistics.json`, `data/submarket-statistics.json`,
  `data/property-data.json`, `data/lease-data.json` per
  `docs/ai-bridge-spec.md` schemas. Source files never appear in
  `data/` exports.
- `WORKSPACE.md` "Current Data Summary" auto-regenerates after each
  import (row counts, headline metrics, top submarkets).
- IPC: `dialog:open:csv/json/files`, `data:import:market-stats`,
  `data:import:submarket-stats`, `data:import:property-lease`,
  `data:ingest:sources`, and `data:list:*` for each table.
- Renderer: sidebar nav now routes to a Data Studio view with sub-tabs
  (Market Stats, Submarket Stats, Properties, Leases, Source Files),
  import action buttons, success/error banners, and tabular numerics
  matching the design-system spec.
- Sample fixtures added under `docs/reference-artifacts/samples/` for
  smoke testing.

Verified (automated, 2026-05-09):

- `npm run build` and `npx tsc --noEmit` clean.
- `npm run smoke-test` (Electron-runtime test) covers the full data path:
  market stats CSV import (4 rows), submarket stats CSV import (5 rows),
  property/lease JSON import (3 + 3), source file ingestion (with sha256
  dedup), `data/*.json` exports written and parseable, `WORKSPACE.md`
  "Current Data Summary" populated with row counts and headline metrics,
  source file paths are NOT exposed in `data/*.json` or `WORKSPACE.md`,
  and a malformed CSV (missing required `Property Class` column) is
  rejected with header-level errors. 31/31 checks passed.

Pending verification (manual GUI walkthrough):

- Data Studio sidebar nav routes to the Data Studio view.
- Each "Import …" button opens a file picker and runs the import.
- Success banner appears with the row counts; error banner shows row /
  column detail when an import fails.
- Each tab's table renders the imported rows with proper formatting
  (tabular numerics, parenthesized negatives).
- Source Files tab shows the file metadata.

Scope:

- CSV import for market statistics (matching CBRE reference table structure).
- JSON import for property and lease data.
- Data validation and error reporting on import.
- SQLite schema creation for all entity tables from `docs/data-model.md`.
- Data export to `data/*.json` files for AI bridge (auto-export on save).
- Source file ingestion into `sources/` with confidentiality flag.
- Basic data studio view: raw table browser for imported data.

Non-goals:

- No external data-provider integrations (CoStar, RCA).
- No automated data pipelines.

Acceptance criteria:

- Analyst imports a CSV of Atlanta market statistics and sees the data in a
  table view.
- Data persists across app restarts.
- `data/market-statistics.json` is generated and matches the schema in
  `docs/ai-bridge-spec.md`.
- Importing a malformed CSV shows clear validation errors.
- Source files imported into `sources/` are not exposed in `data/` exports.

Verification: import the CBRE reference report data as CSV, verify table
rendering and JSON export.

---

### Milestone 6: Analysis Modules

Owner: Chief Product and Frontend Agent + Chief Reporting Agent.

Goal: Build the three workspace tiers with real data.

Dependencies: Milestone 5.

Scope:

- **AI synthesis cards** (tier 1): render cards from AISynthesisCard records.
  If AI provider is configured, generate cards from market data. If not,
  cards are empty or manually authored. Pin-to-report action on each card.
- **2D market map** (tier 2 left): flat map with submarket boundary polygons,
  colored by a selected metric (vacancy, absorption, rent). Mapbox or
  Leaflet. Click submarket for details panel.
- **2D stacking plan** (tier 2 right): floor grid for a selected property.
  Rows = floors, cells = suites, colored by occupancy status (occupied,
  vacant, expiring). Hover reveals WALT, RSF, tenant, lease expiration.
- **Financial table** (tier 3 left): market statistics table matching CBRE
  reference structure. Sticky header, tabular numerics, sorting, class and
  submarket breakdown.
- **What-if scenario controls** (tier 3 right): sliders for interest rate,
  rent growth, cap rate shift. Chart showing actual vs. simulated curves.
  Scenario results stored in SQLite and exported to
  `data/scenario-results.json`.
- **Key metrics banner**: 5 hero metrics with directional arrows at the top
  of the workspace.

Non-goals:

- No 3D rendering (MVP uses 2D).
- No real-time external data feeds.

Acceptance criteria:

- All five module cards render with real data from an imported workspace.
- Financial table matches the column structure of the CBRE reference report.
- Scenario sliders update the chart and downstream values.
- 2D map shows submarket boundaries with correct metric coloring.
- 2D stacking plan shows floors and suites with correct occupancy colors.
- Pin-to-report works on synthesis cards and is reflected in report state.

Verification: visual comparison against concept artwork. Data accuracy check
against imported CSV.

---

### Milestone 7: AI Integration

Owner: Chief Backend and Data Agent.

Goal: Built-in AI synthesis and external AI bridge.

Dependencies: Milestone 6.

Scope:

- **Built-in AI**: configurable API provider (Anthropic, OpenAI) in settings.
  Generate synthesis cards from market data. Generate narrative drafts for
  report sections. Provider selection and API key management in settings.
  Graceful degradation when no provider is configured.
- **External AI bridge**: WORKSPACE.md manifest auto-generation on save.
  Data export to `data/*.json` on save. External change detection on app
  focus (check `narratives/` and `notes/` modification timestamps). Import
  dialog with diff preview for externally modified files.
- AI synthesis card refresh: re-generate cards when data changes or on
  analyst demand.

Non-goals:

- No local/on-device model support in MVP.
- No AI evaluation or quality scoring.

Acceptance criteria:

- With an Anthropic API key configured, the app generates synthesis cards
  from market statistics data.
- The app generates a narrative draft for the market-overview section.
- Without an API key, the app works normally; AI features show
  "Configure AI provider in Settings."
- An external tool (Claude Desktop) can open the workspace folder, read
  WORKSPACE.md, read data files, and write a narrative to
  `narratives/availability.md`.
- On returning to the app, the analyst sees "External changes detected"
  and can preview and import the narrative.

Verification: end-to-end test of both AI paths with the Atlanta workspace.

---

### Milestone 8: Report Assembly and Export

Owner: Chief Reporting Agent + Chief Product and Frontend Agent.

Goal: Assemble pinned modules and narratives into an exportable report.

Dependencies: Milestones 6 and 7.

Scope:

- Report assembly panel (sidebar or drawer): shows pinned modules and
  narrative sections in order.
- Section ordering via drag-and-drop or move-up/move-down.
- Narrative editor: inline markdown editing for report sections.
- Exhibit embedding: charts, tables, and maps rendered as static images
  or HTML blocks in the report.
- Key metrics banner on report cover page.
- Report preview: full-page preview of the assembled report.
- PDF export via Chromium print-to-PDF.
- Export to `exports/` folder in workspace.
- Report metadata: title, quarter, market, property type, generated date.

Non-goals:

- No multi-author collaboration.
- No approval workflow.
- No presentation/deck export.
- No HTML report package (PDF only in MVP).

Acceptance criteria:

- Analyst can assemble a report from pinned synthesis cards, financial
  table, map screenshot, stacking plan, and scenario chart.
- Report sections can be reordered.
- Narratives can be edited inline.
- PDF export produces a readable report with correct formatting, tabular
  numerics, and embedded exhibits.
- Exported PDF is saved to `exports/` in the workspace folder.
- Report quality is comparable to the CBRE reference report in structure
  and density (not branding).

Verification: export a test report and compare structure against the CBRE
reference. Check numeric alignment, chart readability, and section flow.

---

### Milestone 9: Polish, Packaging, and Release Prep

Owner: Chief Implementation Agent.

Goal: Production-ready Windows release.

Dependencies: Milestone 8.

Scope:

- Windows installer polish (icon, metadata, start menu entry).
- Auto-update mechanism (electron-updater or similar).
- Error handling and crash reporting.
- Performance optimization for large workspaces.
- Keyboard shortcuts for common actions.
- Empty-state designs for new workspaces.
- Loading states and skeleton screens.
- Accessibility pass (keyboard navigation, screen reader labels, contrast).
- User-facing settings (AI provider, default market, workspace location).

Acceptance criteria:

- Installer runs cleanly on a fresh Windows machine.
- App handles 10+ workspaces with 1000+ property records without
  noticeable slowdown.
- All interactive elements are keyboard-accessible.
- Auto-update downloads and applies an update.

---

### Milestone 10+: Post-MVP (Finished Product)

These are scoped after MVP ships. Priority order TBD.

- **3D market map**: replace 2D map with deck.gl or Three.js interactive 3D
  geospatial visualization. Extruded building footprints, rotation, zoom.
  See Three.js skills reference in `docs/design/quarterline-v2-design-goals.md`.
- **3D stacking plan**: replace 2D grid with Three.js 3D building
  cross-section. Floors as stacked layers, hover/click interaction.
- **Mac/Linux packaging**: electron-builder targets for macOS (.dmg) and
  Linux (.AppImage/.deb).
- **Team sync and collaboration**: hosted workspace backup, shared report
  review, multi-user permissions.
- **External data connectors**: CoStar, RCA, or other CRE data providers.
- **HTML report package**: exportable HTML report with interactive charts.
- **Presentation export**: PowerPoint/Google Slides deck generation.
- **Local AI model support**: on-device inference for offline AI features.
- **Workspace encryption**: encrypted source files and optional encrypted
  data exports.
- **Audit log viewer**: in-app audit trail for compliance.
