# Architecture

Date: 2026-05-09

## Current Status

QuarterlineV2 architecture is not implemented. This document records the
approved architecture direction. See `docs/decision-log.md` for the full
decision records.

No app source, package files, scripts, runtime config, or desktop shell exist in
this repository yet.

## Target Product Shape

- Downloadable desktop app (Electron).
- Windows-first packaging. Mac/Linux optional later.
- Multi-workspace: each analyst can maintain multiple workspaces (one per market
  or research context).
- Local-first workspace data with file-based content for AI bridge access.
- Optional hosted sync and collaboration in a later phase.
- Dual AI model: built-in API-backed AI + external AI bridge.
- Strong confidentiality boundaries for source files.
- Report/PDF export as a first-class local workflow.

## Runtime: Electron

Electron was selected for its bundled Chromium renderer (consistent 3D, chart,
and dense-table rendering), mature Node.js backend (AI SDK integration,
SQLite, file system access), built-in print-to-PDF, and battle-tested desktop
packaging ecosystem.

Process model:

- **Main process**: Node.js. Owns file system, local database, AI API calls,
  workspace management, window lifecycle, auto-update.
- **Renderer process**: Chromium. Owns the UI, chart rendering, map/stacking
  modules, report preview.
- **Preload script**: Exposes a minimal, typed IPC bridge between renderer and
  main. No direct Node.js access from the renderer (contextIsolation: true).

## AI Architecture: Dual Model

### Built-in AI

The app can call AI APIs (Anthropic, OpenAI) from the main process to generate
synthesis cards, scenario narratives, and structured summaries. This is
optional and configurable. The app must function without an AI provider
configured.

### External AI Bridge

The workspace folder is structured so that external AI tools (Claude Desktop,
Codex, or any agent that can read a folder) can:

- Read a workspace manifest that describes the folder structure.
- Read market data, property data, and financial tables in JSON or CSV.
- Read and write report narrative sections in markdown.
- Read analyst notes and evidence items.

The app detects external changes on focus/reopen and offers to import them.

Requirements for the bridge:

- A `WORKSPACE.md` or similar manifest in each workspace folder that describes
  the structure to an AI agent.
- Key content stored in human-readable files alongside the local database.
- Clear separation between files the AI bridge may write (narratives, notes) and
  files it should not modify (database, source files, config).

## Local-First Data Direction

### Database

SQLite (via better-sqlite3 in the main process) for structured data: workspace
metadata, portfolio/asset/property records, market statistics, financial
metrics, scenario parameters, report pin state, audit events.

### File-Based Content

Alongside the database, each workspace folder contains human-readable files:

- `narratives/` — markdown files for report sections (AI-writable).
- `data/` — JSON or CSV exports of market/property data (AI-readable).
- `sources/` — ingested source files with confidentiality boundaries.
- `notes/` — analyst notes in markdown.
- `exports/` — generated report artifacts (PDF, HTML).

### Decisions Still Needed

- Source-file retention and cleanup rules.
- Encryption expectations for source files at rest.
- Backup and restore model.
- Snapshot/export format for workspace portability.
- Sync-ready identifier scheme for future hosted collaboration.

## Service Boundaries

Hosted services are additive, not required for the base desktop app.

Potential future service boundaries:

- AI narrative generation (built-in AI covers this locally first).
- Team sync.
- Hosted workspace backup.
- Shared report review.
- External data connectors.
- Authentication and entitlement.

## Frontend Architecture Direction

Implementation should preserve the design target in
`docs/design/quarterline-v2-design-goals.md`.

UI regions:

- Electron app frame with native-window controls.
- Persistent portfolio/workspace sidebar.
- Global filter bar.
- AI synthesis tier.
- Market overview (2D map in MVP, 3D in finished product).
- Property stacking plan (simplified in MVP, 3D in finished product).
- Financial table.
- What-if simulation panel.
- Report pinning and assembly queue.

Renderer stack (candidate, not yet decided):

- React for UI framework.
- Deck.gl or Three.js for future 3D modules.
- A charting library for time-series and statistical charts.
- CSS grid or a layout engine for the panel system.

## Verification Direction

Future implementation should verify:

- Desktop app starts from a packaged/dev Electron shell.
- Multiple workspaces can be created, opened, and switched.
- Core local workspace opens offline.
- Confidential file boundaries are respected.
- Dense table typography remains aligned.
- Scenario sliders update local state.
- Report pinning changes a real report assembly queue.
- Export path produces a reviewable report artifact.
- External AI bridge: an agent can open a workspace folder, read the manifest,
  and produce a markdown narrative that the app imports correctly.
