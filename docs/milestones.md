# Milestones

Date: 2026-05-09

## Purpose

This file defines the QuarterlineV2 milestone flow. Milestones are sequenced
so each builds on the last. No V1 milestone history applies.

## Current Phase

Status: Implementation. Milestones 0-6 complete. Milestone 7 (AI
Integration) is **in progress**.

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

Status: **Complete.** Verified 2026-05-09 (backend via
`npm run smoke-test` 31/31, GUI via manual walkthrough on Windows).

Deliverables:

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

Acceptance criteria (all met 2026-05-09):

- Analyst created "Atlanta Office Q2 2026" through the create-workspace
  modal — the workspace appeared in the sidebar switcher.
- Switching to the workspace loaded the context (status bar and filter
  bar updated live with market, quarter, property type).
- Closing the app and relaunching restored the workspace and window
  bounds.
- `WORKSPACE.md` exists in the workspace folder with the correct context
  block.
- Folder layout (`data/`, `narratives/`, `notes/`, `sources/`, `exports/`,
  `.quarterline/`) created at workspace creation time.
- `npm run smoke-test` (Electron-runtime, 31/31 checks) covers the
  programmatic acceptance.

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

Status: **Complete.** Verified 2026-05-09 (backend via
`npm run smoke-test` 31/31, GUI via manual walkthrough on Windows).

Deliverables:

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

Acceptance criteria (all met 2026-05-09):

- Analyst imported the Atlanta market statistics CSV and saw 4 rows in
  the Data Studio Market Stats tab. `data/market-statistics.json` was
  generated matching the schema in `docs/ai-bridge-spec.md`.
- Submarket stats CSV import produced 5 rows and
  `data/submarket-statistics.json`.
- Property + lease JSON import produced 3 properties and 3 leases plus
  `data/property-data.json` and `data/lease-data.json`.
- `WORKSPACE.md` "Current Data Summary" auto-populated with row counts,
  averaged headline metrics, and top submarkets.
- Data persisted across app restarts (verified by relaunching and seeing
  the same rows).
- A malformed CSV (missing required `Property Class` column) was
  rejected with header-level errors and no DB writes.
- Source file ingestion path lands files under `<workspace>/sources/`
  and never exposes them in `data/*.json` or `WORKSPACE.md`.
- `npm run smoke-test` (Electron-runtime, 31/31 checks) covers the
  programmatic acceptance.

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

Status: **Complete.** Verified 2026-05-09 (GUI walkthrough on Windows
confirmed all six modules render and respond correctly with the
imported Atlanta data; two issues found and fixed: missing CSP
allowance for OSM tiles, and scenario chart layout that hid the
interest-rate / cap-rate impact).

Tech choices (see `docs/decision-log.md`):

- 2D map: Leaflet (+ react-leaflet bridge).
- Charts: Apache ECharts (+ echarts-for-react bridge).
- Atlanta submarket boundaries: hand-authored simplified GeoJSON for
  the five submarkets in the sample data; real boundary library is a
  later concern (see `docs/market-boundary-library.md`).

Deliverables:

- Schema migration `0005-synthesis-cards-and-scenarios` adds
  `ai_synthesis_card`, `scenario`, and `report_pin` tables.
- New IPC channels: `analysis:headline-metrics`,
  `analysis:list-synthesis`, `analysis:create-synthesis`,
  `analysis:list-scenarios`, `analysis:save-scenario`,
  `analysis:delete-scenario`, `report:list-pins`,
  `report:toggle-pin`. Pin toggle keeps `ai_synthesis_card.pinned` in
  sync with the `report_pin` table for synthesis-type modules.
- Renderer modules under `src/renderer/src/components/modules/`:
  - `KeyMetricsBanner.tsx` — five hero metrics (availability rate, net
    absorption, deliveries, under construction, asking rate) computed
    from the imported market-stat rows. Directional arrows show sign
    for absorption.
  - `SynthesisCards.tsx` — three-card tier with manual-author flow
    (M7 will wire AI-generated cards). Empty state explains the
    manual + external-AI paths. Per-card pin toggle.
  - `MarketMap.tsx` — Leaflet map with OSM tiles, joins
    `atlanta-submarkets.geojson` with `submarket_statistic` rows,
    colors polygons by a selected metric (vacancy / availability /
    asking rate / net absorption). Click-to-select shows a detail
    panel below the map. Falls back to a placeholder for
    non-Atlanta markets.
  - `StackingPlan.tsx` — property selector + floor grid, cells
    colored occupied / expiring (≤12 months) / vacant. Hover tooltip
    shows tenant, suite, RSF, expiration, WALT.
  - `FinancialTable.tsx` — dense CBRE-style table with By-Class /
    By-Submarket toggle, sticky header, weighted-average totals
    footer, pin button.
  - `ScenarioControls.tsx` — three sliders (interest-rate shift,
    rent growth, cap-rate shift), ECharts dual-axis chart with rent
    curve and an Implied Value Index curve. The value index combines
    all three drivers (rent growth lifts top-line, cap-rate shift
    compresses asset value, rate shift drags via debt service).
    Save / update / select-existing scenario flow, pin button.
- WorkspaceArea now composes: KeyMetricsBanner above three tier rows
  (synthesis cards, then map+stacking, then financial+scenario).
