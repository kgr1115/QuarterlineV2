# Agent Handoff

Date: 2026-05-09

## Current Product State

QuarterlineV2 is a downloadable desktop app for institutional CRE research
and reporting. Implementation is underway. Milestones 0-3 are complete.
M4 (Workspace Management and Navigation) and M5 (Data Ingestion and
Storage) both have implementations landed and are awaiting a Windows
smoke test before being marked complete.

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

- **Milestones 0-3 complete; M4 + M5 implementations landed (pending verification).**
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

**M4 (Workspace Management and Navigation)** and **M5 (Data Ingestion and
Storage)** are both in progress. Implementations landed 2026-05-09 and the
data layer was verified the same day by `npm run smoke-test` (31/31
checks). What remains is a manual GUI walkthrough. The next session should
either run that walkthrough and promote both milestones to **Complete**,
or start Milestone 6 (Analysis Modules) in parallel — the M6 work doesn't
depend on the GUI verification of M4/M5.
