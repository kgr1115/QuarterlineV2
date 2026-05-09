# Agent Handoff

Date: 2026-05-09

## Current Product State

QuarterlineV2 is a downloadable desktop app for institutional CRE research
and reporting. Implementation is underway. Milestones 0-3 are complete and
M4 (Workspace Management and Navigation) has its implementation landed and
is awaiting a Windows smoke test before being marked complete.

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

- **Milestones 0-3 complete; M4 implementation landed (pending verification).**
- Project structure: `src/main/`, `src/preload/`, `src/renderer/`, `src/shared/`.
- Main process modules:
  - `index.ts` — window lifecycle, window-state save/restore, last-workspace
    restore.
  - `paths.ts` — central path helpers for `~/.quarterline/`.
  - `app-config.ts` — read/write `~/.quarterline/config.json`.
  - `workspace-manager.ts` — workspace lifecycle, slug generation, folder
    initialization, active-workspace state.
  - `workspace-db.ts` — per-workspace SQLite schema and helpers.
  - `workspace-manifest.ts` — `WORKSPACE.md` renderer.
  - `ipc-handlers.ts` — registers all IPC channels.
- Preload exposes `window.quarterline` with `ping`, `dbStatus`, `workspace.*`,
  and `windowState.*` namespaces.
- Renderer:
  - `state/workspace.tsx` — `WorkspaceProvider` and `useWorkspace` hook.
  - `components/WorkspaceSwitcher.tsx` — sidebar dropdown for switching.
  - `components/CreateWorkspaceDialog.tsx` — modal for new workspaces.
  - Sidebar, FilterBar, WorkspaceArea, StatusBar updated to consume the
    workspace context.
- Per-workspace folder layout (created on first save):
  `WORKSPACE.md`, `workspace.db`, `data/`, `narratives/` (with `custom/`),
  `notes/`, `sources/`, `exports/`, `.quarterline/`.
- Build: electron-vite for dev/build, electron-builder for Windows packaging.
- Tooling: ESLint (typescript-eslint), Prettier.

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

## Active Milestone

**Milestone 4: Workspace Management and Navigation** is in progress.
Implementation landed 2026-05-09; the next agent (or this one in the next
session) should run a Windows smoke test against the acceptance criteria in
`docs/milestones.md`, then promote the milestone to **Complete** and start
Milestone 5 (Data Ingestion and Storage).