- Sample asset: bundled `src/renderer/src/data/atlanta-submarkets.geojson`
  with five hand-authored simplified polygons; copy lives under
  `docs/reference-artifacts/samples/` as a documented fixture.

Acceptance criteria (all met 2026-05-09):

- Key metrics banner shows live values (availability ~21%, net absorption
  ~1K SF, asking rate ~$43.50/SF) computed from the imported Atlanta
  market stats.
- Atlanta submarket polygons render on a Leaflet map with OSM tile
  basemap; clicking a polygon opens a detail panel.
- Stacking plan renders floors and tenant cells for a selected
  property with proper occupancy coloring and hover tooltips.
- Financial table renders the imported rows with weighted-average
  totals; the By-Submarket toggle works.
- All three scenario sliders visibly move the chart (rent growth
  moves the indigo rent line; all three move the magenta value-index
  line on the right axis).
- Pin buttons toggle entries in the `report_pin` table.
- `npm run smoke-test` still 31/31 (migrations apply cleanly).

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

Status: **In progress.** Started 2026-05-09. Implementation landed the
same day. The user has indicated they will not test live API calls
until later — once they do and the configured provider successfully
generates cards, this milestone can be promoted to **Complete**.

Tech choices (see `docs/decision-log.md`):

- AI provider: Anthropic only at launch (`@anthropic-ai/sdk` v0.x),
  behind an internal `AiProviderAdapter` interface so OpenAI can drop
  in later.
- Default model: `claude-opus-4-7` with `thinking: {type: "adaptive"}`
  and `output_config: {effort: "medium"}` per the `claude-api` skill.
- API key storage: Electron `safeStorage` (OS keychain — DPAPI on
  Windows). Plaintext keys are never written to disk; if encryption
  is unavailable the Settings UI surfaces the error rather than
  falling back to plaintext.
- Synthesis card generation: structured outputs via Zod schemas with
  `messages.parse()`.
- Prompt caching: `cache_control: {type: "ephemeral"}` on the frozen
  system prompts so repeat synthesis / narrative requests are cheap.

Work to date:

- App config (`~/.quarterline/config.json`) gained an `ai` field with
  `{provider, encryptedApiKey, model}`. The encrypted key is stored
  base64-encoded; only decrypted in-process when dispatching a
  request.
- New main-process modules:
  - `ai-config.ts` — read/write/clear AI config; surfaces
    `encryptionAvailable`.
  - `ai-provider.ts` — the adapter interface + shared types
    (`SynthesisCardDraft`, `SynthesisGenerationInput/Result`,
    `NarrativeGenerationInput/Result`).
  - `ai-anthropic.ts` — Anthropic adapter. Implements `testConnection`,
    `generateSynthesis` (Zod-typed structured output of 3–5 cards
    matching the CBRE-style synthesis taxonomy), and
    `generateNarrative` (markdown for a named report section). Uses
    typed exception classes (`Anthropic.AuthenticationError`,
    `RateLimitError`, etc.) for clean error surfacing.
  - `ai-dispatcher.ts` — picks the configured adapter, gathers
    workspace data from SQLite, calls the adapter, inserts cards
    into `ai_synthesis_card` with `source = 'built-in-ai'`. Also
    exposes narrative generation (no UI yet; ready for M8 report
    assembly to call).
  - `external-bridge.ts` — scans `narratives/` and `notes/` for
    markdown changes since the last acknowledged scan. Tracks state
    in `<workspace>/.quarterline/last-scan.json` (sha256 + mtime +
    size per file). Emits created / modified / deleted events with
    text previews.
- New IPC channels (and preload bindings): `ai:get-config`,
  `ai:save-config`, `ai:clear-config`, `ai:test-connection`,
  `ai:generate-synthesis`, `bridge:scan-changes`,
  `bridge:ack-changes`.
- Renderer:
  - `SettingsView.tsx` — provider config form (API key + model),
    test-connection button, clear-key button, status panel showing
    encryption availability + key status. Routed via the existing
    sidebar `Settings` nav item.
  - `SynthesisCards.tsx` — when an AI provider is configured, the
    empty state and the add-tile both show a `✦ Generate` button
    that calls the dispatcher and refreshes the card list.
    Generation errors render in a banner above the tier row.
  - `ExternalChangesBanner.tsx` — scans on workspace open and on
    window focus; renders a banner above the workspace area listing
    created / modified / deleted markdown files in `narratives/`
    and `notes/` with previews. "Acknowledge all" calls
    `bridge:ack-changes`, snapshotting the current state.
- Verified: `npm run build` clean, `npx tsc --noEmit` clean for both
  tsconfigs, `npm run smoke-test` 32/32 (data layer untouched).

Pending verification (live API call by user):

- Open Settings → AI Provider, paste an Anthropic API key, save.
  Expect: success banner; status changes to "◉ Yes (encrypted)".
- Click "Test connection" — expect success banner.
- In Portfolio view, click `✦ Generate` on the synthesis card tier.
  Expect: 3–5 cards appear, each with `source = 'built-in-ai'` and
  cited numbers from the imported Atlanta market stats.
- Externally edit a file under
  `<workspace>/narratives/market-overview.md` (e.g. via Claude
  Desktop or VS Code), then refocus the QuarterlineV2 window.
  Expect: external-changes banner appears with the diff preview.
  Click "Acknowledge all" to clear it.

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
